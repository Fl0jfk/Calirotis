import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-ardoise-800 pb-6 pt-16 text-ardoise-300">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-4">
              <Image src="/Logo.png" alt="Calirotis" width={90} height={90}/>
              <p className="font-display text-2xl leading-tight text-white">Calirotis</p>
            </div>
            <p className="text-sm leading-relaxed text-ardoise-400">
              Rôtisserie événementielle : cochon de lait à la broche, méchoui, agneau et barbecue géant pour vos
              fêtes et réceptions pro. Cuisson lente au feu de bois, produits frais, organisation sur-mesure.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="tag bg-bordeaux-100 text-bordeaux-800">🔥 Rôtisserie</span>
              <span className="tag bg-bordeaux-100 text-bordeaux-800">🐖 Cochon de lait</span>
              <span className="tag bg-bordeaux-100 text-bordeaux-800">🥩 Méchoui</span>
              <span className="tag bg-bordeaux-100 text-bordeaux-800">🍖 Barbecue géant</span>
            </div>
          </div>
          <div>
            <h4 className="mb-5 font-body text-xs font-bold uppercase tracking-widest text-bordeaux-300">
              Navigation
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <Link
                  href="/#about"
                  className="font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300"
                >
                  Qui sommes-nous ?
                </Link>
              </li>
              <li>
                <Link
                  href="/#menu"
                  className="font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300"
                >
                  Nos plats
                </Link>
              </li>
              <li>
                <Link href="/devis" className="font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300">
                  Demander un devis
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-body text-xs font-bold uppercase tracking-widest text-bordeaux-300">
              Contact
            </h4>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              <li>
                <a
                  href="tel:0699512290"
                  className="flex items-center gap-2 font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300"
                >
                  📞 06.99.51.22.90
                </a>
              </li>
              <li>
                <a
                  href="mailto:calirotis@gmail.com"
                  className="flex items-center gap-2 font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300"
                >
                  ✉️ calirotis@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/p/Calir%C3%B4tis-Traiteur-61554143394633/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300"
                >
                  📘 Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@calirotis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body text-sm text-ardoise-400 transition-colors hover:text-bordeaux-300"
                >
                  🎵 TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center font-body text-xs text-ardoise-600"> © {new Date().getFullYear()} Calirotis.</div>
      </div>
    </footer>
  );
}
