import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "popmotion";

const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 500 : -500,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 500 : -500,
        opacity: 0
      };
    }
  };
  
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

export default function Carousel ({ data }:CarouselProps){
    const [[page, direction], setPage] = useState([0, 0]);
    const imageIndex = wrap(0, data.length, page);
    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    };
    const autoScroll = () => {
        paginate(1);
      };
      useEffect(() => {
        const interval = setInterval(autoScroll, 5000);
        return () => clearInterval(interval);
      }, [page]); 
      if (data.length === 0) {
        return <div>No data available for the carousel</div>;
    }
  return (
    <section className="w-screen h-[45vh] flex justify-center items-center z-[0] max-w-[1050px] mx-auto mt-10">
      <div className="w-screen h-[45vh] relative flex items-center justify-center z-[0] xl:rounded-xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img key={page} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
            src={data[imageIndex].image} 
            className="absolute max-w-screen h-full w-full object-cover z-[0] xl:rounded-xl"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 }}}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) { paginate(1)}
               else if (swipe > swipeConfidenceThreshold) { paginate(-1)}
            }}
          />
        </AnimatePresence>
        <button className="select-none pt-1 absolute text-black bg-white rounded-full opacity-70 w-[40px] h-[40px] flex justify-center items-center text-3xl z-[1] right-4 top-[calc(50%-20px)] md:hidden sm:hidden" onClick={() => paginate(1)}>
          {"‣"}
        </button>
        <button className="scale-[-1] pt-1 select-none text-black absolute bg-white rounded-full opacity-70 w-[40px] h-[40px] flex justify-center items-center text-3xl z-[1] left-4 top-[calc(50%-20px)] md:hidden sm:hidden" onClick={() => paginate(-1)}>
          {"‣"}
        </button>
      </div>
    </section>
  );
};

type CarouselProps = {
    data: Array<{ id:number; image: string; alt: string }>;
};