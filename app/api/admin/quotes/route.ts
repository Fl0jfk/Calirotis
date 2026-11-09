import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "../../../../lib/admin-auth";
import { getStorage, storageConfigErrorJson, type StorageContext } from "../../../../lib/storage-env";

const KEY = "quotes.json";

type QuotesData = { quotes: unknown[] };

async function signedGet(st: StorageContext, key: string) {
  return getSignedUrl(st.s3, new GetObjectCommand({ Bucket: st.bucket, Key: key }), { expiresIn: 60 });
}

async function loadQuotes(st: StorageContext): Promise<QuotesData> {
  const url = await signedGet(st, KEY);
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404 || !res.ok) return { quotes: [] };
  try {
    const data = (await res.json()) as QuotesData;
    return Array.isArray(data.quotes) ? data : { quotes: [] };
  } catch {
    return { quotes: [] };
  }
}

export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) {
    return unauthorizedResponse();
  }
  const st = getStorage();
  if (!st) {
    return NextResponse.json(storageConfigErrorJson(), { status: 503 });
  }
  return NextResponse.json(await loadQuotes(st));
}
