"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function RotisserieScene({ children }: { children?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./rotisserie/createScene")
      .then((m) => {
        if (cancelled) return;
        try {
          dispose = m.createRotisserieScene(host, { reducedMotion, onReady: () => setReady(true) });
        } catch {
          // WebGL indisponible : l'image de repli reste affichée
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className="broche-scene" role="img" aria-label="Un cochon de lait cartoon tourne lentement sur sa broche au-dessus d'un feu de bois">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rotisserie-poster.webp"
        alt=""
        aria-hidden
        className={`broche-poster ${ready ? "broche-poster-hidden" : ""}`}
        draggable={false}
      />
      <div ref={hostRef} className="broche-canvas" />
      {children}
    </div>
  );
}
