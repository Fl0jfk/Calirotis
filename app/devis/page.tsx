"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { WalkingPig } from "../components/WalkingPig";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  photo_url?: string | null;
  category: string;
  partner_name?: string | null;
  partner_url?: string | null;
  partner_logo_url?: string | null;
};
type MenuData = { items: MenuItem[] };
type QuotePayload = {
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  event_date: string;
  event_place: string;
  number_of_people: number;
  starters: string[];
  starters_labels: string[];
  main_dish: string;
  main_dish_label: string;
  desserts: string[];
  desserts_labels: string[];
  message?: string;
};
type SendResult = { ok?: boolean; saved?: boolean; mailed?: boolean; customerMailed?: boolean; duplicate?: boolean; updated?: boolean };
type Outcome = "new" | "duplicate" | "updated";
const SENT_KEY = "calirotis_devis_sent";
const SENT_DAYS = 7;

const PHONE_DISPLAY = "06.02.20.85.40";
const PHONE_TEL = "0602208540";
const GUEST_SHORTCUTS = [20, 50, 80, 100, 150];

function menuJsonUrl() {
  return "/api/public/menu";
}

function normalizeMenuCategory(raw: string): "starter" | "main_dish" | "dessert" {
  const lower = raw.trim().toLowerCase().replace(/-/g, "_");
  if (lower === "maindish" || lower === "main_dish") return "main_dish";
  if (lower === "dessert" || lower === "desserts") return "dessert";
  return "starter";
}

async function fetchMenu() {
  const r = await fetch(menuJsonUrl());
  if (!r.ok) return null;
  return (await r.json()) as MenuData;
}

async function sendDevis(body: Record<string, unknown>): Promise<SendResult> {
  const r = await fetch("/api/send-devis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.ok) {
    try {
      return (await r.json()) as SendResult;
    } catch {
      return {};
    }
  }
  let msg = "";
  try {
    const j = (await r.json()) as { error?: string };
    msg = j.error || "";
  } catch {
    /* réponse non JSON */
  }
  throw new Error(msg || `Votre demande n'a pas pu être envoyée. Merci de réessayer ou de nous appeler au ${PHONE_DISPLAY}.`);
}

function buildNameMap(items: MenuItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const item of items) {
    if (item.id) out[item.id] = item.name;
  }
  return out;
}

