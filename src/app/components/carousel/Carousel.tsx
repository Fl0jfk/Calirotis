"use client"

import { useState } from "react";
import Image from "next/image";

function Carousel ({ data }:CarouselProps){
    const [slide, setSlide] = useState(0);
    const nextSlide = () => {
        setSlide(slide === data.length - 1 ? 0 : slide + 1);
    };
    const prevSlide = () => {
        setSlide(slide === 0 ? data.length - 1 : slide - 1);
    };
    return (
        <div className="relative flex justify-center items-center w-full max-w-[1000px] h-[600px] sm:h-[500px]">
            {data.map((item, idx) => {
                return (
                    <Image src={item.image} alt={item.alt} key={idx} fill className={slide === idx ? "w-full h-full shadow-md xl:rounded-xl lg:rounded-xl sm:object-top xl:object-center" : "w-full h-full shadow-md xl:rounded-xl hidden lg:rounded-xl sm:object-top xl:object-bottom"} style={{objectFit: "cover"}} />
                );
            })}
            <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={prevSlide} className="absolute left-[1em] cursor-pointer bg-black opacity-50 rounded-full">
                <path d="M5 12H19M5 12L11 6M5 12L11 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={nextSlide} className="absolute right-[1em] cursor-pointer bg-black opacity-50 rounded-full">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="flex absolute bottom-[1rem]">
                {data.map((_, idx) => {
                    return (
                        <button key={idx} id={`al${idx}`} name="boutons de slider" aria-label="boutons de slider" className={slide === idx ? "bg-white h-[0.8em] w-[0.8em] rounded-full border-0 outline-none shadow-gray-300 shadow-lg ml-[0.2rem] mr-[0.2rem] cursor-pointer" : "h-[0.8em] w-[0.8em] rounded-full border-0 outline-none shadow-gray-300 shadow-lg ml-[0.2rem] mr-[0.2rem] cursor-pointer bg-gray-500"} onClick={() => setSlide(idx)}></button>
                    );
                })}
            </span>
        </div>
    );
};

type CarouselProps = {
    data: Array<{ id:number; image: string; alt: string }>;
};

export default Carousel;