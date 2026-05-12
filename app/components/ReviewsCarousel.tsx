"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  google_url?: string | null;
};

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" aria-label="Google">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} className={`${cls} ${n <= rating ? "text-yellow-400" : "text-gray-200"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-red-500", "bg-pink-500", "bg-purple-600", "bg-indigo-500",
  "bg-blue-500", "bg-cyan-600", "bg-teal-500", "bg-green-600",
  "bg-orange-500", "bg-rose-500",
];

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

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${authorColor(review.author)}`}>
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold leading-tight text-gray-900">{review.author}</p>
            <Stars rating={review.rating} />
          </div>
        </div>
        <GoogleLogo />
      </div>

      <p className="flex-1 font-body text-sm leading-relaxed text-gray-600">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
        <span className="text-xs text-gray-400">{formatDate(review.date)}</span>
        {review.google_url ? (
          <a
            href={review.google_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            Voir l&apos;avis
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : null}
      </div>
    </div>
  );
}

function avgRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/public/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { reviews?: Review[] } | null) => {
        if (Array.isArray(d?.reviews)) setReviews(d.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = reviews.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, total, paused]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
      </div>
    );
  }

  if (total === 0) return null;

  const avg = avgRating(reviews);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Stars rating={Math.round(avg)} size="md" />
          <span className="font-semibold text-gray-800">{avg.toFixed(1)}</span>
          <span className="text-sm text-gray-500">— {total} avis</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <GoogleLogo />
          <span>Avis Google vérifiés</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-2xl px-10">
        {total > 1 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
            aria-label="Avis précédent"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="w-full flex-shrink-0 px-1">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {total > 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
            aria-label="Avis suivant"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-bordeaux-700" : "w-2 bg-gray-300"}`}
              aria-label={`Aller à l'avis ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
