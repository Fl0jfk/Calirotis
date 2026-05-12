"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import feteImg from "./assets/Fête.webp";
import mariageImg from "./assets/Mariage.webp";
import businessImg from "./assets/Business.webp";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { PhotoCollage } from "./components/PhotoCollage";
import { getBlurDataURL } from "./lib/image-placeholder";
import { ReviewsCarousel } from "./components/ReviewsCarousel";
type MenuCategoryNorm = "starter" | "main_dish" | "dessert";
type MarketEntry = { id: string; date: string; place: string };
type MarketsData = { markets: MarketEntry[] };
type MenuItem = { id: string; name: string; description: string; photo_url?: string | null; category: string; partner_name?: string | null; partner_url?: string | null; partner_logo_url?: string | null};
type MenuData = { items: MenuItem[] };

const CATS: MenuCategoryNorm[] = ["starter", "main_dish", "dessert"];

function menuJsonUrl() { return "/api/public/menu"}

function marketJsonUrl() { return "/api/public/market"}

function normalizeMenuCategory(raw: string): MenuCategoryNorm {
  const lower = raw.trim().toLowerCase().replace(/-/g, "_");
  if (lower === "maindish" || lower === "main_dish") return "main_dish";
  if (lower === "dessert" || lower === "desserts") return "dessert";
  return "starter";
}

function categoryLabel(c: MenuCategoryNorm) {
  if (c === "main_dish") return "Plat principal";
  if (c === "dessert") return "Dessert";
  return "Entrée";
}

function categoryEmoji(c: MenuCategoryNorm) {
  if (c === "main_dish") return "🍲";
  if (c === "dessert") return "🍮";
  return "🥗";
}

