"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type CollagePhoto = { id: string; src: string; alt: string };

const WIDTHS = [288, 224, 256, 240, 272, 232, 256, 248];
const ASPECTS = ["4/3", "3/4", "1/1", "4/5", "3/2", "1/1", "4/3", "3/4"];
const ROTATIONS = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3.5, 2];
const OFFSETS = [0, 28, -8, 22, 6, 30, -6, 20];

function captionOf(alt: string) {
  const t = alt.trim();
  return t && !/^photo( traiteur)?$/i.test(t) ? t : null;
}

export function MomentsMontage() {
  const [photos, setPhotos] = useState<CollagePhoto[]>([]);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/public/collage");
        if (!active || !r.ok) return;
        const raw = (await r.json()) as { photos?: CollagePhoto[] };
        if (!Array.isArray(raw.photos)) return;
        setPhotos(raw.photos.filter((p) => p && typeof p.src === "string" && p.src.trim().length > 0));
      } catch {
        /* section masquée si les photos ne sont pas disponibles */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el || photos.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [photos.length]);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? null : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  if (photos.length === 0) return null;
  const current = open === null ? null : photos[open];

  return (
    <section
      id="moments"
      className="relative overflow-hidden bg-gradient-to-br from-ardoise-800 to-ardoise-900 py-24 text-white"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, #e8a030 1px, transparent 1px)", backgroundSize: "44px 44px" }}
      />
      <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-bordeaux-700/25 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-safran-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <span className="section-label mb-3 block text-safran-400">Nos moments</span>
          <h2 className="section-title mb-4 text-white">
            Des souvenirs qui sentent <span className="text-safran-400">bon la braise</span>
          </h2>
          <p className="mx-auto max-w-xl font-body text-ardoise-300">
            Mariages, fêtes de famille, marchés et soirées d&apos;entreprise : un petit aperçu de nos
            rôtisseries en action.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-x-5 gap-y-8 pb-6 md:flex md:flex-wrap md:items-start md:justify-center md:gap-x-8 md:gap-y-10"
        >
          {photos.map((p, i) => {
            const k = i % WIDTHS.length;
            const caption = captionOf(p.alt);
            const style = {
              "--r": `${ROTATIONS[k]}deg`,
              "--dy": `${OFFSETS[k]}px`,
              "--w": `${WIDTHS[k]}px`,
              "--d": `${i * 90}ms`,
            } as CSSProperties;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpen(i)}
                style={style}
                className={`montage-card group relative text-left ${shown ? "montage-in" : "montage-pre"}`}
                aria-label={`Agrandir la photo : ${caption ?? p.alt}`}
              >
                <span className="montage-tape" aria-hidden />
                <span className="block rounded-md border-4 border-[#1a1a1a] bg-creme-50 p-2 shadow-[6px_6px_0_#111] transition-shadow duration-300 group-hover:shadow-[9px_9px_0_#111]">
                  <span className="relative block overflow-hidden rounded-sm border-2 border-[#1a1a1a]" style={{ aspectRatio: ASPECTS[k] }}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      unoptimized={p.src.startsWith("/api/")}
                      sizes="(max-width: 768px) 46vw, 290px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  {caption ? (
                    <span className="mt-2 block px-1 pb-0.5 text-center font-hand text-base leading-tight text-ardoise-800">
                      {caption}
                    </span>
                  ) : (
                    <span className="block h-2" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative h-[78vh] w-full max-w-4xl overflow-hidden rounded-xl border-4 border-[#1a1a1a] bg-black shadow-[8px_8px_0_#111]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              unoptimized={current.src.startsWith("/api/")}
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-contain"
            />
            {captionOf(current.alt) ? (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 text-center font-hand text-xl">
                {captionOf(current.alt)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-safran-500 text-xl font-bold text-ardoise-900 shadow-[3px_3px_0_#111]"
            aria-label="Fermer"
          >
            ✕
          </button>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-creme-50 text-xl font-bold text-ardoise-900 shadow-[3px_3px_0_#111]"
                aria-label="Photo précédente"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-creme-50 text-xl font-bold text-ardoise-900 shadow-[3px_3px_0_#111]"
                aria-label="Photo suivante"
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

