import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

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

export const viewport: Viewport = { themeColor: 'black'}

export const metadata: Metadata = {
  title: 'Calirotis : Votre expert en rotisserie',
  description: 'Traiteur spécialisé en rotisserie, cochon de lait, agneau, barbecue, mechoui',
};

export default function RootLayout({children}:{children: React.ReactNode}){
  return (
    <html lang="fr">
      <body className={`${breeSerif.variable} ${sourceSans3.variable} bg-black text-white antialiased`}>{children}</body>
    </html>
  )
}