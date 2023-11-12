"use client"

import { useData } from "@/app/contexts/data";

function Meats(){
    const data = useData();
    return (
        <section className="flex flex-col w-full max-w-[1050px] p-4 items-center justify-center gap-6">
            <h2 className="text-6xl text-center mb-4">Nos plats</h2>
            <div className="flex sm:flex-col gap-4 w-full items-center">
                {data.meats.map((meat:{id:number, name:string, halal:boolean, description:string, image:string}) => (
                    <div key={meat.id} className="flex rounded-xl flex-col w-full" style={{backgroundImage: `url(${meat.image})`, backgroundSize: "cover", backgroundPosition: "50%, 50%"}}>
                        <div className="flex flex-col justify-between bg-gray-900 opacity-80 gap-8 p-4 w-full h-[600px] sm:h-[450px] rounded-xl hover:opacity-0 cursor-pointer">
                            <h3 className="text-4xl">{meat.name}</h3>
                            <p className="text-xl">{meat.description}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs w-[50%]">Nos viandes sont d&apos;origine française ou européenne</p>
                                <p className="text-xs">{meat.halal ? "(halal)" : ""}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col self-center rounded-xl w-full h-full max-w-[600px]" style={{backgroundImage: "url(https://calirotis.s3.eu-west-3.amazonaws.com/assets/img/IMG_1339.JPG)", backgroundSize: "cover", backgroundPosition: "50%, 50%"}}>
                <div className="flex flex-col bg-gray-900 opacity-80 gap-12 p-4 w-full h-full min-h-[300px] rounded-xl hover:opacity-0 touch:opacity-0 cursor-pointer">
                    <h3 className="text-4xl">Accompagnement</h3>
                    <p className="text-xl">Profitez en accompagnement des pommes de terre mitrailles à la provençale, cuites dans la graisse de canard ou l&apos;huile d&apos;olive (au choix), avec des oignons, des poivrons, des tomates, de l&apos;ail, des herbes de Provence, du sel et du poivre.</p>
                </div>
            </div>
        </section>
    )
}

export default Meats;