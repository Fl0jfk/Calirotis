"use client"

import Carousel  from "../carousel/Carousel";
import { useData } from "@/app/contexts/data";

function Slider (){
    const data = useData();
    const slides = data.slider;
    return (
        <section className="w-full flex items-center">
            {slides&& <Carousel data={slides}/>}
        </section>
    )
}

export default Slider;