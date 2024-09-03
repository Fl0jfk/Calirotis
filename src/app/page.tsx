import Banner from './components/banner/Banner';
import Testimonials from './components/testimonials/Testimonials';
import RollingSlider from './components/slider/RollingSlider';
import Modal from './components/modals/Modal';
import News from './components/news/News';

export default function Home() {
  return (
    <main className="flex flex-col h-full w-full items-center sm:pt-[10vh] md:pt-[10vh] z-0"> 
      <RollingSlider/>
      <Banner/>
      <Testimonials/>
      <News/>
      <Modal/>
    </main>
  )
}
