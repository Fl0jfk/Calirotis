import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "calirotis_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

/** Mot de passe de l'espace admin (variable d'environnement, jamais écrit dans le code). */
export function adminPassword(): string | undefined {
  const v = process.env.ADMIN_PASSWORD?.trim() || process.env.NEXT_PUBLIC_ADMIN_PASSWORD?.trim();
  return v || undefined;
}

/** Clé qui signe le cookie de session : ADMIN_SESSION_SECRET si défini, sinon dérivée du mot de passe. */
function signingKey(): string | undefined {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  const pwd = adminPassword();
  return pwd ? `calirotis-admin-session:${pwd}` : undefined;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Compare deux mots de passe sans fuite par le temps de réponse. */
export function passwordMatches(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const h = (s: string) => createHmac("sha256", "calirotis-pwd-compare").update(s).digest();
  return timingSafeEqual(h(input), h(expected));
}

export function createSessionToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${expires}.${sign(`admin.${expires}`, key)}`;
}

function verifySessionToken(token: string | null | undefined): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!(Number(expires) > Date.now())) return false;
  return safeEqual(signature, sign(`admin.${expires}`, key));
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/**
 * Une requête est « admin » si elle porte un cookie de session valide (obtenu après connexion avec le mot de
 * passe) ou, pour d'éventuels scripts, la clé x-admin-key égale à ADMIN_API_KEY quand elle est définie.
 * Sans mot de passe configuré, tout est refusé (jamais d'accès ouvert par défaut).
 */
export function isAdminRequest(req: Request): boolean {
  if (verifySessionToken(readCookie(req, ADMIN_COOKIE))) return true;
  const apiKey = process.env.ADMIN_API_KEY?.trim();
  const sent = req.headers.get("x-admin-key");
  return Boolean(apiKey && sent && safeEqual(sent, apiKey));
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
