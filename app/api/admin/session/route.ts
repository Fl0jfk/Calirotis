import { NextResponse } from "next/server";
import { clearSessionCookie, isAdminAuthorized } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

/** Indique si le cookie de session admin est valide. */
export async function GET(req: Request) {
  return NextResponse.json(
    { authenticated: isAdminAuthorized(req) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Déconnexion : supprime le cookie de session. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
