import { NextResponse } from "next/server";
import {
  checkAdminPassword,
  createSessionToken,
  isAdminAuthConfigured,
  setSessionCookie,
} from "../../../../lib/admin-auth";

export async function POST(req: Request) {
  let body: { password?: unknown };
  try {
    body = (await req.json()) as { password?: unknown };
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  if (!isAdminAuthConfigured()) {
    console.error("[Calirotis admin] ADMIN_PASSWORD ou ADMIN_SESSION_SECRET (≥ 32 caractères) manquant");
    return NextResponse.json({ error: "Connexion admin non configurée" }, { status: 503 });
  }
  const pwd = typeof body.password === "string" ? body.password : "";
  if (!checkAdminPassword(pwd)) {
    // Petit délai pour ralentir les essais en série.
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }
  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Connexion admin non configurée" }, { status: 503 });
  }
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}
