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
                        <Link href="/" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
                                <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#FFF"/>
                                    <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" fill="#FFF"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z" fill="#FFF"/>
                                </svg>
                            </Link> 
                            <Link href="/" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
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
                            <Link href="/" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
                                <svg fill="#fff" width="25px" height="25px" viewBox="0 0 32 32">
                                    <path d="M20.23 1.604c-0.008-0-0.017-0-0.027-0-5.961 0-10.793 4.832-10.793 10.793s4.832 10.793 10.793 10.793c5.955 0 10.783-4.822 10.793-10.775v-0.001c-0.004-5.953-4.816-10.781-10.763-10.809h-0.003zM1.004 1.604v28.792h5.274v-28.792z"></path>
                                </svg>
                            </Link>  
                            <Link href="/" className="hover:scale-[1.1]" onClick={handleLinkClick} target="blank">
                                <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                                    <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z" fill="#fff"/>
                                    <path d="M5 10C5 9.44772 5.44772 9 6 9H7C7.55228 9 8 9.44771 8 10V18C8 18.5523 7.55228 19 7 19H6C5.44772 19 5 18.5523 5 18V10Z" fill="#fff"/>
                                    <path d="M11 19H12C12.5523 19 13 18.5523 13 18V13.5C13 12 16 11 16 13V18.0004C16 18.5527 16.4477 19 17 19H18C18.5523 19 19 18.5523 19 18V12C19 10 17.5 9 15.5 9C13.5 9 13 10.5 13 10.5V10C13 9.44771 12.5523 9 12 9H11C10.4477 9 10 9.44772 10 10V18C10 18.5523 10.4477 19 11 19Z" fill="#FFF"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M20 1C21.6569 1 23 2.34315 23 4V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H20ZM20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20Z" fill="#FFF"/>
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