function formatMarketDate(dateText: string): string {
  const dt = new Date(dateText);
  if (Number.isNaN(dt.getTime())) return dateText;
  return dt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function filterUpcomingMarketsWithinWeek(entries: MarketEntry[]): MarketEntry[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);
  return entries
    .filter((m) => {
      const d = new Date(m.date);
      if (Number.isNaN(d.getTime())) return false;
      return d >= start && d <= end;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function HomePage() {
  const blurDataURL = useMemo(() => getBlurDataURL(), []);
  const isProxiedMedia = (src: string) => src.startsWith("/api/public/media?");
  const [marketsData, setMarketsData] = useState<MarketsData | null | undefined>(undefined);
  const [menu, setMenu] = useState<MenuData | null | undefined>(undefined);
  const visibleMarkets = useMemo(() => {
    if (!marketsData?.markets) return [];
    return filterUpcomingMarketsWithinWeek(marketsData.markets);
  }, [marketsData]);
  const marketAnnouncement =
    visibleMarkets.length > 0 ? (
      <div className="mx-auto max-w-6xl px-3 py-2.5 text-center sm:px-4 sm:py-3">
        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-center sm:gap-3">
          <span className="text-lg leading-none sm:text-xl">🛖</span>
          <p className="font-body text-sm font-medium leading-snug">
            Retrouvez-nous le <strong>{formatMarketDate(visibleMarkets[0].date)}</strong>
            {visibleMarkets[0].place ? ` — ${visibleMarkets[0].place}` : ""}.
          </p>
        </div>
        {visibleMarkets.length > 1 ? (
          <ul className="mt-2 space-y-1 border-t border-white/20 pt-2 text-xs font-medium text-white/90 sm:text-sm">
            {visibleMarkets.slice(1).map((m) => (
              <li key={m.id}>
                Aussi le {formatMarketDate(m.date)}
                {m.place ? ` — ${m.place}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    ) : null;
  useEffect(() => {
    let ok = true;
    (async () => {
      const [mRes, menuRes] = await Promise.all([fetch(marketJsonUrl()), fetch(menuJsonUrl())]);
      if (!ok) return;
      if (mRes.ok) {
        const raw = (await mRes.json()) as MarketsData;
        setMarketsData(Array.isArray(raw.markets) ? raw : { markets: [] });
      } else { setMarketsData({ markets: [] })}
      setMenu(menuRes.ok ? ((await menuRes.json()) as MenuData) : { items: [] });
    })();
    return () => { ok = false};
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar announcement={marketAnnouncement} />
      <section
        className={
          visibleMarkets.length > 0
            ? visibleMarkets.length > 1
              ? "relative flex min-h-screen items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+10.5rem)]"
              : "relative flex min-h-screen items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+9.5rem)]"
            : "relative flex min-h-screen items-center justify-center pt-[calc(env(safe-area-inset-top,0px)+5.75rem)]"
        }
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ardoise-700 via-ardoise-800 to-ardoise-900" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle, #e8a030 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-bordeaux-700/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-safran-500/15 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <div
            className={
              visibleMarkets.length > 0 ? "flex justify-center px-0 pt-2 max-sm:pt-9 sm:px-6" : "flex justify-center px-0 max-sm:pt-5 sm:px-6"
            }
          >
            <PhotoCollage />
          </div>
          <div className="mt-6 pb-4 md:mt-8">
          <div className="broche-label">
            <span>Cuisson lente à la broche</span>
          </div>
            <p className="mb-3 font-hand text-2xl text-ardoise-300 pt-8">Rôtisserie événementielle</p>
            <p className="mb-8 max-w-2xl font-body text-lg leading-relaxed text-ardoise-300 mx-auto px-6">
              Cochon de lait, méchoui et barbecue géant pour vos événements privés ou pros.
              Une cuisine conviviale, généreuse et cuite lentement, avec des produits frais et
              une organisation carrée du début à la fin.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/devis" className="btn btn-braise px-10 py-4 text-base">🍽️ Demander un devis</Link>
              <Link href="#menu" className="btn btn-ghost px-8 py-4 text-base">Voir notre carte</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-bordeaux-700 py-16 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              ["🔥", "Rôtisserie en direct"],
              ["🐖", "Cochon de lait & méchoui"],
              ["🥩", "Barbecue géant"],
              ["✅", "Service pro & abordable"],
            ].map(([a, b]) => (
              <div key={b}>
                <p className="mb-1 font-display text-4xl text-safran-400">{a}</p>
                <p className="font-body text-sm text-bordeaux-200">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="about" className="bg-creme-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div className="relative flex justify-center">
              <div className="relative">
                <Image src="/Logo.png" alt="Calirotis" className="drop-shadow-xl" width={300} height={300}/>
                <div className="absolute -bottom-4 -right-4 rounded-2xl bg-safran-500 px-5 py-3 text-white shadow-lg">
                  <p className="font-hand text-lg font-bold">Devis gratuit !</p>
                </div>
                <div className="absolute -left-4 -top-4 rounded-2xl bg-bordeaux-700 px-4 py-2 text-white shadow-lg">
                  <p className="font-hand text-base">Fait maison</p>
                </div>
              </div>
            </div>
            <div>
              <span className="section-label mb-3 block text-safran-600">Qui suis-je ?</span>
              <h2 className="section-title mb-6 leading-tight text-ardoise-800">
                Une rôtisserie <span className="text-bordeaux-700">authentique</span>
                <br />
                pour vos grands moments
              </h2>
              <p className="mb-4 font-body leading-relaxed text-ardoise-600">
                Je suis Martin. Après 5 années chez un traiteur, j&apos;ai lancé Calirotis pour me
                spécialiser dans la rôtisserie : cochon de lait, méchoui et barbecue géant.
                J&apos;interviens sur les marchés, les mariages et les événements d&apos;entreprise avec
                un stand chaleureux et une prestation clé en main.
              </p>
              <p className="mb-8 font-body leading-relaxed text-ardoise-600">
                J&apos;accorde une importance primordiale à la qualité des produits et du service :
                ingrédients sélectionnés avec soin, cuisson maîtrisée, présentation propre et
                accompagnement pro pour que vous profitiez pleinement de votre événement.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="tag bg-bordeaux-100 text-bordeaux-700">🏢 Entreprises</span>
                <span className="tag bg-safran-100 text-safran-700">💍 Mariages & cérémonies</span>
                <span className="tag bg-creme-200 text-ardoise-700">🐖 Cochon de lait</span>
                <span className="tag bg-creme-200 text-ardoise-700">🔥 Barbecue géant</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="menu" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <span className="section-label mb-3 block text-safran-600">Notre carte</span>
            <h2 className="section-title mb-4 text-ardoise-800">
              Des saveurs <span className="text-bordeaux-700">qui régalent</span>
            </h2>
            <p className="mx-auto max-w-xl font-body text-ardoise-500">
              Une carte rôtisserie pensée pour les repas de fête, avec des options adaptées
              au nombre d&apos;invités et à votre type d&apos;événement.
            </p>
          </div>
          {menu === undefined ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-bordeaux-700 border-t-transparent" />
            </div>
          ) : menu === null ? (
            <div className="px-4 py-16 text-center">
              <p className="font-body text-ardoise-600">
                La carte ne peut pas être chargée pour le moment (réseau ou configuration).
              </p>
            </div>
          ) : menu.items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🍖</div>
              <p className="font-hand text-2xl text-ardoise-500">La carte est en cours de préparation...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {CATS.map((cat) => {
                const catItems = menu.items.filter(
                  (i) => normalizeMenuCategory(i.category) === cat,
                );
                if (catItems.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="mb-6 flex items-center gap-3 font-hand text-3xl font-bold text-ardoise-800">
                      <span className="text-4xl">{categoryEmoji(cat)}</span>
                      {categoryLabel(cat)}
                      <span className="ml-2 h-px flex-1 bg-creme-200" />
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {catItems.map((item) => (
                        <div key={item.id} className="card overflow-hidden border border-creme-100">
                          {item.photo_url ? (
                            <div className="relative h-48 w-full">
                              <Image
                                src={item.photo_url}
                                alt={item.name}
                                fill
                                unoptimized={isProxiedMedia(item.photo_url)}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                quality={60}
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-48 w-full items-center justify-center bg-creme-100 text-5xl text-ardoise-300">
                             🍽️
                            </div>
                          )}
                          <div className="p-5">
                            <h4 className="mb-1 font-hand text-xl font-bold text-ardoise-800">
                              {item.name}
                            </h4>
                            <p className="mb-3 font-body text-sm leading-relaxed text-ardoise-500">
                              {item.description}
                            </p>
                            {normalizeMenuCategory(item.category) === "main_dish" &&
                            item.partner_url?.trim() &&
                            item.partner_name?.trim() ? (
                              <a
                                href={item.partner_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-creme-200 bg-creme-50 px-3 py-1.5 text-xs font-semibold text-ardoise-700 hover:border-bordeaux-300 hover:text-bordeaux-700"
                              >
                                {item.partner_logo_url?.trim() ? (
                                  <Image
                                    src={item.partner_logo_url}
                                    alt={item.partner_name}
                                    width={18}
                                    height={18}
                                    quality={60}
                                    unoptimized={item.partner_logo_url.startsWith("/api/")}
                                    className="h-[18px] w-[18px] rounded-full object-cover"
                                  />
                                ) : (
                                  <span aria-hidden>🤝</span>
                                )}
                                En partenariat avec {item.partner_name}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-14 text-center">
            <Link href="/devis" className="btn btn-primary px-10 py-4 text-base">🍽️ Composer mon menu sur mesure</Link>
          </div>
        </div>
      </section>
      <section className="bg-creme-50 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-6 lg:grid-cols-2">
          <div>
            <span className="section-label mb-3 block text-bordeaux-600">Zone d&apos;intervention</span>
            <h2 className="section-title mb-4 text-ardoise-800">
              Traiteur rôtisserie en <span className="text-bordeaux-700">Normandie</span> et en
              <span className="text-bordeaux-700"> Île-de-France</span>
            </h2>
            <p className="mb-4 font-body leading-relaxed text-ardoise-600">
              Calirotis se déplace pour vos événements privés et professionnels en Normandie et en
              Île-de-France : mariages, fêtes de famille, anniversaires, événements d&apos;entreprise
              et prestations en plein air.
            </p>
            <p className="font-body leading-relaxed text-ardoise-600">
              Basé près de Saint-Pierre-du-Vauvray, j&apos;interviens régulièrement autour de Rouen,
              Évreux, Vernon, Louviers, Mantes-la-Jolie, Cergy, Nanterre, Paris et dans les
              communes voisines.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border-2 border-bordeaux-100 bg-white shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d35033.465654853746!2d1.178081134501613!3d49.25975989637303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8a9c25cc7f5316e9%3A0x893eceaae30b338c!2sCalirotis%20Traiteur!5e0!3m2!1sfr!2sfr!4v1777883905993!5m2!1sfr!2sfr"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[360px] w-full"
              title="Carte Google Maps Calirotis Traiteur"
            />
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <span className="section-label mb-3 block text-bordeaux-600">Ils nous font confiance</span>
            <h2 className="section-title mb-3 text-ardoise-800">
              Ce que disent <span className="text-bordeaux-700">nos clients</span>
            </h2>
            <p className="mx-auto max-w-lg font-body text-ardoise-500">
              Des retours authentiques, directement issus de nos prestations.
            </p>
          </div>
          <ReviewsCarousel />
        </div>
      </section>
      <section className="relative overflow-hidden bg-gradient-to-br from-ardoise-800 to-ardoise-900 py-24 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #e8a030 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-bordeaux-700/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="mb-4 text-6xl">🍖</div>
            <h2 className="mb-3 font-display text-4xl md:text-5xl">
              Pour chaque occasion,
              <br />
              <span className="text-safran-400">un service sur mesure</span>
            </h2>
            <p className="mx-auto max-w-xl font-body text-lg text-ardoise-300">
              Rôtisserie à la broche, cochon de lait, méchoui ou barbecue géant — je m&apos;adapte à votre événement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div className="group flex flex-col items-center text-center">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={mariageImg}
                  alt="Mariage et baptême"
                  fill
                  className="object-contain transition-transform duration-500 sm:scale-140 sm:group-hover:scale-145 scale-100 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <h3 className="mb-2 mt-6 font-hand text-xl font-bold text-safran-400">💍 Mariage &amp; Baptême</h3>
              <p className="font-body text-sm leading-relaxed text-ardoise-300">
                Rôtisserie à la broche pour le plus beau de vos jours. Stand soigné, service clé en main et prestation sur-mesure de 30 à 300 convives.
              </p>
            </div>

            <div className="group flex flex-col items-center text-center">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={feteImg}
                  alt="Fêtes et famille"
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <h3 className="mb-2 mt-6 font-hand text-xl font-bold text-safran-400">🎉 Fêtes &amp; Famille</h3>
              <p className="font-body text-sm leading-relaxed text-ardoise-300">
                Cochon de lait, méchoui ou barbecue géant pour vos anniversaires, réunions et fêtes de famille. Une ambiance conviviale qui régale petits et grands.
              </p>
            </div>

            <div className="group flex flex-col items-center text-center">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={businessImg}
                  alt="Événements d'entreprise"
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <h3 className="mb-2 mt-6 font-hand text-xl font-bold text-safran-400">🏢 Entreprise &amp; Pro</h3>
              <p className="font-body text-sm leading-relaxed text-ardoise-300">
                Séminaires, foires, journées d&apos;équipe ou réceptions corporate. Un stand professionnel, un service ponctuel et une cuisine qui marque les esprits.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/devis" className="btn btn-braise px-10 py-4 text-base">
              Demander un devis gratuit
            </Link>
            <a href="tel:0699512290" className="btn btn-white px-8 py-4 text-base">📞 06.99.51.22.90</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
