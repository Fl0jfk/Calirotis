import nodemailer from "nodemailer";

export function mailEnv() {
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";
  return { user, hasPass: pass.length > 0, configured: Boolean(user && pass) };
}

export function createMailer() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) {
    throw new Error("Configuration e-mail manquante : SMTP_USER et/ou SMTP_PASS absents sur le serveur.");
  }
  return {
    user,
    transporter: nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      // Sans délais, un service de messagerie lent bloque la page « Envoi en cours… » pendant des minutes.
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
    }),
  };
}

/** Destinataire(s) des nouvelles demandes. Par défaut le compte SMTP lui-même. */
export function adminRecipients(fallback: string): string {
  const raw = (process.env.QUOTE_RECIPIENTS || process.env.ADMIN_EMAIL || "").trim();
  return raw || fallback;
}

export function maskEmail(value: string): string {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      const [name, domain] = v.split("@");
      if (!domain) return "***";
      return `${name.slice(0, 2)}***@${domain}`;
    })
    .join(", ");
}

/** Message d'erreur court et sans secret, utilisable dans l'admin. */
export function describeMailError(e: unknown): string {
  const err = e as { code?: string; responseCode?: number; message?: string };
  const msg = (err?.message || String(e)).replace(/\s+/g, " ").trim();
  const code = err?.code ? `[${err.code}] ` : "";
  return `${code}${msg}`.slice(0, 220);
}
