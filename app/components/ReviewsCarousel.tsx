"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WalkingPig } from "./WalkingPig";

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  google_url?: string | null;
};

const DURATION = 7000;
const PIG_W = 76;
const GOOGLE_PAGE = "https://www.google.com/maps?cid=9889569065101112204";

function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} flex-shrink-0`} aria-label="Google" role="img">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`${cls} ${n <= rating ? "text-safran-400" : "text-creme-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          stroke="#1a1a1a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const AVATAR_COLORS = ["bg-bordeaux-700", "bg-ardoise-700", "bg-bordeaux-600", "bg-ardoise-800", "bg-safran-700"];

function authorColor(name: string): string {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

function ReviewBubble({ review, active }: { review: Review; active: boolean }) {
  return (
    <article
      aria-hidden={!active}
      className="relative flex h-full flex-col rounded-3xl border-4 border-[#1a1a1a] bg-creme-50 p-6 pt-7 shadow-[6px_6px_0_#111] sm:p-7 sm:pt-8"
    >
      <span aria-hidden className="absolute left-5 top-3 font-display text-[5.5rem] leading-[0.75] text-bordeaux-700 [text-shadow:2px_2px_0_#1a1a1a]">
        &ldquo;
      </span>
      <div className="mb-2 flex items-center justify-between gap-3 pl-14">
        <Stars rating={review.rating} />
        <GoogleLogo />
      </div>
      <div className="flex flex-1 items-center py-2">
        <p className={`${review.text.length < 90 ? "font-hand text-2xl leading-snug sm:text-3xl" : review.text.length < 240 ? "font-body text-lg leading-relaxed sm:text-xl" : "font-body text-base leading-relaxed sm:text-[17px]"} text-ardoise-800`}>
          {review.text}
        </p>
      </div>
      <footer className="mt-5 flex items-center justify-between gap-3 border-t-2 border-dashed border-ardoise-300 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#1a1a1a] font-display text-base text-white ${authorColor(review.author)}`}
          >
            {review.author.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-hand text-lg leading-tight text-ardoise-900">{review.author}</p>
            <p className="text-xs capitalize text-ardoise-600">{formatDate(review.date)}</p>
          </div>
        </div>
        {review.google_url ? (
          <a
            href={review.google_url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={active ? 0 : -1}
            className="flex-shrink-0 rounded-full border-2 border-[#1a1a1a] bg-white px-3 py-1 text-xs font-semibold text-bordeaux-700 transition-colors hover:bg-safran-100"
          >
            Voir l&apos;avis ↗
          </a>
        ) : null}
      </footer>
    </article>
  );
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const total = reviews.length;
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const reducedRef = useRef(false);
  const elapsedRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const pigRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/public/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { reviews?: Review[] } | null) => {
        if (Array.isArray(d?.reviews)) setReviews(d.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback(
    (to: number) => {
      if (total === 0) return;
      const next = ((to % total) + total) % total;
      setPrevIndex(indexRef.current);
      indexRef.current = next;
      elapsedRef.current = 0;
      setIndex(next);
    },
    [total],
  );

  useEffect(() => {
    if (total === 0) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => (visibleRef.current = e.some((x) => x.isIntersecting)), { threshold: 0.05 });
    io.observe(el);

    let raf = 0;
    let last = 0;
    let x = 0;
    let dir = 1;
    let walking = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (!visibleRef.current || document.hidden) return;

      const auto = !pausedRef.current && !reducedRef.current;
      if (auto) {
        elapsedRef.current += dt * 1000;
        if (elapsedRef.current >= DURATION) go(indexRef.current + 1);
      }
      const target = (indexRef.current + elapsedRef.current / DURATION) / total;
      const diff = target - x;
      x += diff * Math.min(1, dt * 3.2);
      if (diff > 0.003) dir = 1;
      else if (diff < -0.003) dir = -1;

      const shouldWalk = auto || Math.abs(diff) > 0.01;
      if (shouldWalk !== walking) {
        walking = shouldWalk;
        pigRef.current?.classList.toggle("pig-walking", walking);
      }
      const run = Math.abs(diff) > 0.15;
      pigRef.current?.classList.toggle("pig-running", run);

      const left = `calc((100% - ${PIG_W}px) * ${Math.min(1, Math.max(0, x))})`;
      if (pigRef.current) pigRef.current.style.left = left;
      if (flipRef.current) flipRef.current.style.transform = `scaleX(${dir})`;
      if (tailRef.current) {
        tailRef.current.style.left = `clamp(34px, calc((100% - ${PIG_W}px) * ${Math.min(1, Math.max(0, x))} + ${PIG_W / 2}px), calc(100% - 34px))`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [total, go]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
      </div>
    );
  }
  if (total === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
  const googleUrl = reviews.find((r) => r.google_url)?.google_url || GOOGLE_PAGE;

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocusCapture={() => (pausedRef.current = true)}
      onBlurCapture={() => (pausedRef.current = false)}
    >
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-3 rounded-full border-4 border-[#1a1a1a] bg-white px-5 py-2 shadow-[4px_4px_0_#111]">
          <GoogleLogo className="h-6 w-6" />
          <span className="font-display text-2xl leading-none text-ardoise-900">{avg.toFixed(1).replace(".", ",")}</span>
          <Stars rating={Math.round(avg)} size="sm" />
          <span className="text-sm font-semibold text-ardoise-700">{total} avis Google</span>
        </div>
      </div>

      <div
        className="relative mx-auto max-w-3xl"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(indexRef.current + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="grid grid-cols-1" aria-live="polite">
          {reviews.map((review, i) => {
            const state = i === index ? "is-active" : i === prevIndex ? "is-prev" : "is-next";
            return (
              <div key={review.id} className={`review-slide ${state}`} style={{ gridArea: "1 / 1" }}>
                <ReviewBubble review={review} active={i === index} />
              </div>
            );
          })}
        </div>
        <span
          ref={tailRef}
          aria-hidden
          className="pointer-events-none absolute -bottom-[15px] z-10 h-7 w-7 -translate-x-1/2 rotate-45 border-b-4 border-r-4 border-[#1a1a1a] bg-creme-50"
          style={{ left: "50%" }}
        />

        <button
          type="button"
          onClick={() => go(index - 1)}
          className="absolute -left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#1a1a1a] bg-white text-xl font-bold text-ardoise-900 shadow-[3px_3px_0_#111] transition-transform hover:-translate-y-[55%] sm:flex md:-left-14"
          aria-label="Avis précédent"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          className="absolute -right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#1a1a1a] bg-white text-xl font-bold text-ardoise-900 shadow-[3px_3px_0_#111] transition-transform hover:-translate-y-[55%] sm:flex md:-right-14"
          aria-label="Avis suivant"
        >
          ›
        </button>
      </div>

      <div className="relative mx-auto mt-7 max-w-3xl">
        <div className="relative h-[64px]">
          <div ref={pigRef} className="pig-walking absolute bottom-[8px]" style={{ left: 0, width: PIG_W }}>
            <div ref={flipRef} style={{ transformOrigin: "50% 100%" }}>
              <WalkingPig width={PIG_W} />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-[10px] items-center border-t-4 border-dashed border-ardoise-400">
            <div className="absolute inset-x-0 -top-[4px] flex">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Aller à l'avis ${i + 1}`}
                  className="group flex h-6 flex-1 items-start justify-center"
                >
                  <span className={`mt-[3px] block h-2 w-2 rounded-full border-2 border-[#1a1a1a] transition-colors ${i === index ? "bg-bordeaux-700" : "bg-white group-hover:bg-safran-400"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="font-hand text-sm text-ardoise-600">
            Avis {index + 1} / {total}
          </span>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline border-[3px] px-6 py-2.5 text-sm shadow-[3px_3px_0_#111]"
          >
            <GoogleLogo className="h-4 w-4" /> Voir tous les avis sur Google
          </a>
        </div>
      </div>
    </div>
  );
}



