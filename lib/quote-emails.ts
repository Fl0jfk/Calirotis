export type QuoteEmailData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  event_date: string;
  event_place: string;
  number_of_people: number;
  starters_labels?: string[];
  main_dish: string;
  main_dish_label?: string;
  desserts_labels?: string[];
  message?: string | null;
  created_at: string;
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://calirotis.fr").replace(/\/$/, "");
const PHONE_DISPLAY = "06.02.20.85.40";
const PHONE_TEL = "+33602208540";
const INK = "#1a1a1a";
const SLATE = "#343a40";
const CREAM = "#fdfaf5";
const SAFRAN = "#f9b827";
const BRAISE = "#d7453a";
const BORDEAUX = "#8b1a1a";
const MUTED = "#868e96";
const TEXT = "#212529";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

function formatEventDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
  }
  return value;
}

function chips(values: string[]): string {
  const list = values.filter(Boolean);
  if (list.length === 0) return `<span style="color:${MUTED}; font-size:14px;">Aucun</span>`;
  return list
    .map(
      (v) =>
        `<span style="display:inline-block; margin:3px 6px 3px 0; padding:5px 13px; background:#fef3c7; border:2px solid ${INK}; border-radius:999px; font-size:13px; font-weight:bold; color:${INK};">${escapeHtml(v)}</span>`,
    )
    .join("");
}

function infoRow(label: string, valueHtml: string): string {
  return `<tr><td style="padding:7px 12px 7px 0; width:36%; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:${MUTED}; vertical-align:top; font-family:${SANS};">${escapeHtml(label)}</td><td style="padding:7px 0; font-size:15px; line-height:1.45; color:${TEXT}; vertical-align:top; font-family:${SANS};">${valueHtml}</td></tr>`;
}

function section(title: string, innerHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0; background:#ffffff; border:2px solid ${INK}; border-radius:14px;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 6px 0; font-family:${SERIF}; font-size:19px; color:${BORDEAUX};">${escapeHtml(title)}</p>${innerHtml}</td></tr></table>`;
}

function button(href: string, label: string, background: string, color = "#ffffff"): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block; margin:4px 6px 4px 0; padding:13px 26px; background:${background}; color:${color}; border:3px solid ${INK}; border-radius:999px; font-family:${SANS}; font-size:15px; font-weight:bold; text-decoration:none;">${escapeHtml(label)}</a>`;
}

function stepRow(n: number, text: string): string {
  return `<tr><td width="40" valign="top" style="padding:6px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" width="30" height="30" style="width:30px; height:30px; background:${SAFRAN}; border:2px solid ${INK}; border-radius:15px; font-family:${SERIF}; font-size:15px; font-weight:bold; color:${INK};">${n}</td></tr></table></td><td valign="middle" style="padding:6px 0; font-family:${SANS}; font-size:15px; line-height:1.45; color:${TEXT};">${text}</td></tr>`;
}

