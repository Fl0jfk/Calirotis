"use client"

import Navbar from '../navbar/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import { useData } from '../../contexts/data';
import CrossButton from '../buttons/CrossButton';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';	
import Link from 'next/link';

export default function Header(){
    const data = useData()
    const { scrollY } = useScroll();
    const [menuOpened, setMenuOpened] = useState(false);
    const [hidden, setHidden ] = useState(false);
    const opacityMenu = (!menuOpened? "sm:opacity-80 md:opacity-80 h-[10vh] ease-linear duration-300" : "h-[100vh] ease-linear duration-300");
    const opacityLogo = (!menuOpened? "ease-linear delay-100 duration-200 scale-1" : "ease-linear delay-150 duration-300 scale-0");
    const handleClick = () => {
        setMenuOpened(!menuOpened);
    };
   useMotionValueEvent(scrollY, "change", (latest:any) => {
    const previous = scrollY.getPrevious();
    if(latest > previous && latest > 150 ){
        setHidden(true);
    } else {
        setHidden(false);
    }
    });
    const handleLinkClick = ({ clickOnLink } : handleLinkClickProps) => {
        setMenuOpened(clickOnLink);
    };
    return (
        <motion.header 
            variants={{ visible: { y: 0 }, hidden: { y: "-100%" }}} 
            animate={hidden ? "hidden" : "visible"}
            transition={{duration: 0.35, ease: "easeInOut"}}
            className={`flex p-4 justify-between items-center w-full sm:fixed md:fixed z-[12] md:mb-[100px] bg-[#000] max-w-[1500px] mx-auto ${opacityMenu} self-center text-2xl overflow-hidden`}>
                <div className='flex items-center h-full sm:w-4/12 md:w-4/12'>
                    {data.profile.logo &&
                        <Link href="/">
                            <Image src={data.profile.logo} alt='Mon memoji' width={55} height={55} className={`cursor-pointer z-[8] ${opacityLogo}`} onClick={()=>{window.scrollTo({top:0, left:0, behavior:'smooth'})}}/>
                        </Link>
                    }
                </div>
                <p className='w-4/12 uppercase mr-[80px] lg:mr-0 xl:mr-0 lg:ml-[250px] xl:ml-[250px]'>Calirotis</p>
                <div className='flex justify-end items-center sm:mt-[-5px] h-full'>
                    <Navbar menuOpened={menuOpened} onLinkClick={handleLinkClick}/>
                    <div className='flex justify-end w-[40] items-center h-full' onClick={() => handleClick()}>
                        <CrossButton menuOpened={menuOpened}/>
                    </div>
                </div>
        </motion.header>
    )
}

type handleLinkClickProps = {
    clickOnLink : boolean;
    onLinkClick: (clickOnLink: boolean) => void;
}