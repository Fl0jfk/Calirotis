import { S3Client } from "@aws-sdk/client-s3";

export type StorageContext = {
  s3: S3Client;
  bucket: string;
  region: string;
};

let cache: StorageContext | null = null;
let cacheKey = "";

function hasNonEmptyEnv(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

function presentEnv(keys: string[]): string[] {
  return keys.filter((k) => hasNonEmptyEnv(k));
}

function resolveBucket(): string {
  return ( process.env.BUCKET_NAME || process.env.STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "").trim();
}

function resolveRegion(): string {
  return (  process.env.REGION || process.env.STORAGE_REGION || process.env.AWS_REGION || "eu-west-3").trim();
}

export function storageRuntimeDebug() {
  const bucketKeys = ["BUCKET_NAME", "STORAGE_BUCKET", "S3_BUCKET_NAME"];
  const regionKeys = ["REGION", "STORAGE_REGION", "AWS_REGION"];
  const accessKeys = ["ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID"];
  const secretKeys = ["SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY"];

  const bucketLen = resolveBucket().length;
  const fromEnvKeys = presentEnv(bucketKeys);

  return {
    node_env: process.env.NODE_ENV || "",
    bucket_resolved: resolveBucket() ? "(non-vide)" : "(vide)",
    bucket_value_len: bucketLen,
    /** Si vide alors que bucket_resolved est non-vide, le nom vient souvent du build (ex. next.config `env`). */
    present_bucket_keys: fromEnvKeys,
    region_resolved: resolveRegion() || "",
    present_region_keys: presentEnv(regionKeys),
    present_access_key_keys: presentEnv(accessKeys),
    present_secret_key_keys: presentEnv(secretKeys),
  };
}

/** SDK default chain could not find keys / instance role (typique sur Amplify sans clés ni rôle S3). */
export function isS3CredentialsProviderError(e: unknown): boolean {
  const err = e as { name?: string; message?: string };
  if (err.name === "CredentialsProviderError") return true;
  const m = (err.message || "").toLowerCase();
  return m.includes("could not load credentials");
}

export function storageCredentialsMissingErrorJson(e: unknown) {
  const err = e as { name?: string; message?: string };
  return {
    error:
      "AWS : aucune identité pour S3 (CredentialsProviderError). Sur Amplify, ajoutez les variables **AWS_ACCESS_KEY_ID** et **AWS_SECRET_ACCESS_KEY** (ou **ACCESS_KEY_ID** + **SECRET_ACCESS_KEY** comme en local), puis redéployez. Alternative : attacher un rôle IAM au compute Amplify avec s3:GetObject / PutObject sur ce bucket.",
    debug: storageRuntimeDebug(),
    name: err.name || "CredentialsProviderError",
    message: err.message || "",
  };
}

export function getStorage(): StorageContext | null {
  const bucket = resolveBucket();
  if (!bucket) return null;
  const region = resolveRegion();
  const accessKeyId = process.env.ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const key = `${bucket}\0${region}\0${accessKeyId || ""}`;
  if (cache && cacheKey === key) return cache;
  const s3 = accessKeyId && secretAccessKey ? new S3Client({ region, credentials: { accessKeyId, secretAccessKey } }) : new S3Client({ region });
  cache = { s3, bucket, region };
  cacheKey = key;
  return cache;
}

export function storageConfigErrorJson() {
  return {
    error:
      "Stockage non configuré (bucket introuvable au runtime). Sur Amplify, ajoutez les variables dans Hosting → Environment variables et assurez-vous qu’elles s’appliquent au **runtime/SSR** (pas seulement au build), puis redéployez.",
    debug: storageRuntimeDebug(),
  };
}