function emailShell(params: {
  preheader: string;
  kicker: string;
  title: string;
  intro: string;
  bodyHtml: string;
  footerNote: string;
}): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(params.title)}</title></head>
<body style="margin:0; padding:0; background:${CREAM};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(params.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM}; padding:24px 10px;">
    <tr><td align="center">
      <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%; max-width:620px; background:${CREAM}; border:3px solid ${INK}; border-radius:20px; overflow:hidden;">
        <tr><td align="center" style="background:${SLATE}; padding:30px 24px 26px 24px;">
          <img src="${SITE_URL}/Logo.png" alt="Calirotis" width="86" style="display:block; margin:0 auto 12px auto; border:0;" />
          <p style="margin:0 0 8px 0; font-family:${SANS}; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:${SAFRAN};">${escapeHtml(params.kicker)}</p>
          <h1 style="margin:0; font-family:${SERIF}; font-size:28px; line-height:1.25; color:#ffffff;">${escapeHtml(params.title)}</h1>
        </td></tr>
        <tr><td style="background:${BRAISE}; height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:26px 24px 10px 24px;">
          <p style="margin:0 0 20px 0; font-family:${SANS}; font-size:16px; line-height:1.6; color:${TEXT};">${params.intro}</p>
          ${params.bodyHtml}
        </td></tr>
        <tr><td align="center" style="background:${SLATE}; padding:20px 24px; font-family:${SANS}; font-size:12px; line-height:1.6; color:#ced4da;">
          <p style="margin:0 0 4px 0; color:#ffffff; font-family:${SERIF}; font-size:16px;">Calirotis · Rôtisserie événementielle</p>
          <p style="margin:0 0 6px 0;">10 allée du Roule, 27430 Saint-Pierre-du-Vauvray · <a href="tel:${PHONE_TEL}" style="color:${SAFRAN}; text-decoration:none;">${PHONE_DISPLAY}</a></p>
          <p style="margin:0; color:#868e96;">${escapeHtml(params.footerNote)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function buildQuoteEmails(quote: QuoteEmailData) {
  const customerName = `${quote.first_name} ${quote.last_name}`.trim();
  const starters = (quote.starters_labels || []).filter(Boolean);
  const mainDish = quote.main_dish_label?.trim() || quote.main_dish || "";
  const desserts = (quote.desserts_labels || []).filter(Boolean);
  const eventDate = quote.event_date ? formatEventDate(quote.event_date) : "Non précisée";
  const eventPlace = quote.event_place || "Non précisé";
  const people = quote.number_of_people || 0;
  const message = quote.message?.trim() || "";
  const messageHtml = escapeHtml(message).replace(/\n/g, "<br />");
  const createdAt = new Date(quote.created_at).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });
  const phoneTel = quote.phone.replace(/[^\d+]/g, "");

  const contactSection = section(
    "Coordonnées",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${
      infoRow("Nom", `<strong>${escapeHtml(customerName)}</strong>`) +
      infoRow("Téléphone", `<a href="tel:${escapeHtml(phoneTel)}" style="color:${BORDEAUX}; text-decoration:none; font-weight:bold;">${escapeHtml(quote.phone)}</a>`) +
      infoRow("E-mail", `<a href="mailto:${escapeHtml(quote.email)}" style="color:${BORDEAUX};">${escapeHtml(quote.email)}</a>`)
    }</table>`,
  );
  const eventSection = section(
    "Événement",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${
      infoRow("Date", `<strong>${escapeHtml(eventDate)}</strong>`) +
      infoRow("Lieu", escapeHtml(eventPlace)) +
      infoRow("Convives", `<strong>${people}</strong> personne${people > 1 ? "s" : ""}`)
    }</table>`,
  );
  const menuSection = section(
    "Menu choisi",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${
      infoRow("Entrées", chips(starters)) +
      infoRow("Plat principal", chips(mainDish ? [mainDish] : [])) +
      infoRow("Desserts", chips(desserts))
    }</table>`,
  );
  const messageSection = message
    ? section("Message", `<p style="margin:6px 0 0 0; font-family:${SANS}; font-size:15px; line-height:1.6; color:${TEXT};">${messageHtml}</p>`)
    : "";

  const summaryText = [
    `Nom : ${customerName}`,
    `Email : ${quote.email}`,
    `Téléphone : ${quote.phone || "Non renseigné"}`,
    `Date : ${eventDate}`,
    `Lieu : ${eventPlace}`,
    `Nombre de personnes : ${people}`,
    `Entrées : ${starters.join(", ") || "Aucune"}`,
    `Plat principal : ${mainDish || "Non renseigné"}`,
    `Desserts : ${desserts.join(", ") || "Aucun"}`,
    `Message : ${message || "Aucun message complémentaire."}`,
  ].join("\n");

  const adminHtml = emailShell({
    preheader: `${customerName} · ${people} pers. · ${eventDate}`,
    kicker: "Nouvelle demande de devis",
    title: `${customerName} — ${people} pers.`,
    intro: `Une nouvelle demande vient d'arriver depuis le site (${escapeHtml(createdAt)}). Répondre vite, c'est le meilleur moyen de la transformer en réservation.`,
    bodyHtml:
      `<p style="margin:0 0 18px 0;">${button(`tel:${phoneTel}`, `📞 Appeler ${quote.first_name}`, BRAISE)}${button(`mailto:${quote.email}?subject=${encodeURIComponent("Votre demande de devis Calirotis")}`, "✉️ Répondre", "#ffffff", INK)}</p>` +
      eventSection +
      contactSection +
      menuSection +
      messageSection,
    footerNote: "Notification automatique du formulaire de devis de calirotis.fr",
  });

  const customerHtml = emailShell({
    preheader: "Merci ! Votre demande est bien arrivée, on revient vers vous très vite.",
    kicker: "Demande bien reçue",
    title: `Merci ${quote.first_name} !`,
    intro: `Votre demande de devis est bien arrivée chez Calirotis. Martin l'étudie et revient vers vous rapidement avec une proposition sur-mesure pour votre événement. Voici le récapitulatif de ce que vous nous avez transmis.`,
    bodyHtml:
      eventSection +
      menuSection +
      messageSection +
      section(
        "Et maintenant ?",
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">${
          stepRow(1, "On étudie votre demande et on prépare votre proposition.") +
          stepRow(2, "On vous recontacte par téléphone ou par e-mail.") +
          stepRow(3, "On ajuste le menu ensemble, puis on s'occupe de tout le jour J.")
        }</table>`,
      ) +
      `<p style="margin:6px 0 14px 0; font-family:${SANS}; font-size:15px; line-height:1.6; color:${TEXT};">Une question, une précision à ajouter ? Répondez simplement à ce mail ou appelez-nous :</p>` +
      `<p style="margin:0 0 14px 0;">${button(`tel:${PHONE_TEL}`, `📞 ${PHONE_DISPLAY}`, BRAISE)}${button(SITE_URL, "Voir le site", "#ffffff", INK)}</p>`,
    footerNote: "Vous recevez ce message car une demande de devis a été faite sur calirotis.fr avec cette adresse e-mail.",
  });

  return {
    adminSubject: `🔥 Nouveau devis – ${customerName} – ${people} pers.${quote.event_date ? ` – ${eventDate}` : ""}`,
    adminText: `Une nouvelle demande de devis a été reçue le ${createdAt}.\n\n${summaryText}`,
    adminHtml,
    customerSubject: "Calirotis – on a bien reçu votre demande de devis 🐖",
    customerText:
      `Bonjour ${quote.first_name},\n\n` +
      "Merci pour votre demande de devis auprès de Calirotis.\n" +
      "Nous l'étudions et nous revenons vers vous rapidement avec une proposition sur-mesure.\n\n" +
      "Récapitulatif :\n" +
      `${summaryText}\n\n` +
      `Une question ? Appelez-nous au ${PHONE_DISPLAY}.\n\n` +
      "À bientôt,\nMartin - Calirotis",
    customerHtml,
  };
}
