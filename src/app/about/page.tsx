import Image from "next/image"

export default function About (){
    return (
        <main className="w-full flex flex-col p-6 items-center gap-8 sm:pt-[15vh] md:pt-[15vh]">
            <h2 className="text-6xl">À propos</h2>
            <div className="flex-col w-full flex items-center rounded-xl h-full max-w-[1000px]">
                <div className="w-full h-full p-8 flex flex-col items-center text-xl bg-gray-700 rounded-xl">
                    <p className="text-start w-full">Je suis Martin. Après 5 années à travailler chez un traiteur j&apos;ai décidé de lancer mon entreprise en me spécialisant dans la rôtisserie (cochon de lait, méchoui, barbecue géant...).</p><br/>
                    <p className="text-start w-full">J&apos;accorde une importance primordiale à la qualité de nos produits et services. Je sélectionne soigneusement les ingrédients les plus frais et les plus savoureux. Chaque plat est préparé avec expertise et présenté avec soin pour vous offrir la meilleure expérience possible.</p><br/>
                    <p className="text-start w-full">Je mets à votre service mon professionnalisme et ma passion pour vous permettre de profiter sans vous souciez de votre repas.</p>
                </div>
            </div>
            <Image src={"https://calirotisassets.s3.eu-west-3.amazonaws.com/photosmartin/IMG_2704.jpeg"} alt="photo de martin" width={400} height={400} className="rounded-xl w-full max-w-[1000px] height-auto"/>
        </main>
    )
}