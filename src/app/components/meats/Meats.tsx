"use client"

import { useData } from "@/app/contexts/data";

function Meats(){
    const data = useData();
    return (
        <section className="flex flex-col w-full max-w-[1000px] p-4">
            <h2 className="text-6xl text-center mb-4">Nos plats</h2>
            <div className="flex sm:flex-col gap-4 w-full items-center">
                {data.meats.map((meat:{id:number, name:string, halal:boolean, description:string, image:string}) => (
                    <div key={meat.id} className="flex rounded-xl flex-col w-full" style={{backgroundImage: `url(${meat.image})`, backgroundSize: "cover", backgroundPosition: "50%, 50%"}}>
                        <div className="flex flex-col justify-between bg-gray-900 opacity-80 gap-8 p-4 w-full h-full min-h-[400px] sm:min-h-[300px] rounded-xl">
                            <h3 className="text-3xl">{meat.name}</h3>
                            <p>{meat.description}</p>
                            <p className="text-sm">{meat.halal ? "Ce plat est halal" : "Ce plat n'est pas halal"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Meats;