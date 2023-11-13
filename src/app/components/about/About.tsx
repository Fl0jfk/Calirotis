import Image from "next/image";

function About (){
    return (
        <section className="w-full flex flex-col p-6 items-center gap-8" id="about">
            <h2 className="text-6xl">À propos</h2>
            <div className="flex-col w-full flex items-center rounded-t-xl h-[800px]">
                <div className="w-full h-[50%] sm:h-[30%] relative">
                    <Image src="https://calirotis.s3.eu-west-3.amazonaws.com/assets/img/photo+de+profil.webp" alt="Photo de profil" fill className="rounded-t-xl relative" style={{objectFit : "cover", objectPosition: "50% 28%"}}/>
                </div>
                <div className="w-full h-[50%] sm:h-[70%] p-8 flex flex-col items-center text-xl bg-gray-700 rounded-b-xl overflow-y-scroll">
                    <p className="text-start w-full">Je suis Martin après plusieurs années en tant que traiteur au sein d&apos;une entreprise.</p>
                    <p className="text-start w-full">J&apos;ai décidé de lancer ma propre affaire, je me suis spécialisé dans la rotisserie.</p>
                    <p className="text-start w-full">J&apos;accorde une importance primordiale à la qualité de nos produits et services. Je sélectionne soigneusement les ingrédients les plus frais et les plus savoureux. Chaque plat est préparé avec expertise et présenté avec soin pour vous offrir la meilleure expérience possible.</p>
                </div>
            </div>
        </section>
    )
}

export default About;