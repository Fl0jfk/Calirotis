import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminRequest } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

/** Dit au navigateur s'il est connecté (cookie de session valide). Jamais mis en cache. */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false }, { status: 401, headers: NO_STORE });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

/** Déconnexion : supprime le cookie de session. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
