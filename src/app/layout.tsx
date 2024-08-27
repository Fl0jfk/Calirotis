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

export default function RootLayout({children}:{children: React.ReactNode}){
  return (
    <html lang="fr">
      <body className={`${roboto.className} text-white antialiased`}>
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