import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demander un devis gratuit",
  description:
    "Demandez votre devis gratuit pour un cochon de lait à la broche, un méchoui ou un barbecue géant : mariage, fête de famille ou événement d'entreprise en Normandie et Île-de-France.",
  alternates: { canonical: "/devis" },
  openGraph: { url: "/devis", title: "Demander un devis gratuit | Calirotis" },
};

export default function DevisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
