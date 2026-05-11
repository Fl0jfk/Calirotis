import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getStorage, storageConfigErrorJson, type StorageContext } from "../../../../lib/storage-env";

function isAdminAuthorized(req: Request): boolean {
  const expected = process.env.ADMIN_API_KEY || "";
  if (!expected) return true;
  return req.headers.get("x-admin-key") === expected;
}

async function signedPut(st: StorageContext, key: string, contentType: string) {
  return getSignedUrl(
    st.s3,
    new PutObjectCommand({ Bucket: st.bucket, Key: key, ContentType: contentType }),
    { expiresIn: 60 },
  );
}

function publicMediaUrl(objectKey: string) {
  return `/api/public/media?key=${encodeURIComponent(objectKey)}`;
}

const LOG = "[Calirotis upload-photo]";
function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") console.info(LOG, ...args);
}

export async function POST(req: Request) {
  devLog("POST reçu");
  if (!isAdminAuthorized(req)) {
    console.warn(LOG, "refus: clé admin manquante ou incorrecte (header x-admin-key)");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  devLog("auth admin OK");
  const st = getStorage();
  if (!st) {
    console.error(LOG, "stockage indisponible: getStorage() null — vérifier BUCKET_NAME / REGION / credentials en variables d’environnement runtime");
    return NextResponse.json(storageConfigErrorJson(), { status: 503 });
  }
  devLog("S3 client prêt (bucket configuré)");

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    console.warn(LOG, "400: champ file absent ou non-File", { type: typeof file });
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  devLog("fichier", { name: file.name, size: file.size, mime: file.type || "(vide)" });
  if (!file.type.startsWith("image/")) {
    console.warn(
      LOG,
      "400: type MIME non reconnu comme image — si Safari/iOS, le type est souvent vide: renommer le fichier avec une extension (.jpg) ou convertir en JPEG",
      { mime: file.type, name: file.name },
    );
    return NextResponse.json({ error: "Image requise" }, { status: 400 });
  }
  const ext = file.type.split("/")[1] || "bin";
  const objectKey = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  let upload_url: string;
  try {
    upload_url = await signedPut(st, objectKey, file.type);
  } catch (e) {
    console.error(LOG, "échec génération URL signée (presign)", e);
    return NextResponse.json({ error: "Impossible de préparer l’upload S3" }, { status: 502 });
  }
  devLog("presign OK, PUT vers objet", objectKey.slice(0, 48) + "…");
  // Buffer explicite : avec `body: File`, le fetch Node/undici a parfois envoyé un corps vide
  // vers S3 (PUT 200 mais objet absent → GET /api/public/media 404 / NoSuchKey).
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) {
    console.warn(LOG, "fichier lu comme 0 octet — abandon");
    return NextResponse.json({ error: "Fichier vide ou illisible" }, { status: 400 });
  }
  devLog("corps PUT", { bytes: bytes.length });
  const put = await fetch(upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: bytes,
  });
  if (!put.ok) {
    const errBody = await put.text().catch(() => "");
    console.error(LOG, "PUT S3 refusé", {
      status: put.status,
      statusText: put.statusText,
      bodyPreview: errBody.slice(0, 400),
    });
    return NextResponse.json({ error: "Upload refusé par le stockage" }, { status: 502 });
  }
  const photoUrl = publicMediaUrl(objectKey);
  devLog("OK, objet écrit", { objectKey, photoUrl });
  return NextResponse.json({ photo_url: photoUrl });
}
