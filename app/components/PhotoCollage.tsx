"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type CollagePhoto = { id: string; src: string; alt: string };
type CollageResponse = { photos?: CollagePhoto[] };

function collageJsonUrl() { return "/api/public/collage"}

export function PhotoCollage() {
  const [photos, setPhotos] = useState<CollagePhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch(collageJsonUrl(), { cache: "no-store" });
        if (!active) return;
        if (!r.ok) {
          setPhotos([]);
          return;
        }
        const raw = (await r.json()) as CollageResponse;
        const nextPhotos = Array.isArray(raw.photos)
          ? raw.photos.filter((p) => p && typeof p.src === "string" && p.src.trim().length > 0)
          : [];
        setPhotos(nextPhotos);
      } catch {
        if (active) setPhotos([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (photos.length === 0) return;
    const id = window.setInterval(() => {
      setIsTurning(true);
      window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 1500);
      window.setTimeout(() => {
        setIsTurning(false);
      }, 3000);
    }, 6200);
    return () => window.clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) return null;
  const currentPhoto = photos[currentIndex % photos.length];

  return (
    <div className="broche-scene" aria-label="Broche tournante">
      <div className="broche-support broche-support-left" />
      <div className="broche-support broche-support-right" />

      <div className="broche-spit" />
      <div className={`broche-meat-wrap ${isTurning ? "broche-meat-wrap-turn" : ""}`}>
        <div className="broche-pin-tip" />
        <div className="broche-pin-tip broche-pin-tip-end" />
        <div className="broche-single">
          <Image src={currentPhoto.src} alt={currentPhoto.alt} fill sizes="320px" className="object-cover" />
        </div>
      </div>

      <div className="broche-embers" />
      <div className="broche-log broche-log-left" />
      <div className="broche-log broche-log-right" />
      <div className="broche-flame broche-flame-left"><div className="broche-flame-body" /></div>
      <div className="broche-flame broche-flame-center"><div className="broche-flame-body" /></div>
      <div className="broche-flame broche-flame-right"><div className="broche-flame-body" /></div>
      <div className="broche-smoke broche-smoke-1" />
      <div className="broche-smoke broche-smoke-2" />
      <div className="broche-smoke broche-smoke-3" />
      <div className="broche-shadow" />
      <div className="broche-glow" />
      <div className="broche-ground" />
      <div className="broche-grass broche-grass-left" />
      <div className="broche-grass broche-grass-right" />
      <div className="broche-grass broche-grass-mid" />
    </div>
  );
}
