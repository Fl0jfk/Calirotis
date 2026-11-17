import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getStorage, storageConfigErrorJson, type StorageContext } from "../../../lib/storage-env";
import { buildQuoteEmails } from "../../../lib/quote-emails";
import { adminRecipients, createMailer, describeMailError } from "../../../lib/mailer";

const KEY = "quotes.json";

type QuoteRequest = {
  id: string;
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  event_date: string;
  event_place: string;
  number_of_people: number;
  starters: string[];
  starters_labels?: string[];
  main_dish: string;
  main_dish_label?: string;
  desserts: string[];
  desserts_labels?: string[];
  message?: string | null;
  created_at: string;
  mail_admin?: boolean;
  mail_customer?: boolean;
  mail_error?: string;
};
type QuotesData = { quotes: QuoteRequest[] };

type NewQuote = {
  last_name?: string;
  first_name?: string;
  phone?: string;
  email?: string;
  event_date?: string;
  event_place?: string;
  number_of_people?: number;
  starters?: string[];
  starters_labels?: string[];
  main_dish?: string;
  main_dish_label?: string;
  desserts?: string[];
  desserts_labels?: string[];
  message?: string;
};

async function signedGet(st: StorageContext, key: string) {
  return getSignedUrl(st.s3, new GetObjectCommand({ Bucket: st.bucket, Key: key }), { expiresIn: 60 });
}

async function signedPut(st: StorageContext, key: string, contentType: string) {
  return getSignedUrl(
    st.s3,
    new PutObjectCommand({ Bucket: st.bucket, Key: key, ContentType: contentType }),
    { expiresIn: 60 },
  );
}

async function loadQuotes(st: StorageContext): Promise<QuotesData> {
  const url = await signedGet(st, KEY);
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return { quotes: [] };
  // Toute autre erreur : on refuse d'écrire, sinon on écraserait tous les devis existants.
  if (!res.ok) throw new Error(`Lecture des devis impossible (${res.status})`);
  const data = (await res.json()) as QuotesData;
  if (!Array.isArray(data.quotes)) throw new Error("Fichier des devis illisible");
  return data;
}

async function saveQuotes(st: StorageContext, data: QuotesData): Promise<void> {
  const uploadUrl = await signedPut(st, KEY, "application/json");
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data, null, 2),
  });
  if (!put.ok) throw new Error(`Échec écriture stockage (${put.status})`);
}

function quoteId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type MailStatus = { admin: boolean; customer: boolean; error?: string };

/** Envoie les deux e-mails. Ne lève jamais d'exception : renvoie le résultat de chacun. */
async function sendQuoteEmails(quote: QuoteRequest): Promise<MailStatus> {
  let mailer: ReturnType<typeof createMailer>;
  try {
    mailer = createMailer();
  } catch (e) {
    console.error("[send-devis] e-mails impossibles", e);
    return { admin: false, customer: false, error: describeMailError(e) };
  }
  const { user, transporter } = mailer;
  const mail = buildQuoteEmails(quote);
  const [adminResult, customerResult] = await Promise.allSettled([
    transporter.sendMail({
      from: `"Calirotis" <${user}>`,
      to: adminRecipients(user),
      replyTo: quote.email,
      subject: mail.adminSubject,
      text: mail.adminText,
      html: mail.adminHtml,
    }),
    transporter.sendMail({
      from: `"Calirotis" <${user}>`,
      to: quote.email,
      replyTo: adminRecipients(user),
      subject: mail.customerSubject,
      text: mail.customerText,
      html: mail.customerHtml,
    }),
  ]);
  const errors: string[] = [];
  if (adminResult.status === "rejected") {
    console.error("[send-devis] e-mail admin non envoyé", adminResult.reason);
    errors.push(`notification : ${describeMailError(adminResult.reason)}`);
  }
  if (customerResult.status === "rejected") {
    console.error("[send-devis] e-mail de confirmation client non envoyé", customerResult.reason);
    errors.push(`confirmation client : ${describeMailError(customerResult.reason)}`);
  }
  return {
    admin: adminResult.status === "fulfilled",
    customer: customerResult.status === "fulfilled",
    error: errors.length ? errors.join(" | ").slice(0, 300) : undefined,
  };
}

// ---------- Anti-bot ----------

const MIN_FILL_MS = 4000; // un humain met plus de 4 s à remplir le formulaire
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3; // 3 demandes / 10 min / IP
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
    });
  }
  return recent.length > RATE_MAX;
}

