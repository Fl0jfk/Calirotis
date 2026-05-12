import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getStorage, storageConfigErrorJson, type StorageContext } from "../../../../lib/storage-env";

const KEY = "reviews.json";

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  google_url?: string | null;
};
type ReviewsData = { reviews: Review[] };

function isAdminAuthorized(req: Request): boolean {
  const expected = process.env.ADMIN_API_KEY || "";
  if (!expected) return true;
  return req.headers.get("x-admin-key") === expected;
}

async function signedGet(st: StorageContext, key: string) {
  return getSignedUrl(st.s3, new GetObjectCommand({ Bucket: st.bucket, Key: key }), { expiresIn: 60 });
}
async function signedPut(st: StorageContext, key: string, contentType: string) {
  return getSignedUrl(st.s3, new PutObjectCommand({ Bucket: st.bucket, Key: key, ContentType: contentType }), { expiresIn: 60 });
}

async function loadReviews(st: StorageContext): Promise<ReviewsData> {
  const url = await signedGet(st, KEY);
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404 || !res.ok) return { reviews: [] };
  try {
    const data = (await res.json()) as ReviewsData;
    return Array.isArray(data.reviews) ? data : { reviews: [] };
  } catch {
    return { reviews: [] };
  }
}

async function saveReviews(st: StorageContext, data: ReviewsData): Promise<void> {
  const uploadUrl = await signedPut(st, KEY, "application/json");
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data, null, 2),
  });
  if (!put.ok) throw new Error(`Échec écriture stockage (${put.status})`);
}

function makeId() {
  return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const st = getStorage();
  if (!st) return NextResponse.json(storageConfigErrorJson(), { status: 503 });

  const body = (await req.json()) as {
    action?: "list" | "create" | "update" | "delete" | "reorder";
    id?: string;
    ids?: string[];
    author?: string;
    rating?: number;
    text?: string;
    date?: string;
    google_url?: string | null;
  };

  const action = body.action || "list";
  const data = await loadReviews(st);

  if (action === "list") return NextResponse.json(data);

  if (action === "create") {
    if (!body.author?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    const review: Review = {
      id: makeId(),
      author: body.author.trim(),
      rating: Math.min(5, Math.max(1, Math.round(body.rating ?? 5))),
      text: body.text?.trim() || "",
      date: body.date?.trim() || new Date().toISOString().slice(0, 10),
      google_url: body.google_url?.trim() || null,
    };
    await saveReviews(st, { reviews: [...data.reviews, review] });
    return NextResponse.json({ ok: true, id: review.id });
  }

  if (action === "update") {
    if (!body.id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    const next = {
      reviews: data.reviews.map((r) =>
        r.id === body.id
          ? {
              ...r,
              author: body.author?.trim() || r.author,
              rating: body.rating != null ? Math.min(5, Math.max(1, Math.round(body.rating))) : r.rating,
              text: body.text?.trim() ?? r.text,
              date: body.date?.trim() || r.date,
              google_url: body.google_url !== undefined ? (body.google_url?.trim() || null) : r.google_url,
            }
          : r,
      ),
    };
    await saveReviews(st, next);
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    if (!body.id) return NextResponse.json({ error: "id requis" }, { status: 400 });
    await saveReviews(st, { reviews: data.reviews.filter((r) => r.id !== body.id) });
    return NextResponse.json({ ok: true });
  }

  if (action === "reorder") {
    const ids = body.ids;
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids requis" }, { status: 400 });
    const idToReview = new Map(data.reviews.map((r) => [r.id, r]));
    const reordered = ids.map((id) => idToReview.get(id)).filter((r): r is Review => r != null);
    const rest = data.reviews.filter((r) => !(new Set(ids)).has(r.id));
    await saveReviews(st, { reviews: [...reordered, ...rest] });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
