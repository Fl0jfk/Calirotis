import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useData } from '@/app/contexts/data';
import { useDispatch } from "react-redux";
import { setModalOpenAgneau, setModalOpenAccompagnement, setModalOpenBarbecue, setModalOpenCochon } from '@/app/redux/reducers/modal';

export default function Navbar({menuOpened, onLinkClick} :NavbarProps ){
    const [clickOnLink, setClickOnLink] = useState(menuOpened);
    const menuOpen = (clickOnLink ? "" : "hidden");
    const bgMenuOpen = (clickOnLink ? "#000" : ""  );
    const [servicesAppear, setServicesAppear] = useState(false);
    const servicesVisible = (servicesAppear ? "" : "hidden");
    const restOfMenu = (!servicesAppear ? "" : "hidden");
    const dispatch = useDispatch();
    const data = useData();
    const handleModalOpen = (name:string) => {
        switch(name) {
            case 'Cochon': dispatch(setModalOpenCochon());
                break;
            case 'Agneau': dispatch(setModalOpenAgneau());
                break;
            case 'Barbecue': dispatch(setModalOpenBarbecue());
                break;
            case 'Accompagnement': dispatch(setModalOpenAccompagnement());
                break;
            default:
                break;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleLinkClick = () => {
        setClickOnLink(false);
        onLinkClick({ clickOnLink: false });
        setServicesAppear(false);
    };
    useEffect(() => {
        setClickOnLink(menuOpened)
        if(menuOpened){
            document.body.classList.add('overflow-hidden');
            setServicesAppear(false);
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [menuOpened])
    return (
        <>
            <AnimatePresence>
                {menuOpened && 
                    <motion.nav 
                            style={{background:`${bgMenuOpen}`, opacity:0.9}} 
                            className={`md:${menuOpen} sm:${menuOpen} gap-10 text-2xl flex flex-col justify-center top-0 left-0 fixed pt-10 items-center opacity-80 w-full h-[100vh] z-[9] xl:hidden lg:hidden`}
                            initial={{translateX:"100%"}}
                            animate={{translateX:"0%", transition:{duration: 0.5, ease: "easeInOut"}}}
                            exit={{translateX:"100%", transition:{duration: 0.5, ease: "easeInOut"}}}
                        >
                        <div className='w-2/12 h-[10vh] flex items-center justify-center w-full'>
                            {data.profile.logo && 
                                <Link className='hover:scale-110 flex items-center justify-center' href="/" onClick={handleLinkClick} aria-label="Link to top">
                                    <Image src={data.profile.logo} alt='Logo de LittleQueenPhotography' width={70} height={70} className='cursor-pointer z-[8]'/>
                                </Link>
                            }
                        </div>
                        <div className={`flex flex-col gap-10 justify-center items-center w-full ${restOfMenu}`}>
                            <Link className='hover:scale-110 text-white' href="/" onClick={handleLinkClick} aria-label="Lien vers la page d'accueil">Accueil</Link>
                            <div className='hover:scale-110 cursor-pointer text-white' onClick={()=>setServicesAppear(true)} aria-label="Lien vers le sous menus mes services">Les prestations</div>
                            <Link className='hover:scale-110 text-white' href="/about" onClick={handleLinkClick} aria-label="Lien vers la page à propos">À propos</Link>
                            <Link className='hover:scale-110 text-white' href="/contact" onClick={handleLinkClick} aria-label="Lien vers la page contact">Contact</Link>
                        </div>
                        <div  className={`flex flex-col gap-8 justify-center items-center w-full ${servicesVisible}`}>
                            <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" className='cursor-pointer absolute top-4 left-4' onClick={()=>setServicesAppear(false)}>
                                <path d="M11 6L5 12M5 12L11 18M5 12H19" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <button className='hover:scale-105 text-center text-white' onClick={()=>handleModalOpen('Cochon')} aria-label="Lien vers la modal cochon de lait">Cochon de lait</button>
                            <button className='hover:scale-105 text-center text-white' onClick={()=>handleModalOpen('Agneau')} aria-label="Lien vers la modal Agneau">Agneau</button>
                            <button className='hover:scale-105 text-center text-white' onClick={()=>handleModalOpen('Barbecue')} aria-label="Lien vers la modal barbecue">Barbecue</button>
                            <button className='hover:scale-105 text-center text-white' onClick={()=>handleModalOpen('Accompagnement')} aria-label="Lien vers la modal accompagnement">Accompagnement</button>                        
                        </div>
                        <div className='flex gap-4'>
                        <Link href="https://www.instagram.com/explore/locations/178720915323535/calirotis-traiteur/" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
                                <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#FFF"/>
                                    <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" fill="#FFF"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z" fill="#FFF"/>
                                </svg>
                            </Link> 
                            <Link href="https://www.facebook.com/profile.php?id=61554143394633&paipv=0&eav=AfaNxaK7foKCCDip7Hm00EMlDUmMPqIlJU2MRpRnJsjIes64m3wQjyOdkgbr90I-Fok" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
                                <svg width="25px" height="25px" viewBox="-5 0 20 20">
                                    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                        <g transform="translate(-385.000000, -7399.000000)" fill="#000000">
                                            <g id="icons" transform="translate(56.000000, 160.000000)">
                                                <path d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z" fill='#fff'></path>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </Link>
                            <Link href="https://g.co/kgs/TZhFK9k" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25px" height="25px" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                            </Link>  
                        </div>
                    </motion.nav>
                }
            </AnimatePresence>
            <nav  className={`flex gap-6 sm:hidden md:hidden z-[9]`}>
                <Link className='hover:scale-125 transition ease-in-out duration-100 delay-75 text-white' href="/" aria-label="Lien vers la page d'accueil">Accueil</Link>
                <Link className='hover:scale-125 transition ease-in-out duration-100 delay-75 text-white' href="/about" aria-label="Lien vers la page à propos">À propos</Link>
                <Link className='hover:scale-125 transition ease-in-out duration-100 delay-75 text-white' href="/contact" aria-label="Lien vers la page contact">Contact</Link>
            </nav>
        </>
    )
}

type NavbarProps = {
    menuOpened: boolean;
    onLinkClick: any;
}