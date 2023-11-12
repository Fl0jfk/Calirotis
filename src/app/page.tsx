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
        <title>Page d`&apos;`accueil Calirotis</title>
      </Head>
      <DataProvider>
        <Header/>
        <main className="flex flex-col w-full items-center mt-[100px]"> 
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
