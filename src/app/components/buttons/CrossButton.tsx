"use client"

import { useEffect, useState } from 'react';
import './crossbutton.css';

function CrossButton({menuOpened}: CrossButton ){
    const [buttonGo, setButtonGo ] = useState(true);
    const clickOnButton = () => {
        setButtonGo(!buttonGo);
    }
    const hambOrCross = (buttonGo ? "cursor-pointer border-0 p-0 z-[1000] ": "cursor-pointer border-0 p-0 z-[1000] opened fixed z-[10]");
    useEffect(() => {
        if(menuOpened === false){
            setButtonGo(true);
        }
    }, [menuOpened])
    return (
        <button className={`${hambOrCross} md:flex sm:flex lg:hidden xl:hidden`} onClick={clickOnButton} type="button" aria-label="Aria Cross or Hamburger">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <path className="line1 fill-none stroke-white stroke-6" style={{transition: "stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)"}} d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"/>
              <path className="line2 fill-none stroke-white stroke-6" style={{transition: "stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)"}} d="M 20,50 H 80"/>
              <path className="line3 fill-none stroke-white stroke-6" style={{transition: "stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)"}} d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"/>
            </svg>
        </button>
    )
}

type CrossButton = {
    menuOpened: boolean
}

export default CrossButton;