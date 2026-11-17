import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { JsonLd } from './components/JsonLd'

const breeSerif = localFont({
  src: "./assets/fonts/Bree_Serif/BreeSerif-Regular.ttf",
  variable: "--font-display",
});

const sourceSans3 = localFont({
  src: [
    { path: "./assets/fonts/Source_Sans_3/static/SourceSans3-Regular.ttf", weight: "400", style: "normal" },
    { path: "./assets/fonts/Source_Sans_3/static/SourceSans3-Medium.ttf", weight: "500", style: "normal" },
    { path: "./assets/fonts/Source_Sans_3/static/SourceSans3-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./assets/fonts/Source_Sans_3/static/SourceSans3-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
});

const SITE_URL = "https://calirotis.fr";
const TITLE = "Calirotis – Traiteur rôtisserie, cochon de lait à la broche";
const DESCRIPTION =
  "Traiteur rôtisserie dans l'Eure : cochon de lait à la broche, méchoui, barbecue géant. Mariages, fêtes, entreprises en Normandie et Île-de-France. Devis gratuit.";

export const viewport: Viewport = { themeColor: 'black'}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Calirotis" },
  description: DESCRIPTION,
  applicationName: "Calirotis",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico", apple: "/Logo.png" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Calirotis",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Cochon de lait à la broche Calirotis, traiteur rôtisserie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({children}:{children: React.ReactNode}){
  return (
    <html lang="fr">
      <body className={`${breeSerif.variable} ${sourceSans3.variable} bg-black text-white antialiased`}>
        <JsonLd />
        {children}
      </body>
    </html>
  )
}

