"use client"

import { useData } from "@/app/contexts/data";
import Slider from "./Slider";

export default function RollingSlider (){
    const data = useData();
    return (
        <>
            {data.categories[0] &&
                <section id="slideshow" className="max-w-[1500px] w-full self-center mx-auto">
                    <Slider props={data.categories}/>
                </section>
            }
        </>
    )
}