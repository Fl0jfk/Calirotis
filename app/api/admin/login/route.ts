import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminPassword,
  createSessionToken,
  passwordMatches,
  sessionCookieOptions,
} from "../../../../lib/admin-auth";

// Anti force brute : 5 échecs par tranche de 10 minutes et par adresse IP.
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const FAIL_MAX = 5;
const fails = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

function recentFails(ip: string): number[] {
  const now = Date.now();
  const list = (fails.get(ip) || []).filter((t) => now - t < FAIL_WINDOW_MS);
  fails.set(ip, list);
  return list;
}

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  if (!adminPassword()) {
    return NextResponse.json({ error: "Mot de passe non configuré" }, { status: 503 });
  }
  const ip = clientIp(req);
  if (recentFails(ip).length >= FAIL_MAX) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }
  const pwd = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(pwd)) {
    recentFails(ip).push(Date.now());
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }
  const token = createSessionToken();
  if (!token) return NextResponse.json({ error: "Session impossible" }, { status: 500 });
  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions());
  return res;
}
