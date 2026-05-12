"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type EventEntry = { id: string; date: string; place: string };
type EventsData = { markets: EventEntry[] };
type MenuItem = {
  id: string;
  name: string;
  description: string;
  photo_url?: string | null;
  category: string;
  price_info?: string | null;
  partner_name?: string | null;
  partner_url?: string | null;
  partner_logo_url?: string | null;
};
type MenuData = { items: MenuItem[] };
type CollagePhoto = { id: string; src: string; alt: string };
type CollageData = { photos: CollagePhoto[] };
type Review = { id: string; author: string; rating: number; text: string; date: string; google_url?: string | null };
type ReviewsData = { reviews: Review[] };
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

const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

const DEBUG_CLIENT_UPLOAD =
  process.env.NEXT_PUBLIC_DEBUG_UPLOAD === "1" || process.env.NODE_ENV === "development";

function clientUploadLog(...args: unknown[]) {
  if (DEBUG_CLIENT_UPLOAD) console.info("[Calirotis admin client]", ...args);
}

function marketJsonUrl() { return "/api/public/market" }
function menuJsonUrl() { return "/api/public/menu" }
function menuJsonUrlBusted(generation: number) {
  const base = menuJsonUrl();
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}cb=${generation}`;
}

function adminHeaders(): HeadersInit {
  if (!ADMIN_API_KEY) return {};
  return { "x-admin-key": ADMIN_API_KEY };
}

function normalizeMenuCategory(raw: string): "starter" | "main_dish" | "dessert" {
  const lower = raw.trim().toLowerCase().replace(/-/g, "_");
  if (lower === "maindish" || lower === "main_dish") return "main_dish";
  if (lower === "dessert" || lower === "desserts") return "dessert";
  return "starter";
}

function categoryLabel(c: "starter" | "main_dish" | "dessert") {
  if (c === "main_dish") return "Plat principal";
  if (c === "dessert") return "Dessert";
  return "Entrée";
}

async function fetchQuotesAdmin() {
  const r = await fetch("/api/admin/quotes", { headers: adminHeaders() });
  if (!r.ok) return null;
  return (await r.json()) as QuotesData;
}

async function loadMenuForAdmin(generation: number) {
  const r = await fetch(menuJsonUrlBusted(generation));
  if (!r.ok) return null;
  return (await r.json()) as MenuData;
}

async function createMenuItem(payload: {
  name: string;
  description: string;
  category: string;
  photo_url?: string | null;
  partner_name?: string | null;
  partner_url?: string | null;
  partner_logo_url?: string | null;
}) {
  const r = await fetch("/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action: "create", ...payload }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
}

async function updateMenuItem(payload: {
  id: string;
  name: string;
  description: string;
  category: string;
  photo_url?: string | null;
  partner_name?: string | null;
  partner_url?: string | null;
  partner_logo_url?: string | null;
}) {
  const r = await fetch("/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action: "update", ...payload }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
}

async function deleteMenuItem(id: string) {
  const r = await fetch("/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action: "delete", id }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

async function reorderMenuItems(ids: string[]) {
  const r = await fetch("/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action: "reorder", ids }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
}

async function saveEventsData(data: EventsData) {
  const r = await fetch("/api/admin/market", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

async function uploadMenuPhoto(file: File) {
  const contentType = file.type || "application/octet-stream";
  clientUploadLog("uploadMenuPhoto → /api/admin/upload-photo", {
    name: file.name,
    size: file.size,
    type: file.type || "(vide — risque 400 Image requise côté serveur)",
    adminKeyHeader: Boolean(ADMIN_API_KEY),
  });
  if (!contentType.startsWith("image/")) throw new Error("Le fichier doit être une image.");
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload-photo", { method: "POST", headers: adminHeaders(), body: fd });
  const text = await r.text();
  clientUploadLog("upload-photo HTTP", r.status, text.slice(0, 300));
  if (!r.ok) {
    console.error("[Calirotis admin client] upload-photo échec", r.status, text.slice(0, 500));
    throw new Error(text || `HTTP ${r.status}`);
  }
  const j = JSON.parse(text) as { photo_url?: string };
  if (!j.photo_url) throw new Error("Réponse upload invalide");
  clientUploadLog("upload-photo OK, photo_url=", j.photo_url);
  return j.photo_url;
}

async function fetchReviewsAdmin(): Promise<ReviewsData | null> {
  const r = await fetch("/api/admin/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action: "list" }),
  });
  if (!r.ok) return null;
  return (await r.json()) as ReviewsData;
}

async function saveReview(payload: Omit<Review, "id"> & { id?: string }) {
  const action = payload.id ? "update" : "create";
  const r = await fetch("/api/admin/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action, ...payload }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
}

async function deleteReview(id: string) {
  const r = await fetch("/api/admin/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ action: "delete", id }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}

const TAB_KEY = "admin_active_tab";

function initialTab(): "quotes" | "menu" | "market" | "collage" | "reviews" {
  if (typeof window === "undefined") return "quotes";
  const t = localStorage.getItem(TAB_KEY);
  if (t === "menu" || t === "market" || t === "quotes" || t === "collage" || t === "reviews") return t;
  return "quotes";
}

async function fetchCollageAdmin() {
  const r = await fetch("/api/admin/collage", { method: "POST", headers: { "Content-Type": "application/json", ...adminHeaders() }, body: JSON.stringify({ action: "list" }) });
  if (!r.ok) return null;
  return (await r.json()) as CollageData;
}

async function saveCollageAdmin(photos: CollagePhoto[]) {
  clientUploadLog("saveCollageAdmin", {
    count: photos.length,
    srcPrefixes: photos.map((p) => p.src.slice(0, 72)),
  });
  const r = await fetch("/api/admin/collage", { method: "POST", headers: { "Content-Type": "application/json", ...adminHeaders() }, body: JSON.stringify({ action: "save", photos }) });
  const text = await r.text();
  clientUploadLog("collage save HTTP", r.status, text.slice(0, 400));
  if (!r.ok) {
    console.error("[Calirotis admin client] collage save échec", r.status, text.slice(0, 500));
    let msg = `HTTP ${r.status}`;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setError(j.error || "Mot de passe incorrect");
        return;
      }
      localStorage.setItem("admin_auth", "1");
      onSuccess();
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">🔐</div>
          <h1 className="font-display text-2xl text-ardoise-900">Espace admin</h1>
          <p className="mt-1 text-sm text-ardoise-600">Calirotis</p>
        </div>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-input" placeholder="••••••••" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn btn-safran w-full justify-center py-3">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

function buildMenuItemNameMap(menu: MenuData | null | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  for (const it of menu?.items ?? []) {
    if (it.id) map[it.id] = it.name;
  }
  return map;
}

function formatDishIds(ids: unknown, names: Record<string, string>): string {
  if (!Array.isArray(ids)) return "";
  return ids.filter((id): id is string => typeof id === "string").map((id) => names[id] || id).filter(Boolean).join(", ");
}

function formatDishLabels(ids: unknown, labels: unknown, names: Record<string, string>): string {
  if (Array.isArray(labels)) {
    const cleanLabels = labels.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim());
    if (cleanLabels.length > 0) return cleanLabels.join(", ");
  }
  return formatDishIds(ids, names);
}

function QuoteCard({ q, dishNames }: { q: QuoteRequest; dishNames: Record<string, string> }) {
  const created = typeof q.created_at === "string" ? q.created_at : "";
  const dateShort = created.slice(0, 10) || "—";
  const eventDate = q.event_date || "Date non précisée";
  const starters = formatDishLabels(q.starters, q.starters_labels, dishNames);
  const desserts = formatDishLabels(q.desserts, q.desserts_labels, dishNames);
  const mainLabel = typeof q.main_dish_label === "string" && q.main_dish_label.trim() ? q.main_dish_label.trim() : q.main_dish ? dishNames[q.main_dish] || q.main_dish : "";
  const fullName = `${q.first_name ?? ""} ${q.last_name ?? ""}`.trim() || "—";
  return (
    <div className="rounded-2xl border border-creme-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ardoise-900">{fullName}</h3>
          <p className="text-sm text-ardoise-500">{dateShort}</p>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <span className="text-ardoise-500">📧 </span>
          {q.email ? (
            <a href={`mailto:${q.email}`} className="text-bordeaux-600 hover:underline">{q.email}</a>
          ) : (
            <span className="text-ardoise-400">Non renseigné</span>
          )}
        </div>
        {q.phone ? (
          <div>
            <span className="text-ardoise-500">📞 </span>
            <a href={`tel:${q.phone}`} className="text-bordeaux-600 hover:underline">{q.phone}</a>
          </div>
        ) : null}
        <div>📅 {eventDate}</div>
        <div>👥 {typeof q.number_of_people === "number" ? q.number_of_people : "—"} personnes</div>
        {q.event_place ? <div className="sm:col-span-2">📍 {q.event_place}</div> : null}
      </div>
      <div className="space-y-1 border-t border-creme-100 pt-3 text-sm">
        {starters ? <p><span className="font-medium text-ardoise-500">Entrées : </span>{starters}</p> : null}
        {mainLabel ? <p><span className="font-medium text-ardoise-500">Plat principal : </span>{mainLabel}</p> : null}
        {desserts ? <p><span className="font-medium text-ardoise-500">Desserts : </span>{desserts}</p> : null}
        {q.message ? <p className="mt-2 italic text-ardoise-600">{q.message}</p> : null}
      </div>
    </div>
  );
}

function QuotesPanel() {
  const [data, setData] = useState<QuotesData | null | undefined>(undefined);
  const [dishNames, setDishNames] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    setData(undefined);
    const [q, menuRes] = await Promise.all([fetchQuotesAdmin(), fetch(menuJsonUrl())]);
    if (menuRes.ok) {
      const menu = (await menuRes.json()) as MenuData;
      setDishNames(buildMenuItemNameMap(menu));
    } else {
      setDishNames({});
    }
    setData(q);
  }, []);
  useEffect(() => { load(); }, [load]);
  const sorted = useMemo(() => {
    if (!data?.quotes) return [];
    return [...data.quotes].filter((row) => row && typeof row === "object").sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [data]);
  return (
    <div className="pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ardoise-900">Demandes de devis</h2>
        <button type="button" className="btn btn-ghost px-4 py-2 text-sm" onClick={() => load()}>Actualiser</button>
      </div>
      {data === undefined ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
        </div>
      ) : data === null ? (
        <p className="py-4 italic text-ardoise-500">Impossible de charger les devis.</p>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center text-ardoise-500">
          <div className="mb-4 text-5xl">📭</div>
          <p>Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((q) => <QuoteCard key={q.id} q={q} dishNames={dishNames} />)}
        </div>
      )}
    </div>
  );
}

const MENU_CATS = ["starter", "main_dish", "dessert"] as const;

function catHeader(cat: "starter" | "main_dish" | "dessert") {
  if (cat === "main_dish") return "🍲 Plats principaux";
  if (cat === "dessert") return "🍮 Desserts";
  return "🥗 Entrées";
}

function MenuPanel() {
  const [gen, setGen] = useState(0);
  const [menu, setMenu] = useState<MenuData | null | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("starter");
  const [photoUrl, setPhotoUrl] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerUrl, setPartnerUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [menuOk, setMenuOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const menuPhotoFileRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setCategory("starter");
    setPhotoUrl("");
    setPartnerName("");
    setPartnerUrl("");
    setPartnerLogoUrl("");
    setPhotoNote(null);
    setFormError(null);
    if (menuPhotoFileRef.current) menuPhotoFileRef.current.value = "";
  }
  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setName(item.name || "");
    setDescription(item.description || "");
    setCategory(item.category || "starter");
    setPhotoUrl(item.photo_url || "");
    setPartnerName(item.partner_name || "");
    setPartnerUrl(item.partner_url || "");
    setPartnerLogoUrl(item.partner_logo_url || "");
    setPhotoNote(item.photo_url ? "Photo actuelle chargée." : null);
    setFormError(null);
    setMenuOk(null);
    if (menuPhotoFileRef.current) menuPhotoFileRef.current.value = "";
  }
  const reload = useCallback(async () => {
    setMenu(undefined);
    const m = await loadMenuForAdmin(gen);
    setMenu(m);
  }, [gen]);
  useEffect(() => { reload(); }, [reload]);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoNote("Envoi en cours…");
    try {
      const url = await uploadMenuPhoto(f);
      setPhotoUrl(url);
      setPhotoNote("Image enregistrée sur S3.");
    } catch (err) {
      setPhotoNote(err instanceof Error ? err.message : "Erreur upload");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const nameTrim = name.trim();
    if (!nameTrim) { setFormError("Le nom est obligatoire."); setMenuOk(null); return; }
    setSaving(true);
    setFormError(null);
    setMenuOk(null);
    try {
      const payload = {
        name: nameTrim,
        description: description.trim(),
        category,
        photo_url: photoUrl.trim() || null,
        partner_name: partnerName.trim() || null,
        partner_url: partnerUrl.trim() || null,
        partner_logo_url: partnerLogoUrl.trim() || null,
      };
      if (editingId) {
        await updateMenuItem({ id: editingId, ...payload });
      } else {
        await createMenuItem(payload);
      }
      resetForm();
      setMenuOk(editingId ? "Plat modifié." : "Plat enregistré.");
      setGen((g) => g + 1);
      localStorage.setItem(TAB_KEY, "menu");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur");
    }
    setSaving(false);
  }

  async function onDelete(id: string) {
    try {
      if (editingId === id) resetForm();
      await deleteMenuItem(id);
      setGen((g) => g + 1);
    } catch { /* ignore */ }
  }

  async function onMove(id: string, dir: "up" | "down") {
    const currentItems = menu?.items ?? [];
    const item = currentItems.find((it) => it.id === id);
    if (!item) return;
    const cat = normalizeMenuCategory(item.category);
    const catIndices = currentItems
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => normalizeMenuCategory(it.category) === cat)
      .map(({ i }) => i);
    const itemGlobalIdx = currentItems.findIndex((it) => it.id === id);
    const posInCat = catIndices.indexOf(itemGlobalIdx);
    if (dir === "up" && posInCat === 0) return;
    if (dir === "down" && posInCat === catIndices.length - 1) return;
    const swapGlobalIdx = dir === "up" ? catIndices[posInCat - 1] : catIndices[posInCat + 1];
    const newItems = [...currentItems];
    [newItems[itemGlobalIdx], newItems[swapGlobalIdx]] = [newItems[swapGlobalIdx], newItems[itemGlobalIdx]];
    setMenu({ items: newItems });
    try {
      await reorderMenuItems(newItems.map((it) => it.id));
    } catch {
      setMenu({ items: currentItems });
    }
  }

  const items = menu?.items ?? [];

  return (
    <div className="space-y-10 pb-16">
      <div className="rounded-2xl border border-creme-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl text-ardoise-900">
            {editingId ? "Modifier le plat" : "Ajouter un plat"}
          </h2>
          {editingId ? (
            <button type="button" className="btn btn-ghost px-4 py-2 text-sm" onClick={resetForm}>
              Annuler la modification
            </button>
          ) : null}
        </div>
        <form noValidate className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Catégorie</label>
              <select className="form-input form-input-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="starter">Entrée</option>
                <option value="main_dish">Plat principal</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Photo</label>
            <input
              ref={menuPhotoFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="form-input text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-creme-100 file:px-3 file:py-1.5 file:text-ardoise-700"
              onChange={onPhotoChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Nom du partenaire (optionnel)</label>
              <input className="form-input" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Ex : Maison Dupont" />
            </div>
            <div>
              <label className="form-label">Lien partenaire (optionnel)</label>
              <input className="form-input" value={partnerUrl} onChange={(e) => setPartnerUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="form-label">Logo partenaire (URL, optionnel)</label>
            <input className="form-input" value={partnerLogoUrl} onChange={(e) => setPartnerLogoUrl(e.target.value)} placeholder="/api/public/media?key=... ou https://..." />
          </div>
          {photoNote ? <p className="text-sm text-ardoise-600">{photoNote}</p> : null}
          {menuOk ? <p className="text-sm font-medium text-green-700">{menuOk}</p> : null}
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <button type="submit" disabled={saving} className="btn btn-safran px-6">
            {saving ? (editingId ? "Modification..." : "Ajout...") : editingId ? "Enregistrer les modifications" : "Ajouter le plat"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-5 font-display text-xl text-ardoise-900">Carte actuelle</h2>
        {menu === undefined ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
          </div>
        ) : menu === null ? (
          <div className="space-y-2 text-sm text-red-600">
            <p>Impossible de charger le menu (réseau, CORS ou JSON invalide).</p>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-ardoise-500">Aucun plat dans la carte.</p>
        ) : (
          <div className="space-y-8">
            {MENU_CATS.map((cat) => {
              const catItems = items.filter((it) => normalizeMenuCategory(it.category) === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="mb-3 font-hand text-lg font-bold text-ardoise-700">{catHeader(cat)}</h3>
                  <div className="space-y-2">
                    {catItems.map((item, posInCat) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 rounded-xl border bg-white px-4 py-3 transition-colors ${
                          editingId === item.id
                            ? "border-bordeaux-400 ring-2 ring-bordeaux-100"
                            : "border-creme-200 hover:border-bordeaux-200"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={posInCat === 0}
                            onClick={() => void onMove(item.id, "up")}
                            className="rounded p-1 text-ardoise-400 transition-colors hover:bg-creme-100 hover:text-ardoise-700 disabled:cursor-not-allowed disabled:opacity-25"
                            title="Monter"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            disabled={posInCat === catItems.length - 1}
                            onClick={() => void onMove(item.id, "down")}
                            className="rounded p-1 text-ardoise-400 transition-colors hover:bg-creme-100 hover:text-ardoise-700 disabled:cursor-not-allowed disabled:opacity-25"
                            title="Descendre"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-4 text-left"
                          onClick={() => startEdit(item)}
                        >
                          {item.photo_url ? (
                            <Image
                              src={item.photo_url}
                              alt=""
                              width={100}
                              height={100}
                              unoptimized={item.photo_url.startsWith("/api/")}
                              className="h-14 w-14 flex-shrink-0 rounded-lg border border-creme-100 object-cover sm:h-16 sm:w-16"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex flex-wrap items-center gap-2">
                              <span className="font-medium text-ardoise-900">{item.name}</span>
                              {item.partner_name ? (
                                <span className="tag bg-safran-100 text-xs text-safran-700">Partenaire</span>
                              ) : null}
                            </div>
                            <p className="truncate text-sm text-ardoise-500">{item.description}</p>
                            <p className="mt-0.5 text-xs text-bordeaux-600">Cliquer pour modifier</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          title="Supprimer"
                          className="flex-shrink-0 rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => { e.stopPropagation(); void onDelete(item.id); }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EventsPanel() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(marketJsonUrl());
    if (!r.ok) {
      setEvents([{ id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, date: "", place: "" }]);
      setLoading(false);
      return;
    }
    const data = (await r.json()) as EventsData;
    const list = Array.isArray(data.markets) ? data.markets : [];
    setEvents(
      list.length > 0
        ? list
        : [{ id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, date: "", place: "" }],
    );
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function addEvent() {
    setEvents((prev) => [
      ...prev,
      { id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, date: "", place: "" },
    ]);
  }
  function updateRow(idx: number, patch: Partial<EventEntry>) { setEvents((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m))); }
  function removeRow(idx: number) { setEvents((prev) => prev.filter((_, i) => i !== idx)); }

  async function onSave() {
    if (saving) return;
    setSaving(true);
    setErrMsg(null);
    setSaved(false);
    try {
      const valid = events.filter((m) => m.date.trim());
      if (valid.length !== events.length) {
        setErrMsg("Renseignez une date pour chaque ligne, ou supprimez les lignes vides.");
        setSaving(false);
        return;
      }
      await saveEventsData({ markets: valid });
      setSaved(true);
      await load();
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Erreur");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl pb-16">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ardoise-900">Événements</h2>
          <p className="mt-1 text-sm text-ardoise-600">
            Sur l&apos;accueil, seuls les événements dans les 7 prochains jours (non passés) sont affichés.
          </p>
        </div>
        <button type="button" className="btn btn-ghost shrink-0 px-4 py-2 text-sm" onClick={addEvent}>
          Ajouter un événement
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((m, idx) => (
            <div key={m.id} className="rounded-2xl border border-creme-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={m.date}
                    onChange={(e) => updateRow(idx, { date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Lieu / nom de l&apos;événement</label>
                  <input
                    className="form-input"
                    placeholder="ex : Foire de Rouen, Marché de Noël..."
                    value={m.place}
                    onChange={(e) => updateRow(idx, { place: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-red-600 hover:underline"
                  onClick={() => removeRow(idx)}
                >
                  Supprimer cet événement
                </button>
              </div>
            </div>
          ))}
          {errMsg ? <p className="text-sm text-red-600">{errMsg}</p> : null}
          {saved ? <p className="text-sm text-green-600">✓ Enregistré</p> : null}
          <button type="button" disabled={saving} className="btn btn-safran px-6" onClick={onSave}>
            {saving ? "Enregistrement..." : "Enregistrer les événements"}
          </button>
        </div>
      )}
    </div>
  );
}

const COLLAGE_MIN = 3;
const COLLAGE_MAX = 8;

function isS3BackedCollageSrc(src: string): boolean {
  const t = src.trim();
  if (!t) return false;
  if (t.startsWith("/api/public/media?key=")) return true;
  try {
    const u = new URL(t);
    if (u.hostname.includes("amazonaws.com") && u.pathname.includes("/uploads/")) return true;
  } catch { /* ignore */ }
  return false;
}

function padCollageSlots(list: CollagePhoto[]): CollagePhoto[] {
  const trimmed = list.slice(0, COLLAGE_MAX);
  const out = [...trimmed];
  while (out.length < COLLAGE_MIN) {
    out.push({
      id: `cp_slot_${Date.now()}_${out.length}_${Math.random().toString(36).slice(2, 6)}`,
      src: "",
      alt: "Photo traiteur",
    });
  }
  return out;
}

function CollagePanel() {
  const [photos, setPhotos] = useState<CollagePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const filledCount = photos.filter((p) => p.src?.trim()).length;
  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchCollageAdmin();
    const raw = data?.photos?.length ? data.photos : [];
    setPhotos(padCollageSlots(raw));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function addPhoto() {
    setPhotos((prev) => {
      if (prev.length >= COLLAGE_MAX) return prev;
      return [...prev, { id: `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, src: "", alt: "Photo traiteur" }];
    });
  }
  function updatePhoto(idx: number, patch: Partial<CollagePhoto>) { setPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p))); }
  function removePhoto(idx: number) {
    setPhotos((prev) => {
      if (prev.length <= COLLAGE_MIN) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }
  async function uploadForPhoto(idx: number, file: File) {
    setNote("Upload photo en cours…");
    clientUploadLog("Collage upload ligne", idx, file.name, file.type, file.size);
    try {
      const url = await uploadMenuPhoto(file);
      updatePhoto(idx, { src: url });
      setNote("Photo uploadée sur S3.");
    } catch (err) {
      console.error("[Calirotis admin client] Collage upload erreur ligne", idx, err);
      setNote(err instanceof Error ? err.message : "Erreur upload");
    }
  }
  async function onSave() {
    if (saving) return;
    const filled = photos.filter((p) => p.src?.trim());
    clientUploadLog("Collage onSave", {
      filled: filled.length,
      slots: photos.length,
      s3Backed: filled.map((p) => ({ ok: isS3BackedCollageSrc(p.src), src: p.src.slice(0, 80) })),
    });
    if (filled.length < COLLAGE_MIN || filled.length > COLLAGE_MAX) {
      setNote(`Il faut entre ${COLLAGE_MIN} et ${COLLAGE_MAX} photos complètes. Actuellement : ${filled.length}.`);
      return;
    }
    const notOnS3 = filled.filter((p) => !isS3BackedCollageSrc(p.src));
    if (notOnS3.length > 0) {
      setNote("Chaque photo doit être envoyée sur S3 via le bouton « Choisir un fichier » (pas d'URL locale type /photo.jpg). Remplacez les images concernées.");
      return;
    }
    setSaving(true);
    setNote(null);
    try {
      await saveCollageAdmin(filled);
      setNote("Photocollage enregistré.");
      await load();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Erreur enregistrement");
    }
    setSaving(false);
  }
  const canAdd = photos.length < COLLAGE_MAX;
  const canRemove = photos.length > COLLAGE_MIN;
  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ardoise-900">Photocollage</h2>
          <p className="mt-1 text-sm text-ardoise-600">
            Entre <strong>{COLLAGE_MIN}</strong> et <strong>{COLLAGE_MAX}</strong> photos. Lignes avec image :{" "}
            <strong>{filledCount}</strong> · emplacements : <strong>{photos.length}</strong>
          </p>
        </div>
        <button
          type="button"
          className="btn btn-safran shrink-0 justify-center px-5 py-3 text-sm shadow-md"
          onClick={addPhoto}
          disabled={!canAdd || loading}
          title={canAdd ? "Ajouter une ligne photo" : `Maximum ${COLLAGE_MAX} photos`}
        >
          ＋ Ajouter une photo
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {photos.map((photo, idx) => (
            <div key={photo.id} className="rounded-xl border border-creme-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="form-label">Texte alternatif</label>
                  <input
                    className="form-input"
                    placeholder="Description courte pour l'accessibilité"
                    value={photo.alt}
                    onChange={(e) => updatePhoto(idx, { alt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Image (envoi vers S3)</label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {photo.src ? (
                      <Image
                        src={photo.src}
                        alt=""
                        width={50}
                        height={50}
                        unoptimized={photo.src.startsWith("/api/")}
                        className="h-24 w-32 shrink-0 rounded-lg border border-creme-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-creme-300 bg-creme-50 text-xs text-ardoise-400">
                        Aucune
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      className="form-input min-w-0 flex-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-creme-100 file:px-3 file:py-1.5 file:text-ardoise-700"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadForPhoto(idx, f); }}
                    />
                  </div>
                  {photo.src && !isS3BackedCollageSrc(photo.src) ? (
                    <p className="mt-2 text-xs text-amber-700">
                      Cette image ne vient pas de S3 : choisissez un fichier pour l&apos;envoyer sur le bucket.
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => removePhoto(idx)}
                  disabled={!canRemove}
                  title={canRemove ? "Supprimer cette ligne" : `Minimum ${COLLAGE_MIN} emplacements`}
                >
                  Supprimer cette ligne
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="btn btn-outline border-2 border-bordeaux-600 px-6 py-3 text-sm font-semibold text-bordeaux-700"
              onClick={addPhoto}
              disabled={!canAdd}
            >
              ＋ Ajouter une photo
            </button>
          </div>
        </div>
      )}
      {note ? (
        <p className={`text-sm ${/enregistré|uploadée/i.test(note) ? "text-green-700" : /erreur|HTTP|Il faut/i.test(note) ? "text-red-600" : "text-ardoise-700"}`}>
          {note}
        </p>
      ) : null}
      <button type="button" className="btn btn-safran px-6" disabled={saving || loading} onClick={onSave}>
        {saving ? "Enregistrement..." : "Enregistrer le collage"}
      </button>
    </div>
  );
}

const AVATAR_COLORS = ["bg-red-500","bg-pink-500","bg-purple-600","bg-indigo-500","bg-blue-500","bg-cyan-600","bg-teal-500","bg-green-600","bg-orange-500","bg-rose-500"];
function authorColor(name: string) { return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="text-2xl leading-none transition-transform hover:scale-110"
        >
          <span className={n <= (hovered || value) ? "text-yellow-400" : "text-gray-200"}>★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewsPanel() {
  const [data, setData] = useState<ReviewsData | null | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [googleUrl, setGoogleUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setData(undefined);
    const d = await fetchReviewsAdmin();
    setData(d);
  }, []);
  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setEditingId(null); setAuthor(""); setRating(5); setText("");
    setDate(new Date().toISOString().slice(0, 10)); setGoogleUrl("");
    setOk(null); setErr(null);
  }
  function startEdit(r: Review) {
    setEditingId(r.id); setAuthor(r.author); setRating(r.rating);
    setText(r.text); setDate(r.date); setGoogleUrl(r.google_url || "");
    setOk(null); setErr(null);
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim()) { setErr("Le nom est obligatoire."); return; }
    setSaving(true); setErr(null); setOk(null);
    try {
      await saveReview({ id: editingId ?? undefined, author: author.trim(), rating, text: text.trim(), date, google_url: googleUrl.trim() || null });
      setOk(editingId ? "Avis modifié." : "Avis ajouté.");
      resetForm();
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : "Erreur"); }
    setSaving(false);
  }
  async function onDelete(id: string) {
    try { if (editingId === id) resetForm(); await deleteReview(id); await load(); } catch { /* ignore */ }
  }

  const reviews = data?.reviews ?? [];
  return (
    <div className="space-y-10 pb-16">
      <div className="rounded-2xl border border-creme-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-ardoise-900">{editingId ? "Modifier l'avis" : "Ajouter un avis"}</h2>
          {editingId ? <button type="button" className="btn btn-ghost px-4 py-2 text-sm" onClick={resetForm}>Annuler</button> : null}
        </div>
        <form noValidate className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Nom du client *</label>
              <input className="form-input" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Jean Dupont" />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Note</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="form-label">Texte de l&apos;avis *</label>
            <textarea
              className="form-input min-h-[90px] resize-y"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Copiez-collez le texte de l'avis Google ici..."
            />
          </div>
          <div>
            <label className="form-label">Lien vers l&apos;avis Google (optionnel)</label>
            <input
              className="form-input"
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
            <p className="mt-1 text-xs text-ardoise-500">Collez le lien direct vers l&apos;avis depuis Google Maps — il sera affiché sur le site pour prouver l&apos;authenticité.</p>
          </div>
          {ok ? <p className="text-sm font-medium text-green-700">{ok}</p> : null}
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <button type="submit" disabled={saving} className="btn btn-safran px-6">
            {saving ? (editingId ? "Modification..." : "Ajout...") : editingId ? "Enregistrer" : "Ajouter l'avis"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-5 font-display text-xl text-ardoise-900">Avis publiés ({reviews.length})</h2>
        {data === undefined ? (
          <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-ardoise-500">Aucun avis pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className={`flex items-start gap-4 rounded-xl border bg-white px-5 py-4 transition-colors ${editingId === r.id ? "border-bordeaux-400 ring-2 ring-bordeaux-100" : "border-creme-200 hover:border-bordeaux-200"}`}>
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${authorColor(r.author)}`}>
                  {r.author.charAt(0).toUpperCase()}
                </div>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => startEdit(r)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ardoise-900">{r.author}</span>
                    <span className="text-yellow-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <span className="text-xs text-ardoise-400">{r.date}</span>
                    {r.google_url ? <span className="tag bg-blue-50 text-xs text-blue-600">Lien Google ✓</span> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ardoise-500">{r.text}</p>
                  <p className="mt-0.5 text-xs text-bordeaux-600">Cliquer pour modifier</p>
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  className="flex-shrink-0 rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => { e.stopPropagation(); void onDelete(r.id); }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"quotes" | "menu" | "market" | "collage" | "reviews">("quotes");
  useEffect(() => {
    setAuth(localStorage.getItem("admin_auth") === "1");
    setTab(initialTab());
  }, []);
  useEffect(() => {
    if (auth) localStorage.setItem(TAB_KEY, tab);
  }, [auth, tab]);
  if (auth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
      </div>
    );
  }
  if (!auth) { return <LoginForm onSuccess={() => setAuth(true)} />; }
  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-creme-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-display text-xl text-ardoise-900">Admin — Calirotis</h1>
          <button
            type="button"
            className="btn btn-ghost px-4 py-2 text-sm"
            onClick={() => { localStorage.removeItem("admin_auth"); window.location.reload(); }}
          >
            Déconnexion
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="mb-8 flex gap-2 border-b border-creme-200">
          {(
            [
              ["quotes", "Devis"],
              ["menu", "Menu"],
              ["market", "Événements"],
              ["collage", "Photocollage"],
              ["reviews", "Avis"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={
                tab === id
                  ? "-mb-px border-b-2 border-bordeaux-700 px-4 py-2.5 text-sm font-semibold text-bordeaux-700"
                  : "border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ardoise-600 hover:text-bordeaux-700"
              }
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "quotes" ? <QuotesPanel /> : null}
        {tab === "menu" ? <MenuPanel /> : null}
        {tab === "market" ? <EventsPanel /> : null}
        {tab === "collage" ? <CollagePanel /> : null}
        {tab === "reviews" ? <ReviewsPanel /> : null}
      </div>
    </div>
  );
}
