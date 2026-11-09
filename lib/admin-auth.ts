import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Session admin : cookie httpOnly signé (HMAC-SHA256) avec expiration.
 * Format du jeton : `<expiration en secondes epoch>.<signature base64url>`.
 *
 * Variables d'environnement serveur (jamais NEXT_PUBLIC_*) :
 * - ADMIN_PASSWORD        mot de passe de connexion
 * - ADMIN_SESSION_SECRET  secret de signature (32 caractères minimum)
 * Si l'une manque, toute requête admin est refusée.
 */

export const ADMIN_COOKIE_NAME = "calirotis_admin";
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 h
const COOKIE_PATH = "/api/admin";
const MIN_SECRET_LENGTH = 32;

function sessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim() || "";
  return s.length >= MIN_SECRET_LENGTH ? s : null;
}

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

export function isAdminAuthConfigured(): boolean {
  return sessionSecret() != null && adminPassword() != null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Comparaison à temps constant, quelle que soit la longueur des chaînes. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkAdminPassword(candidate: string): boolean {
  const expected = adminPassword();
  if (!expected || !sessionSecret()) return false;
  return safeEqual(candidate, expected);
}

export function createSessionToken(now = Date.now()): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = String(Math.floor(now / 1000) + ADMIN_SESSION_TTL_SECONDS);
  return `${exp}.${sign(exp, secret)}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  const secret = sessionSecret();
  if (!secret || !adminPassword() || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (!safeEqual(sig, sign(exp, secret))) return false;
  return Number(exp) * 1000 > now;
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Vrai uniquement si un cookie de session valide et non expiré est présent. Refus par défaut. */
export function isAdminAuthorized(req: Request): boolean {
  return verifySessionToken(readCookie(req, ADMIN_COOKIE_NAME));
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    // `secure` désactivé seulement en `next dev` (http://localhost, Safari refuse sinon le cookie).
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict" as const,
    path: COOKIE_PATH,
    maxAge,
  };
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions(ADMIN_SESSION_TTL_SECONDS));
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE_NAME, "", cookieOptions(0));
}
