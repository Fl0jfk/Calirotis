import Image from "next/image";

function Banner (){
    return (
        <section className="w-full p-6 flex flex-col items-center gap-8 sm:p-12" id="occasions">
            <h2 className="text-6xl">Pour toutes vos occasions</h2>
            <div className="flex w-full gap-6 sm:flex-col">
                <div className="w-full rounded-xl flex flex-col items-center gap-4 bg-gray-800 p-4 h-[350px] cursor-pointer hover:scale-110 justify-between">
                    <Image src="https://calirotis.s3.eu-west-3.amazonaws.com/assets/logo/cocohnfete.png" width={180} height={180} alt="Image de cochon qui fait la fête"/>
                    <div className="flex flex-col items-center">
                        <h3 className="text-4xl">Fêtes</h3>
                        <p className="text-center">Lorsque vous songez à préparer des repas de fête pour votre prochaine célébration.</p>
                    </div>
                </div>
                <div className="w-full rounded-xl flex flex-col items-center gap-4 bg-gray-800 p-4 h-[350px] cursor-pointer hover:scale-110 justify-between">
                    <Image src="https://calirotis.s3.eu-west-3.amazonaws.com/assets/logo/cochoncommande.png" width={180} height={180} alt="Image de cochon qui fait la fête"/>
                    <div className="flex flex-col items-center">
                        <h3 className="text-4xl">Entreprises</h3>
                        <p className="text-center">Chez Calirotis, nous offrons un haut niveau de service à des prix de restauration abordables.</p>
                    </div>
                </div>
                <div className="w-full rounded-xl flex flex-col items-center gap-4 bg-gray-800 p-4 h-[350px] cursor-pointer hover:scale-110 justify-between">
                    <Image src="https://calirotis.s3.eu-west-3.amazonaws.com/assets/logo/cochonmariage.png" width={420} height={400} alt="Image de cochon qui fait la fête" className="mt-4"/>
                    <div className="flex flex-col items-center">
                        <h3 className="text-4xl">Mariages</h3>
                        <p className="text-center">Pour votre mariage, baptême ou toutes autres cérémonies, un stand unique pour un événement magique !</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Banner;