function StepCard({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="devis-card min-w-0 rounded-3xl border-4 border-[#1a1a1a] bg-white p-5 shadow-[6px_6px_0_#111] sm:p-8">
      <header className="mb-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[#1a1a1a] bg-safran-400 font-display text-xl text-ardoise-900 shadow-[2px_2px_0_#111]">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-2xl leading-tight text-ardoise-900 sm:text-3xl">{title}</h2>
          {hint ? <p className="mt-1 font-body text-sm text-ardoise-600">{hint}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function ProgressTrack({ fraction, missing }: { fraction: number; missing: string[] }) {
  const [walking, setWalking] = useState(false);
  const prev = useRef(fraction);

  useEffect(() => {
    if (fraction === prev.current) return;
    prev.current = fraction;
    setWalking(true);
    const id = window.setTimeout(() => setWalking(false), 900);
    return () => window.clearTimeout(id);
  }, [fraction]);

  const ready = fraction >= 1;
  return (
    <div className="fixed inset-x-0 top-16 z-30 border-b-2 border-[#1a1a1a]/20 bg-creme-50/95 px-4 pb-1.5 pt-2 backdrop-blur md:top-20 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-0.5 flex items-center justify-between gap-3 font-body text-[11px] font-semibold leading-tight text-ardoise-700 sm:text-sm">
          <span className="min-w-0 truncate">
            {ready ? "C'est prêt, il ne reste qu'à envoyer !" : `À remplir : ${missing.join(", ")}`}
          </span>
          <span className="shrink-0 font-display text-base text-bordeaux-700">{Math.round(fraction * 100)} %</span>
        </div>
        <div className="relative h-[40px]">
          <div
            className={`absolute bottom-[5px] z-10 transition-[left] duration-700 ease-out ${walking ? "pig-walking" : ""} ${ready && !walking ? "pig-ready" : ""}`}
            style={{ left: `calc((100% - 46px) * ${fraction})`, width: 46 }}
          >
            <WalkingPig width={46} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[6px] overflow-hidden rounded-full border-2 border-[#1a1a1a] bg-white">
            <div className="h-full rounded-full bg-gradient-to-r from-safran-400 to-bordeaux-600 transition-[width] duration-700 ease-out" style={{ width: `${fraction * 100}%` }} />
          </div>
          <span className="absolute -bottom-1 right-0 text-lg" aria-hidden>
            🍽️
          </span>
        </div>
      </div>
    </div>
  );
}

function PickTile({
  item,
  selected,
  onPick,
}: {
  item: MenuItem;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={`group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border-[3px] bg-white text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-safran-400/60 ${
        selected
          ? "-translate-y-0.5 border-bordeaux-700 shadow-[4px_4px_0_#8b1a1a]"
          : "border-[#1a1a1a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111]"
      }`}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-gradient-to-br from-creme-100 to-creme-200">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.name}
            fill
            unoptimized={item.photo_url.startsWith("/api/")}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, 220px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl" aria-hidden>
            🍽️
          </span>
        )}
        <span
          aria-hidden
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#1a1a1a] text-base font-bold transition-all duration-200 ${
            selected ? "scale-100 bg-bordeaux-700 text-white" : "scale-75 bg-white/90 text-transparent opacity-80"
          }`}
        >
          ✓
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 p-3">
        <span className="font-hand text-[17px] font-bold leading-snug text-ardoise-900">{item.name}</span>
        {item.description?.trim() ? (
          <span className="line-clamp-3 font-body text-xs leading-snug text-ardoise-600 sm:text-[13px]">{item.description}</span>
        ) : null}
        {normalizeMenuCategory(item.category) === "main_dish" && item.partner_url?.trim() && item.partner_name?.trim() ? (
          <a
            href={item.partner_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-bordeaux-700 underline decoration-bordeaux-300 underline-offset-2"
          >
            {item.partner_logo_url?.trim() ? (
              <Image
                src={item.partner_logo_url}
                alt={item.partner_name}
                width={14}
                height={14}
                unoptimized={item.partner_logo_url.startsWith("/api/")}
                className="h-[14px] w-[14px] rounded-full object-cover"
              />
            ) : (
              <span aria-hidden>🤝</span>
            )}
            Partenaire : {item.partner_name}
          </a>
        ) : null}
      </div>
    </button>
  );
}

export default function DevisPage() {
  const [menu, setMenu] = useState<MenuData | null | undefined>(undefined);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [mainDish, setMainDish] = useState("");
  const [starters, setStarters] = useState<string[]>([]);
  const [desserts, setDesserts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mailSent, setMailSent] = useState(true);
  const [outcome, setOutcome] = useState<Outcome>("new");
  const [previous, setPrevious] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const [submissionId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rating, setRating] = useState<{ avg: number; total: number } | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  // Anti-bot : champ piège invisible + heure d'ouverture du formulaire.
  const [website, setWebsite] = useState("");
  const [formStartedAt] = useState(() => Date.now());

  useEffect(() => {
    let ok = true;
    (async () => {
      const m = await fetchMenu();
      if (ok) setMenu(m ?? { items: [] });
    })();
    fetch("/api/public/reviews")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { reviews?: { rating: number }[] } | null) => {
        const list = d?.reviews;
        if (ok && Array.isArray(list) && list.length > 0) {
          setRating({ avg: list.reduce((s, r) => s + r.rating, 0) / list.length, total: list.length });
        }
      })
      .catch(() => {});
    return () => {
      ok = false;
    };
  }, []);

  // Si ce visiteur a déjà envoyé une demande récemment : on le rassure au lieu de le laisser insister.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SENT_KEY);
      if (!raw) return;
      const { at } = JSON.parse(raw) as { at?: string };
      const t0 = at ? new Date(at).getTime() : NaN;
      if (Number.isFinite(t0) && Date.now() - t0 < SENT_DAYS * 24 * 60 * 60 * 1000) {
        setPrevious(new Date(t0).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
      }
    } catch {
      /* stockage local indisponible */
    }
  }, []);

  useEffect(() => {
    if (errorMsg) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errorMsg]);

  function toggleId(list: string[], id: string, set: (v: string[]) => void) {
    if (list.includes(id)) set(list.filter((x) => x !== id));
    else set([...list, id]);
  }

  const data = menu;
  const starterItems = data?.items.filter((i) => normalizeMenuCategory(i.category) === "starter") ?? [];
  const mainItems = data?.items.filter((i) => normalizeMenuCategory(i.category) === "main_dish") ?? [];
  const dessertItems = data?.items.filter((i) => normalizeMenuCategory(i.category) === "dessert") ?? [];

  const required: { label: string; ok: boolean }[] = [
    { label: "nom", ok: lastName.trim().length > 0 },
    { label: "prénom", ok: firstName.trim().length > 0 },
    { label: "téléphone", ok: (phone.match(/\d/g) || []).length >= 8 },
    { label: "e-mail", ok: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) },
    { label: "nombre de personnes", ok: (parseInt(numberOfPeople, 10) || 0) >= 1 },
    ...(mainItems.length > 0 ? [{ label: "plat principal", ok: Boolean(mainDish) }] : []),
  ];
  const doneCount = required.filter((r) => r.ok).length;
  const fraction = doneCount / required.length;
  const missing = required.filter((r) => !r.ok).map((r) => r.label);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || submittingRef.current) return;
    const n = parseInt(numberOfPeople, 10);
    if (!n || n < 1) {
      setErrorMsg("Veuillez indiquer un nombre de personnes valide.");
      return;
    }
    const hasMainDishes = (data?.items ?? []).some((i) => normalizeMenuCategory(i.category) === "main_dish");
    if (hasMainDishes && !mainDish) {
      setErrorMsg("Veuillez choisir un plat principal : touchez une des photos de l'étape 3.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setErrorMsg(null);
    const namesById = buildNameMap(data?.items ?? []);
    const startersLabels = starters.map((id) => namesById[id]).filter(Boolean);
    const dessertsLabels = desserts.map((id) => namesById[id]).filter(Boolean);
    const mainDishLabel = namesById[mainDish] || "";
    try {
      const payload: QuotePayload = {
        last_name: lastName,
        first_name: firstName,
        phone,
        email,
        event_date: eventDate,
        event_place: eventPlace,
        number_of_people: n,
        starters,
        starters_labels: startersLabels,
        main_dish: mainDish,
        main_dish_label: mainDishLabel,
        desserts,
        desserts_labels: dessertsLabels,
        message: message.trim() ? message : undefined,
      };
      const result = await sendDevis({ ...payload, website, form_started_at: formStartedAt, submission_id: submissionId });
      setMailSent(result.customerMailed !== false);
      setOutcome(result.updated ? "updated" : result.duplicate ? "duplicate" : "new");
      try {
        localStorage.setItem(SENT_KEY, JSON.stringify({ at: new Date().toISOString() }));
      } catch {
        /* stockage local indisponible */
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur d’envoi");
    }
    submittingRef.current = false;
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-creme-50 text-ardoise-800">
      <Navbar />
      <main className={`flex-1 pb-16 ${success ? "pt-20 md:pt-24" : "pt-[9.5rem] md:pt-[10.5rem]"}`}>
        <div className="mx-auto min-w-0 max-w-3xl px-6">
          <div className="relative mb-8 overflow-hidden rounded-3xl border-4 border-[#1a1a1a] bg-gradient-to-br from-ardoise-800 via-ardoise-800 to-bordeaux-800 px-6 py-10 text-center shadow-[6px_6px_0_#111] sm:py-12">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-safran-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-bordeaux-700/40 blur-3xl" />
            <span className="section-label relative mb-3 block text-safran-400">Gratuit & sans engagement</span>
            <h1 className="relative mb-4 font-display text-4xl leading-tight text-white md:text-5xl">
              Votre devis, <span className="text-safran-400">sur mesure</span> 🍽️
            </h1>
            <p className="relative mx-auto max-w-xl font-body text-base text-white/90 sm:text-lg">
              Quelques clics : dites-nous tout sur votre événement et composez votre menu. On vous répond rapidement avec une proposition personnalisée.
            </p>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Gratuit", "Sans engagement", "Réponse rapide"].map((t) => (
                <span key={t} className="rounded-full border-2 border-[#1a1a1a] bg-creme-50 px-3 py-1 font-body text-xs font-bold text-ardoise-900 sm:text-sm">
                  ✔ {t}
                </span>
              ))}
              {rating ? (
                <span className="rounded-full border-2 border-[#1a1a1a] bg-safran-400 px-3 py-1 font-body text-xs font-bold text-ardoise-900 sm:text-sm">
                  ★ {rating.avg.toFixed(1).replace(".", ",")} · {rating.total} avis Google
                </span>
              ) : null}
            </div>
          </div>

          {!success && previous ? (
            <div role="status" className="mb-6 rounded-2xl border-[3px] border-[#1a1a1a] bg-safran-100 px-5 py-4 font-body text-sm text-ardoise-900 shadow-[4px_4px_0_#111]">
              <p className="font-bold">👋 Vous nous avez déjà envoyé une demande ({previous}).</p>
              <p className="mt-1">
                Pas besoin de la renvoyer : Martin vous répond très vite. Si vous voulez la modifier, remplissez simplement le formulaire à nouveau : elle remplacera la précédente, sans doublon. Urgent ? Appelez-nous au{" "}
                <a href={`tel:${PHONE_TEL}`} className="font-bold text-bordeaux-700 underline underline-offset-2">{PHONE_DISPLAY}</a>.
              </p>
              <button type="button" onClick={() => setPrevious(null)} className="mt-2 text-xs font-semibold text-ardoise-700 underline underline-offset-2">Masquer ce message</button>
            </div>
          ) : null}
          {success ? (
            <div className="animate-fade-in relative overflow-hidden rounded-3xl border-4 border-[#1a1a1a] bg-white p-8 text-center shadow-[6px_6px_0_#111] sm:p-12">
              <span className="confetti confetti-1" aria-hidden>🔥</span>
              <span className="confetti confetti-2" aria-hidden>✨</span>
              <span className="confetti confetti-3" aria-hidden>🐖</span>
              <span className="confetti confetti-4" aria-hidden>✨</span>
              <span className="confetti confetti-5" aria-hidden>🔥</span>
              <div className="pig-walking mx-auto mb-4 flex w-fit justify-center">
                <WalkingPig width={110} />
              </div>
              <h2 className="mb-2 font-display text-3xl text-ardoise-900 sm:text-4xl">
                {outcome === "updated" ? "Votre demande a été mise à jour !" : outcome === "duplicate" ? "Votre demande est déjà enregistrée ✔" : "Votre demande est partie !"}
              </h2>
              <p className="mx-auto max-w-md font-body text-ardoise-700">
                {outcome === "duplicate"
                  ? "Pas de panique : on l'a bien reçue, inutile de la renvoyer. Martin revient vers vous très vite."
                  : outcome === "updated"
                  ? "Elle remplace votre précédente demande (pas de doublon). Martin revient vers vous très vite."
                  : mailSent
                  ? "Un e-mail de confirmation avec le récapitulatif vient de vous être envoyé (pensez à regarder vos courriers indésirables). Martin revient vers vous très vite."
                  : "Votre demande est bien enregistrée (nous n'avons pas pu vous envoyer d'e-mail de confirmation cette fois). Martin revient vers vous très vite."}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/" className="btn btn-braise px-8 py-3 text-base">Retour à l&apos;accueil</Link>
                <a href={`tel:${PHONE_TEL}`} className="btn btn-outline border-[3px] border-[#1a1a1a] px-8 py-3 text-base text-ardoise-900 hover:bg-safran-100 hover:text-ardoise-900">
                  📞 {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="devis-form min-w-0">
              <ProgressTrack fraction={fraction} missing={missing} />
              <div className="mt-6 space-y-6">
                <StepCard n={1} title="Qui êtes-vous ?" hint="Pour que Martin puisse vous répondre.">
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="form-label" htmlFor="d-nom">Nom *</label>
                      <input id="d-nom" className="form-input box-border block w-full min-w-0 max-w-full" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" />
                    </div>
                    <div className="min-w-0">
                      <label className="form-label" htmlFor="d-prenom">Prénom *</label>
                      <input id="d-prenom" className="form-input box-border block w-full min-w-0 max-w-full" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marie" />
                    </div>
                    <div className="min-w-0">
                      <label className="form-label" htmlFor="d-tel">Téléphone *</label>
                      <input id="d-tel" className="form-input box-border block w-full min-w-0 max-w-full" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 00 00 00 00" />
                    </div>
                    <div className="min-w-0">
                      <label className="form-label" htmlFor="d-mail">E-mail *</label>
                      <input id="d-mail" className="form-input box-border block w-full min-w-0 max-w-full" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marie@example.fr" />
                    </div>
                  </div>
                </StepCard>

                <StepCard n={2} title="Votre événement" hint="Mariage, anniversaire, séminaire… racontez-nous.">
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="form-label" htmlFor="d-date">Date de l&apos;événement</label>
                      <input id="d-date" className="form-input box-border block w-full min-w-0 max-w-full" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                    </div>
                    <div className="min-w-0">
                      <label className="form-label" htmlFor="d-lieu">Lieu</label>
                      <input id="d-lieu" className="form-input box-border block w-full min-w-0 max-w-full" value={eventPlace} onChange={(e) => setEventPlace(e.target.value)} placeholder="Salle des fêtes, Paris 75001…" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="form-label" htmlFor="d-nb">Nombre de personnes *</label>
                    <input id="d-nb" className="form-input box-border block w-full min-w-0 max-w-full sm:max-w-[200px]" type="number" inputMode="numeric" min={1} required placeholder="Ex : 50" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {GUEST_SHORTCUTS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNumberOfPeople(String(n))}
                          className={`rounded-full border-2 border-[#1a1a1a] px-3.5 py-1.5 font-body text-sm font-bold transition-colors ${
                            numberOfPeople === String(n) ? "bg-bordeaux-700 text-white" : "bg-creme-50 text-ardoise-900 hover:bg-safran-100"
                          }`}
                        >
                          {n} pers.
                        </button>
                      ))}
                    </div>
                  </div>
                </StepCard>

                <StepCard n={3} title="Composez votre menu" hint="Touchez une photo pour la choisir. Le plat principal est obligatoire, le reste est facultatif.">
                  {menu === undefined ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
                    </div>
                  ) : menu === null ? (
                    <p className="py-4 text-sm font-semibold text-bordeaux-700">
                      Impossible de charger la carte (réseau ou configuration). Vous pouvez décrire votre menu dans le message ci-dessous.
                    </p>
                  ) : menu.items.length === 0 ? (
                    <p className="py-4 text-sm italic text-ardoise-600">La carte n&apos;est pas encore disponible. Précisez vos souhaits dans le message ci-dessous.</p>
                  ) : (
                    <div className="space-y-8">
                      {mainItems.length > 0 ? (
                        <div>
                          <p className="mb-3 font-hand text-xl font-bold text-ardoise-900">🍲 Plat principal * <span className="font-body text-sm font-normal text-ardoise-600">(un seul choix)</span></p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {mainItems.map((item) => (
                              <PickTile key={item.id} item={item} selected={mainDish === item.id} onPick={() => setMainDish(item.id)} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {starterItems.length > 0 ? (
                        <div>
                          <p className="mb-3 font-hand text-xl font-bold text-ardoise-900">🥗 Entrées <span className="font-body text-sm font-normal text-ardoise-600">(plusieurs choix possibles{starters.length ? ` · ${starters.length} choisie${starters.length > 1 ? "s" : ""}` : ""})</span></p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {starterItems.map((item) => (
                              <PickTile key={item.id} item={item} selected={starters.includes(item.id)} onPick={() => toggleId(starters, item.id, setStarters)} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {dessertItems.length > 0 ? (
                        <div>
                          <p className="mb-3 font-hand text-xl font-bold text-ardoise-900">🍮 Desserts <span className="font-body text-sm font-normal text-ardoise-600">(plusieurs choix possibles{desserts.length ? ` · ${desserts.length} choisi${desserts.length > 1 ? "s" : ""}` : ""})</span></p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {dessertItems.map((item) => (
                              <PickTile key={item.id} item={item} selected={desserts.includes(item.id)} onPick={() => toggleId(desserts, item.id, setDesserts)} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </StepCard>

                <StepCard n={4} title="Un mot de plus ?" hint="Allergies, demandes particulières, style de service… (facultatif)">
                  <textarea
                    className="form-input box-border block min-h-[110px] w-full min-w-0 max-w-full resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dites-nous tout : on s'adapte !"
                    aria-label="Message complémentaire"
                  />
                </StepCard>

                <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
                  <label>
                    Ne pas remplir
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
                </div>

                {errorMsg ? (
                  <div ref={errorRef} role="alert" className="rounded-2xl border-[3px] border-[#1a1a1a] bg-red-50 px-5 py-4 font-body text-sm font-semibold text-red-800 shadow-[4px_4px_0_#111]">
                    {errorMsg}
                  </div>
                ) : null}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn btn-braise w-full justify-center border-[3px] border-[#1a1a1a] py-5 text-lg shadow-[5px_5px_0_#111] ${fraction >= 1 && !submitting ? "cta-ready" : ""}`}
                  >
                    {submitting ? "Envoi en cours…" : "🔥 Envoyer ma demande de devis"}
                  </button>
                  <p className="mt-3 font-body text-sm text-ardoise-700">
                    🔒 Gratuit et sans engagement. Vos informations servent uniquement à vous répondre.
                  </p>
                  <p className="mt-1 font-body text-sm text-ardoise-700">
                    Plutôt par téléphone ? <a href={`tel:${PHONE_TEL}`} className="font-bold text-bordeaux-700 underline underline-offset-2">{PHONE_DISPLAY}</a>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}






