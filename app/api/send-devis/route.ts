import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getStorage, storageConfigErrorJson, type StorageContext } from "../../../lib/storage-env";

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

function formatList(values: string[]): string {
  return values.filter(Boolean).join(", ") || "Aucun";
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function createEmailLayout(params: {
  title: string;
  intro: string;
  infoRowsHtml: string;
  menuRowsHtml: string;
  messageHtml: string;
}) {
  const logoUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    ? `${process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "")}/Logo.png`
    : "";
  const safeLogoUrl = escapeHtml(logoUrl);
  return `
    <div style="margin:0; padding:0; background:#fff7f0; font-family: Arial, Helvetica, sans-serif; color:#2c1c0f;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:24px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="width:100%; max-width:640px; background:#ffffff; border-radius:16px; border:1px solid #f3dcc8; overflow:hidden;">
              <tr>
                <td style="padding:24px; background:linear-gradient(135deg, #ffedd5, #ffe4cc); border-bottom:1px solid #f3dcc8;">
                  ${
                    safeLogoUrl
                      ? `<img src="${safeLogoUrl}" alt="Logo Calirotis" width="120" style="display:block; margin:0 auto 12px auto;" />`
                      : ""
                  }
                  <p style="margin:0; text-align:center; color:#92400e; font-size:13px; letter-spacing:0.04em; text-transform:uppercase;">Calirotis</p>
                  <h1 style="margin:10px 0 0 0; text-align:center; font-size:24px; line-height:1.3; color:#7c2d12;">${escapeHtml(params.title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 18px 0; font-size:15px; line-height:1.6; color:#3f2a17;">${escapeHtml(params.intro)}</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px; background:#fffbf8; border:1px solid #f6e5d6; border-radius:12px;">
                    <tr>
                      <td style="padding:14px 16px;">
                        <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold; color:#9a3412;">Informations</p>
                        ${params.infoRowsHtml}
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px; background:#fffbf8; border:1px solid #f6e5d6; border-radius:12px;">
                    <tr>
                      <td style="padding:14px 16px;">
                        <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold; color:#9a3412;">Repas choisi</p>
                        ${params.menuRowsHtml}
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fffbf8; border:1px solid #f6e5d6; border-radius:12px;">
                    <tr>
                      <td style="padding:14px 16px;">
                        <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold; color:#9a3412;">Message</p>
                        <p style="margin:0; font-size:14px; line-height:1.6; color:#3f2a17;">${params.messageHtml}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px; border-top:1px solid #f3dcc8; background:#fff7f0;">
                  <p style="margin:0 0 6px 0; color:#5f3e1f; font-size:13px;">Calirotis</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function createInfoRow(icon: string, label: string, value: string): string {
  return `<p style="margin:0 0 8px 0; font-size:14px; line-height:1.5;"><span style="font-size:14px; margin-right:6px;">${icon}</span><strong>${escapeHtml(label)} :</strong> ${escapeHtml(value)}</p>`;
}

function createMailer() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) {
    throw new Error("Configuration e-mail manquante : ajoutez SMTP_USER et SMTP_PASS.");
  }
  return {
    user,
    transporter: nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    }),
  };
}

/** Destinataire(s) des nouvelles demandes. Par défaut le compte SMTP lui-même. */
function adminRecipients(fallback: string): string {
  const raw = (process.env.QUOTE_RECIPIENTS || process.env.ADMIN_EMAIL || "").trim();
  return raw || fallback;
}

async function sendQuoteEmails(quote: QuoteRequest) {
  const { user, transporter } = createMailer();
  const customerName = `${quote.first_name} ${quote.last_name}`.trim();
  const starters = formatList(quote.starters_labels || []);
  const mainDish = quote.main_dish_label?.trim() || quote.main_dish;
  const desserts = formatList(quote.desserts_labels || []);
  const eventDate = quote.event_date || "Non précisée";
  const eventPlace = quote.event_place || "Non précisé";
  const message = quote.message?.trim() || "Aucun message complémentaire.";
  const messageHtml = escapeHtml(message).replace(/\n/g, "<br />");
  const createdAt = new Date(quote.created_at).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const summaryText = [
    `Nom : ${customerName}`,
    `Email : ${quote.email}`,
    `Téléphone : ${quote.phone || "Non renseigné"}`,
    `Date : ${eventDate}`,
    `Lieu : ${eventPlace}`,
    `Nombre de personnes : ${quote.number_of_people || 0}`,
    `Entrées : ${starters}`,
    `Plat principal : ${mainDish || "Non renseigné"}`,
    `Desserts : ${desserts}`,
    `Message : ${message}`,
  ].join("\n");

  const infoRowsHtml =
    createInfoRow("👤", "Nom", customerName || "Non renseigné") +
    createInfoRow("✉️", "Email", quote.email) +
    createInfoRow("📞", "Téléphone", quote.phone || "Non renseigné") +
    createInfoRow("📅", "Date de l'événement", eventDate) +
    createInfoRow("📍", "Lieu", eventPlace) +
    createInfoRow("👥", "Nombre de personnes", `${quote.number_of_people || 0}`) +
    createInfoRow("🕒", "Demande reçue le", createdAt);

  const menuRowsHtml =
    createInfoRow("🥗", "Entrées", starters) +
    createInfoRow("🍽️", "Plat principal", mainDish || "Non renseigné") +
    createInfoRow("🍰", "Desserts", desserts);

  const adminHtml = createEmailLayout({
    title: "Nouvelle demande de devis",
    intro: "Une nouvelle demande de devis vient d'être envoyée via le site.",
    infoRowsHtml,
    menuRowsHtml,
    messageHtml
  });

  const customerHtml = createEmailLayout({
    title: "Votre demande de devis a bien été reçue",
    intro: `Bonjour ${quote.first_name}, votre demande est enregistrée. Retrouvez ci-dessous toutes les informations transmises.`,
    infoRowsHtml,
    menuRowsHtml,
    messageHtml
  });

  const [adminResult, customerResult] = await Promise.allSettled([
    transporter.sendMail({
      from: `"Calirotis" <${user}>`,
      to: adminRecipients(user),
      replyTo: quote.email,
      subject: `Nouvelle demande de devis - ${customerName}`,
      text: `Une nouvelle demande de devis a été reçue.\n\n${summaryText}`,
      html: adminHtml,
    }),
    transporter.sendMail({
      from: `"Calirotis" <${user}>`,
      to: quote.email,
      subject: "Votre demande de devis a bien été reçue",
      text:
        `Bonjour ${quote.first_name},\n\n` +
        "Merci pour votre demande de devis auprès de Calirotis.\n" +
        "Nous avons bien reçu votre demande et nous reviendrons vers vous rapidement.\n\n" +
        "Récapitulatif :\n" +
        `${summaryText}\n\n` +
        "A bientôt,\nCalirotis",
      html: customerHtml,
    }),
  ]);
  if (customerResult.status === "rejected") {
    console.error("[send-devis] e-mail de confirmation client non envoyé", customerResult.reason);
  }
  if (adminResult.status === "rejected") {
    console.error("[send-devis] e-mail admin non envoyé", adminResult.reason);
    throw adminResult.reason;
  }
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
  if (!Number.isFinite(startedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FORM_AGE_MS) {
    console.warn("[send-devis] bot bloqué (délai de remplissage)", elapsed);
    return NextResponse.json({ ok: true });
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

  // On tente l'enregistrement ET l'e-mail séparément : si l'un des deux marche, la demande n'est pas perdue.
  let saved = false;
  let mailed = false;
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
  try {
    await sendQuoteEmails(newQuote);
    mailed = true;
  } catch (e) {
    console.error("[send-devis] envoi e-mail échoué", e);
  }

  if (!saved && !mailed) {
    return fail(
      "Votre demande n'a pas pu être envoyée suite à un problème technique. Merci de nous appeler au 06.99.51.22.90.",
      500,
    );
  }
  return NextResponse.json({ ok: true, id: newQuote.id, saved, mailed });
}
