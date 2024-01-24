import type { Metadata } from 'next'
import Roboto from 'next/font/local'
import './globals.css'
import AxeptioInjector from './utils/AxeptioInjector';
import Analytics from './utils/Analytics';

const roboto = Roboto({src: "./assets/fonts/Roboto/Roboto-Medium.ttf"})

export const metadata: Metadata = {
  title: 'Calirotis',
  description: 'Votre spécialiste en rotisserie, cochons de lait sur broche.',
  themeColor: "black",
  appleWebApp: true,
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${roboto.className} text-white min-h-screen flex flex-col items-center w-full`}>
        {children}
        <AxeptioInjector/>
        <Analytics/>
      </body>
    </html>
  )
}
