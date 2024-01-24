import Head from 'next/head';
import Header from './components/header/Header';
import { DataProvider } from './contexts/data';
import Footer from './components/footer/Footer';
import Contact from './components/contact/Contact';
import Slider from './components/slider/Slider';
import Banner from './components/banner/Banner';
import Meats from './components/meats/Meats';
import About from './components/about/About';

export default function Home() {
  return (
    <>
      <Head>
        <title>Page d`&apos;`accueil de Calirotis</title>
        <meta name="google-site-verification" content="6Z0b5nwln-gOrQkGTIQtXxHo1bdASiGnvCi1pnpu6oA" />
      </Head>
      <DataProvider>
        <Header/>
        <main className="flex flex-col w-full items-center mt-[30px] md:mt-[50px] gap-8"> 
          <Slider/>
          <Meats/>
          <Banner/>
          <About/>
          <Contact/>
        </main>
        <Footer/> 
      </DataProvider>  
    </> 
  )
}
