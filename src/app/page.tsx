import Head from 'next/head';
import Banner from './components/banner/Banner';
import Testimonials from './components/testimonials/Testimonials';
import RollingSlider from './components/slider/RollingSlider';
import Modal from './components/modals/Modal';

export default function Home() {
  return (
    <>
      <Head>
        <title>Page d`&apos;`accueil de Calirotis</title>
      </Head>
        <main className="flex flex-col h-full w-full items-center sm:pt-[10vh] md:pt-[10vh] z-0"> 
          <RollingSlider/>
          <Banner/>
          <Testimonials/>
          <Modal/>
        </main>
    </> 
  )
}
