"use client"

import { useChat, Message } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { FaCommentDots } from 'react-icons/fa';

export default function Chat() {
    const { input, handleInputChange, handleSubmit, messages } = useChat();
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const toggleModal = () => { setIsOpen(!isOpen)};
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) { setIsOpen(false);}
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div className="fixed bottom-[5px] right-[5px] z-10 flex flex-col items-center justify-between p-4">
            {isOpen ? (
                <div ref={modalRef} className="bg-gray-900 p-3 w-full max-w-[500px] rounded-md text-white h-full">
                    <div className="overflow-y-auto max-h-[400px] p-2">
                        {messages.map((message: Message) => (
                            <div key={message.id}>
                                {message.role === "assistant" ? (
                                    <h3 className="text-xl font-semibold mt-2">Martin Le Bot :</h3>
                                ) : (
                                    <h3 className="text-xl font-semibold mt-2">Vous :</h3>
                                )}
                                {message.content.split("\n").map((currentTextBlock: string, index: number) => {
                                    if (currentTextBlock === "") {
                                        return (
                                            <>
                                                <br />
                                                <p key={message.id + index}>&nbsp;</p>
                                                <br />
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <br />
                                                <p key={message.id + index}>{currentTextBlock}</p>
                                                <br />
                                            </>
                                        );
                                    }
                                })}
                            </div>
                        ))}
                    </div>
                    <form className="mt-12" onSubmit={handleSubmit}>
                        <p>Tapez votre question :</p>
                        <textarea className="mt-2 w-full bg-slate-600 p-2 rounded-md" value={input} onChange={handleInputChange} />
                        <button className="rounded-md bg-gray-700 p-2 mt-2">Envoyer votre message</button>
                    </form>
                </div>
            ) : (
                <button onClick={toggleModal} className="p-2 bg-blue-600 rounded-full">
                    <FaCommentDots size={24} color="white" />
                </button>
            )}
        </div>
    );
}

