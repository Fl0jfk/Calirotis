'use client'

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useData } from '../../contexts/data';

function Navbar({menuOpened, onLinkClick} :NavbarProps ){
    const data = useData();
    const [clickOnLink, setClickOnLink] = useState(menuOpened);
    const menuOpen = (clickOnLink ? "" : "hidden");
    const bgMenuOpen = (clickOnLink ? "linear-gradient(to bottom, #000000, #c10101f1)" : ""  );
    const handleLinkClick = () => {
        setClickOnLink(false);
        onLinkClick({ clickOnLink: false });
    };
    useEffect(() => {
        setClickOnLink(menuOpened)
        if(menuOpened){
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [menuOpened])
    return (
        <>
            <AnimatePresence>
                {menuOpened && <motion.nav 
                    style={{background: `${bgMenuOpen}`}} 
                    className={`md:${menuOpen} sm:${menuOpen} gap-16 text-4xl flex flex-col top-0 left-0 fixed justify-center items-center top-0 left-0 w-full h-[100vh] z-[9] xl:hidden lg:hidden`}
                    initial={{translateX: "100%"}}
                    animate={{translateX: "0%", transition:{duration: 0.5, ease: "easeInOut"}}}
                    exit={{translateX:"100%", transition:{duration: 0.5, ease: "easeInOut"}}}
                    >
                     <div className='w-2/12 h-[100px] md:h-[50px] sm:h-[30px] flex items-center justify-center pt-4'>
                        {data.profile.logo && 
                        <Link className='hover:scale-110' href={"/"} onClick={handleLinkClick} aria-label="Link to top">
                            <Image src={data.profile.logo} alt='Logo du site' width={100} height={100} className='cursor-pointer z-[8]'/>
                        </Link>
                        }
                    </div>
                    <Link className='hover:scale-110' href="#meats" onClick={handleLinkClick} aria-label="Lien vers la section nos plats">Plats</Link>
                    <Link className='hover:scale-110 text-center' href="#occasions" onClick={handleLinkClick} aria-label="Lien vers la section pourquoi faire appel à nous">Pourquoi faire appel à nous ?</Link>
                    <Link className='hover:scale-110' href="#about" onClick={handleLinkClick} aria-label="Lien vers la section à propos">À propos</Link>
                    <Link className='hover:scale-110' href="#contact" onClick={handleLinkClick} aria-label="Lien vers la section contact">Contact</Link>
                </motion.nav>
                }
            </AnimatePresence>
            <nav style={{background: `${bgMenuOpen}`}} className={`flex gap-6 text-2xl xl:mr-8 lg:mr-8 sm:hidden md:hidden z-[9]`}>
                <Link className='hover:scale-110' href="#meats" aria-label="Lien vers la section nos plats">Plats</Link>
                <Link className='hover:scale-110' href="#occasions" aria-label="Lien vers la section pourquoi faire appel à nous">Pourquoi faire appel à nous ?</Link>
                <Link className='hover:scale-110' href="#about" aria-label="Lien vers la section à propos">À propos</Link>
                <Link className='hover:scale-110' href="#contact" aria-label="Lien vers la section contact">Contact</Link>
            </nav>
        </>
    )
}

type NavbarProps = {
    menuOpened: boolean;
    onLinkClick: any;
}

export default Navbar;