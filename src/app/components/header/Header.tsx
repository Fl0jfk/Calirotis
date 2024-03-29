"use client"

import Navbar from '../navbar/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import { useData } from '../../contexts/data';
import CrossButton from '../buttons/CrossButton';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';	

function Header(){
    const data = useData();
    const { scrollY } = useScroll();
    const [menuOpened, setMenuOpened] = useState(false);
    const [hidden, setHidden ] = useState(false);
    const opacityMenu = (!menuOpened? "sm:opacity-80 md:opacity-80" : "")
    const handleClick = () => {
        setMenuOpened(!menuOpened);
    };
   useMotionValueEvent(scrollY, "change", (latest) => {
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
            className={`flex p-4 justify-between w-full md:fixed sm:fixed z-[12] md:mb-[100px] md:bg-[#000000] sm:bg-[#000000] max-w-[1000px] ${opacityMenu}`}>
                <div className='sm:w-2/12 h-[100px] md:h-[40px] sm:h-[20px] flex items-center'>
                    {data.profile.logo && 
                        <Image src={data.profile.logo} alt='Logo de calirotis' width={50} height={50} className='cursor-pointer z-[8] mb-[5px]' onClick={()=>{window.scrollTo({top:0, left:0, behavior:'smooth'})}}/>
                    }
                </div>
                <h1 className='text-center w-full text-xl sm:block hidden'>Calirotis</h1>
                <div className='w-10/12 sm:w-2/12 flex justify-end items-center sm:mt-[-5px]'>
                    <Navbar menuOpened={menuOpened} onLinkClick={handleLinkClick}/>
                    <div className='flex justify-end w-[40] h-[100px] md:h-[50px] sm:h-[30px] items-center' onClick={() => handleClick()}>
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

export default Header;