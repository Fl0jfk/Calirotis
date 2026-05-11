"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactNode } from "react";

type NavbarProps = { announcement?: ReactNode};

export function Navbar({ announcement }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasAnnouncement = Boolean(announcement);
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex flex-col sm:max-h-4 md:h-20 m:h-4 md:max-h-20">
      {announcement ? (
        <div className="relative z-[60] w-full shrink-0 border-b border-white/10 bg-black/70 text-white shadow-sm backdrop-blur-md">
          {announcement}
        </div>
      ) : null}
      <div className="relative z-20 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex max-w-6xl items-center px-4 s md:overflow-hidden md:py-0">
          <div className="grid w-full grid-cols-3 items-center md:flex md:justify-between md:gap-6 lg:gap-8">
            <div className="flex min-w-0 items-center">
              <Link
                href="/"
                className="md:hidden"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src="/Logo.png"
                  alt="Calirotis"
                  width={50}
                  height={50}
                />
              </Link>
              <Link
                href="/"
                className="group hidden min-w-0 items-center gap-2.5 no-underline md:flex lg:gap-3"
                onClick={() => setMenuOpen(false)}
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden">
                  <Image
                    src="/Logo.png"
                    alt="Calirotis"
                    fill
                    className="object-contain scale-[1.4]"
                    sizes="80px"
                    priority
                  />
                </div>        
              </Link>
            </div>
            <div className="flex justify-center">
              <span className="whitespace-nowrap font-display text-[1.6rem] font-bold leading-tight text-white md:pl-[230px] lg:pl-[250px]">
                Calirotis
              </span>
            </div>
            <div className="flex items-center justify-end gap-6">
              <ul className="m-0 hidden list-none items-center gap-8 p-0 md:flex">
                <li>
                  <Link
                    href="/#about"
                    className="font-body text-sm font-semibold text-white/90 transition-colors hover:text-safran-300"
                  >
                    Qui sommes-nous ?
                  </Link>
                </li>
                <li>
                  <Link href="/#menu" className="font-body text-sm font-semibold text-white/90 transition-colors hover:text-safran-300">Nos plats</Link>
                </li>
                <li>
                  <Link href="/devis" className="btn btn-braise px-5 py-2 text-sm">🍽️ Réserver</Link>
                </li>
              </ul>
              <button
                type="button"
                className="flex h-10 w-10 cursor-pointer select-none flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-white/10 md:hidden"
                aria-label="Menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span
                  className={`block h-[2px] w-[22px] origin-center rounded-full bg-white transition-all duration-300 ${
                    menuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[2px] w-[22px] rounded-full bg-white transition-all duration-300 ${
                    menuOpen ? "scale-x-0 opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-[2px] w-[22px] origin-center rounded-full bg-white transition-all duration-300 ${
                    menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        id="nav-mobile"
        className={`fixed inset-0 z-10 box-border flex max-h-[100dvh] min-h-full flex-col overflow-y-auto bg-black/95 text-white transition-all duration-200 ease-out md:hidden ${
          hasAnnouncement
            ? "pt-[calc(env(safe-area-inset-top,0px)+63px+min(28vw,7.5rem))]"
            : "pt-[calc(env(safe-area-inset-top,0px)+63px)]"
        } ${
          menuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex flex-1 flex-col justify-center gap-2 px-6 py-8">
          <Link
            href="/#about"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 font-display text-2xl font-semibold text-white no-underline transition-colors hover:bg-white/10"
          >
            <span className="text-2xl">🏡</span>
            Qui sommes-nous ?
          </Link>
          <Link
            href="/#menu"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 font-display text-2xl font-semibold text-white no-underline transition-colors hover:bg-white/10"
          >
            <span className="text-2xl">🍖</span>
            Nos plats
          </Link>
          <Link
            href="/devis"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 font-display text-2xl font-semibold text-white no-underline transition-colors hover:bg-white/10"
          >
            <span className="text-2xl">🍽️</span>
            Demander un devis
          </Link>
          <div className="my-2 border-t border-white/15" />
          <a
            href="https://www.facebook.com/p/Calir%C3%B4tis-Traiteur-61554143394633/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 font-display text-2xl font-semibold text-white no-underline transition-colors hover:bg-white/10"
          >
            <span className="text-2xl">📘</span>
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@calirotis"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 font-display text-2xl font-semibold text-white no-underline transition-colors hover:bg-white/10"
          >
            <span className="text-2xl">🎵</span>
            TikTok
          </a>
          <a
            href="tel:0699512290"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 font-display text-2xl font-semibold text-safran-300 no-underline transition-colors hover:bg-white/20"
          >
            <span className="text-2xl">📞</span>
            06.99.51.22.90
          </a>
        </div>
        <div className="shrink-0 border-t border-white/10 px-6 py-6">
          <Link href="/devis" onClick={() => setMenuOpen(false)} className="btn btn-braise flex w-full justify-center py-4 text-base">🍽️ Réserver un événement</Link>
        </div>
      </div>
    </nav>
  );
}
