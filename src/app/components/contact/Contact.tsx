import Link from "next/link";
import Map from "../map/Map";
import FormContact from "./FormContact";

function Contact (){
    return (
        <section id="contact" className="p-4 flex flex-col items-center w-full max-w-[1000px]">
            <h2 className='text-7xl mb-10 text-center'>Contact</h2>
            <div className="flex items-center w-full justify-center">
                <p>Vous pouvez nous joindre directement par 
                    <Link href={"tel:06.99.51.22.90"}> téléphone 
                        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline">
                            <path d="M14.3308 15.9402L15.6608 14.6101C15.8655 14.403 16.1092 14.2384 16.3778 14.1262C16.6465 14.014 16.9347 13.9563 17.2258 13.9563C17.517 13.9563 17.8052 14.014 18.0739 14.1262C18.3425 14.2384 18.5862 14.403 18.7908 14.6101L20.3508 16.1702C20.5579 16.3748 20.7224 16.6183 20.8346 16.887C20.9468 17.1556 21.0046 17.444 21.0046 17.7351C21.0046 18.0263 20.9468 18.3146 20.8346 18.5833C20.7224 18.8519 20.5579 19.0954 20.3508 19.3L19.6408 20.02C19.1516 20.514 18.5189 20.841 17.8329 20.9541C17.1469 21.0672 16.4427 20.9609 15.8208 20.6501C10.4691 17.8952 6.11008 13.5396 3.35083 8.19019C3.03976 7.56761 2.93414 6.86242 3.04914 6.17603C3.16414 5.48963 3.49384 4.85731 3.99085 4.37012L4.70081 3.65015C5.11674 3.23673 5.67937 3.00464 6.26581 3.00464C6.85225 3.00464 7.41488 3.23673 7.83081 3.65015L9.40082 5.22021C9.81424 5.63615 10.0463 6.19871 10.0463 6.78516C10.0463 7.3716 9.81424 7.93416 9.40082 8.3501L8.0708 9.68018C8.95021 10.8697 9.91617 11.9926 10.9608 13.04C11.9994 14.0804 13.116 15.04 14.3008 15.9102L14.3308 15.9402Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg> 
                    </Link> ou en remplissant le formulaire. Nous vous répondrons le plus rapidement possible.
                </p>
            </div>
            <div className="flex flex-col gap-4 p-8 w-full max-w-[1000px]">
                <div className="flex gap-10 sm:flex-col sm:items-center">
                    <FormContact/>
                    <Map/>
                </div>
            </div> 
            <div className="flex items-center w-full justify-center max-w-[1000px]">
                <p>Nous sommes situés sur la commune de Saint-Pierre du Vauvray en Normandie, nous pouvons nous déplacer chez vous pour tous types d&apos;évènements en Normandie et en Ile-de-France </p>
            </div> 
        </section>
    )
}

export default Contact;