"use client"

import Link from "next/link";
import Map from "../map/Map";
import FormContact from "./FormContact";

function Contact (){
    return (
        <section id="contact" className="p-4 flex flex-col items-center w-full">
            <h2 className='text-7xl mb-10 md:text-5xl sm:text-4xl text-center'>Contact</h2>
            <div className="flex flex-col gap-4 p-8 w-full max-w-[1000px]">
                <div className="flex gap-10 sm:flex-col sm:items-center">
                    <FormContact/>
                    <Map/>
                </div>
            </div>  
        </section>
    )
}

export default Contact;