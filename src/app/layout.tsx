"use client"

import type { Viewport } from 'next'
import Roboto from 'next/font/local'
import './globals.css'
import AxeptioInjector from './utils/AxeptioInjector';
import Analytics from './utils/Analytics';
import { DataProvider } from './contexts/data';
import { Provider } from 'react-redux';
import store from './redux/store';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

const roboto = Roboto({src: "./assets/fonts/Roboto/Roboto-Medium.ttf"})

export const viewport: Viewport = {    
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
  userScalable: false,
}

const metaDetails: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Calirotis : Votre expert en rotisserie',
    description: 'Traiteur spécialisé en rotisserie, cochon de lait, agneau, barbecue, mechoui',
  },
  '/contact': {
    title: 'Contact - Calirotis',
    description: 'Contactez-nous pour un devis',
  },
  '/about': {
    title: 'À propos de nous - Calirotis',
    description: 'Venez me découvrir et n\'hésitez pas à me contacter',
  },
};

export default function RootLayout({children}:{children: React.ReactNode}){
  return (
    <html lang="fr">
      <body className={`${roboto.className} bg-black text-white antialiased`}>
        <DataProvider>
          <Provider store={store}>
            <Header/>
              {children}
            <Footer/>
            <AxeptioInjector/>
            <Analytics/>
          </Provider>
        </DataProvider>
      </body>
    </html>
  )
}