import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getStorage, storageConfigErrorJson, type StorageContext } from "../../../../lib/storage-env";

const KEY = "reviews.json";

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  google_url?: string | null;
};

export type ReviewsData = { reviews: Review[] };

async function loadReviews(st: StorageContext): Promise<ReviewsData> {
  const url = await getSignedUrl(st.s3, new GetObjectCommand({ Bucket: st.bucket, Key: KEY }), { expiresIn: 60 });
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404 || !res.ok) return { reviews: [] };
  try {
    const data = (await res.json()) as ReviewsData;
    return Array.isArray(data.reviews) ? data : { reviews: [] };
  } catch {
    return { reviews: [] };
  }
}

export async function GET() {
  const st = getStorage();
  if (!st) return NextResponse.json(storageConfigErrorJson(), { status: 503 });
  const data = await loadReviews(st);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
