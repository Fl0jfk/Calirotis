/** Détection des demandes de devis en double (un même client qui insiste ou renvoie le formulaire). */

export const DEDUPE_DAYS = 7;

type DedupeQuote = {
  id?: string;
  email: string;
  phone: string;
  event_date: string;
  event_place: string;
  number_of_people: number;
  main_dish: string;
  starters: string[];
  desserts: string[];
  message?: string | null;
  created_at: string;
  submission_id?: string;
};

export function normEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** 9 derniers chiffres : « 06 12 34 56 78 », « +33 6 12 34 56 78 » et « 0612345678 » deviennent identiques. */
export function normPhone(phone: string): string {
  return (phone.match(/\d/g) || []).join("").slice(-9);
}

export function contactKey(q: { email: string; phone: string }): string {
  return `${normEmail(q.email)}|${normPhone(q.phone)}`;
}

function sameContact(a: DedupeQuote, b: DedupeQuote): boolean {
  const ea = normEmail(a.email);
  const pa = normPhone(a.phone);
  return (ea !== "" && ea === normEmail(b.email)) || (pa.length >= 8 && pa === normPhone(b.phone));
}

const norm = (s: string | null | undefined) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");

function fingerprint(q: DedupeQuote): string {
  return JSON.stringify([
    norm(q.event_date),
    norm(q.event_place),
    q.number_of_people,
    q.main_dish,
    [...q.starters].sort(),
    [...q.desserts].sort(),
    norm(q.message),
  ]);
}

/** Dernière demande du même client dans la fenêtre de détection (la liste est triée du plus récent au plus ancien). */
export function findRecent<T extends DedupeQuote>(quotes: T[], incoming: DedupeQuote, now = Date.now()): T | undefined {
  const limit = DEDUPE_DAYS * 24 * 60 * 60 * 1000;
  return quotes.find((q) => {
    const t = new Date(q.created_at).getTime();
    return Number.isFinite(t) && now - t <= limit && sameContact(q, incoming);
  });
}

export type DupKind =
  | "retry" // même formulaire envoyé deux fois (double clic, nouvel essai automatique)
  | "same" // même demande renvoyée plus tard
  | "changed"; // le client a modifié sa demande

export function classify(existing: DedupeQuote, incoming: DedupeQuote): DupKind {
  if (incoming.submission_id && existing.submission_id && incoming.submission_id === existing.submission_id) return "retry";
  return fingerprint(existing) === fingerprint(incoming) ? "same" : "changed";
}
