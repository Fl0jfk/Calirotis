"use client"

import Carousel  from "../carousel/Carousel";
import { useData } from "@/app/contexts/data";

function Slider (){
    const data = useData();
    const slides = data?.slider;
    console.log(slides)
    return (
        <section className="w-full flex flex-col items-center">
            {slides&& <Carousel data={slides}/>}
        </section>
    )
}

export default Slider;