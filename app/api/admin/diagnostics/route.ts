import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "../../../../lib/admin-auth";
import { adminRecipients, createMailer, describeMailError, mailEnv, maskEmail } from "../../../../lib/mailer";
import { getStorage } from "../../../../lib/storage-env";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

type QuoteLite = { created_at?: string; mail_admin?: boolean; mail_customer?: boolean };

async function readQuotes(): Promise<{ ok: boolean; quotes: QuoteLite[]; error?: string }> {
  const st = getStorage();
  if (!st) return { ok: false, quotes: [], error: "Stockage non configuré sur le serveur." };
  try {
    const url = await getSignedUrl(st.s3, new GetObjectCommand({ Bucket: st.bucket, Key: "quotes.json" }), { expiresIn: 60 });
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { ok: true, quotes: [] };
    if (!res.ok) return { ok: false, quotes: [], error: `Lecture des devis impossible (${res.status}).` };
    const data = (await res.json()) as { quotes?: QuoteLite[] };
    return { ok: true, quotes: Array.isArray(data.quotes) ? data.quotes : [] };
  } catch (e) {
    return { ok: false, quotes: [], error: describeMailError(e) };
  }
}

/** Vérifie la configuration sans rien envoyer à un client. */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();

  const env = mailEnv();
  let verified = false;
  let smtpError: string | null = null;
  if (!env.configured) {
    smtpError = !env.user && !env.hasPass ? "SMTP_USER et SMTP_PASS sont absents sur le serveur." : !env.user ? "SMTP_USER est absent sur le serveur." : "SMTP_PASS est absent sur le serveur.";
  } else {
    try {
      const { transporter } = createMailer();
      await transporter.verify();
      verified = true;
    } catch (e) {
      smtpError = describeMailError(e);
    }
  }

  const q = await readQuotes();
  const withStatus = q.quotes.filter((x) => typeof x.mail_admin === "boolean");
  const dates = q.quotes.map((x) => x.created_at || "").filter(Boolean).sort();

  return NextResponse.json(
    {
      smtp: {
        configured: env.configured,
        user: env.user ? maskEmail(env.user) : null,
        recipients: env.user ? maskEmail(adminRecipients(env.user)) : null,
        verified,
        error: smtpError,
      },
      storage: { ok: q.ok, error: q.error ?? null },
      quotes: {
        total: q.quotes.length,
        lastAt: dates.length ? dates[dates.length - 1] : null,
        tracked: withStatus.length,
        adminMailFailed: withStatus.filter((x) => x.mail_admin === false).length,
        customerMailFailed: withStatus.filter((x) => x.mail_customer === false).length,
      },
    },
    { headers: NO_STORE },
  );
}

/** Envoie un e-mail de test aux destinataires admin uniquement (jamais à un client). */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  try {
    const { user, transporter } = createMailer();
    const to = adminRecipients(user);
    await transporter.sendMail({
      from: `"Calirotis" <${user}>`,
      to,
      subject: "✅ Test d'envoi des e-mails – Calirotis",
      text: "Si vous lisez ce message, l'envoi des e-mails du site fonctionne.",
      html: "<p style=\"font-family:Arial,sans-serif;font-size:16px\">✅ <strong>Test réussi.</strong> Si vous lisez ce message, l'envoi des e-mails du site Calirotis fonctionne.</p>",
    });
    return NextResponse.json({ ok: true, to: maskEmail(to) }, { headers: NO_STORE });
  } catch (e) {
    return NextResponse.json({ ok: false, error: describeMailError(e) }, { status: 502, headers: NO_STORE });
  }
}