function looksLikeSpam(texts: string[]): boolean {
  const all = texts.join(" ");
  const links = all.match(/https?:\/\/|www\./gi)?.length || 0;
  if (links > 2) return true;
  if (/<a\s|\[url=|\[link=/i.test(all)) return true;
  return false;
}

// ---------- Validation ----------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
}

function strList(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim().slice(0, 200)).slice(0, 50)
    : [];
}

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

type IncomingBody = NewQuote & { website?: unknown; form_started_at?: unknown };

export async function POST(req: Request) {
  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return fail("Requête invalide");
  }
  if (!body || typeof body !== "object") return fail("Requête invalide");

  // Pot de miel : champ invisible pour les humains. On répond "ok" pour ne pas renseigner le bot.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    console.warn("[send-devis] bot bloqué (pot de miel)");
    return NextResponse.json({ ok: true });
  }
  const startedAt = Number(body.form_started_at);
  const elapsed = Date.now() - startedAt;
  // Délai de remplissage : un vrai visiteur dont la page est restée ouverte (ou trop ancienne) doit voir une
  // erreur claire, pas un faux « envoyé » qui ferait perdre sa demande.
  if (!Number.isFinite(startedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FORM_AGE_MS) {
    console.warn("[send-devis] envoi refusé (délai de remplissage)", elapsed);
    return fail(
      "Le formulaire a expiré ou a été envoyé trop vite. Merci de recharger la page puis de renvoyer votre demande, ou de nous appeler au 06.02.20.85.40.",
      400,
    );
  }
  if (rateLimited(clientIp(req))) {
    return fail("Trop de demandes envoyées. Merci de réessayer dans quelques minutes ou de nous appeler.", 429);
  }

  const lastName = str(body.last_name, 100);
  const firstName = str(body.first_name, 100);
  const email = str(body.email, 200);
  const phone = str(body.phone, 30);
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 3000) : "";
  const people = Math.floor(Number(body.number_of_people || 0));

  if (!lastName || !firstName || !email || !phone) return fail("Merci de remplir nom, prénom, téléphone et e-mail.");
  if (!EMAIL_RE.test(email)) return fail("Adresse e-mail invalide.");
  if ((phone.match(/\d/g) || []).length < 8) return fail("Numéro de téléphone invalide.");
  if (!Number.isFinite(people) || people < 1 || people > 10000) return fail("Nombre de personnes invalide.");
  if (looksLikeSpam([lastName, firstName, message, str(body.event_place, 300)])) {
    console.warn("[send-devis] bot bloqué (contenu suspect)");
    return NextResponse.json({ ok: true });
  }

  const newQuote: QuoteRequest = {
    id: quoteId(),
    last_name: lastName,
    first_name: firstName,
    phone,
    email,
    event_date: str(body.event_date, 30),
    event_place: str(body.event_place, 300),
    number_of_people: people,
    starters: strList(body.starters),
    starters_labels: strList(body.starters_labels),
    // Le plat principal peut être vide si la carte n'a pas pu être chargée (le client le décrit dans le message).
    main_dish: str(body.main_dish, 200),
    main_dish_label: str(body.main_dish_label, 200),
    desserts: strList(body.desserts),
    desserts_labels: strList(body.desserts_labels),
    message: message || null,
    created_at: new Date().toISOString(),
  };

  // 1) e-mails (délais bornés, jamais d'exception), 2) enregistrement avec le statut des e-mails.
  // Chacun est tenté séparément : si l'un des deux marche, la demande n'est pas perdue.
  const mail = await sendQuoteEmails(newQuote);
  newQuote.mail_admin = mail.admin;
  newQuote.mail_customer = mail.customer;
  if (mail.error) newQuote.mail_error = mail.error;

  let saved = false;
  const st = getStorage();
  if (st) {
    try {
      const quotesData = await loadQuotes(st);
      await saveQuotes(st, { quotes: [newQuote, ...quotesData.quotes] });
      saved = true;
    } catch (e) {
      console.error("[send-devis] enregistrement du devis échoué", e);
    }
  } else {
    console.error("[send-devis] stockage non configuré", storageConfigErrorJson().debug);
  }

  if (!saved && !mail.admin) {
    return fail(
      "Votre demande n'a pas pu être envoyée suite à un problème technique. Merci de nous appeler au 06.02.20.85.40.",
      500,
    );
  }
  return NextResponse.json({ ok: true, id: newQuote.id, saved, mailed: mail.admin, customerMailed: mail.customer });
}

