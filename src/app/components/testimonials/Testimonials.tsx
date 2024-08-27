"use client";

import { useEffect, useState } from "react";
import { useData } from "@/app/contexts/data";
import Image from "next/image";

interface Review {
    id: number;
    imageUser: string;
    nameUser: string;
    rating: number;
    message: string;
}

export default function Testimonials() {
    const data = useData();
    const [randomReviews, setRandomReviews] = useState<Review[]>([]);
    useEffect(() => {
        if (data.reviews && data.reviews.length > 0) {
            const shuffledReviews = [...data.reviews].sort(() => 0.5 - Math.random());
            const selectedReviews = shuffledReviews.slice(0, 6);
            setRandomReviews(selectedReviews);
        }
    }, [data]);
    return (
        <section className="p-8 flex flex-col items-center gap-8 text-white">
            <h2 className="text-6xl">Avis de nos clients</h2>
            {randomReviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                    {randomReviews.map((review) => (
                        <div key={review.id} className="flex-shrink-0 p-4 bg-gray-700 rounded-lg shadow-md w-full max-w-md">
                            <div className="flex items-center mb-4">
                                <Image src={review.imageUser}  alt={review.nameUser} width={40} height={40} className="w-16 h-16 rounded-full mr-4 border border-gray-300"/>
                                <div>
                                    <p className="font-semibold text-lg">{review.nameUser}</p>
                                    <div className="flex">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <svg 
                                                key={i} 
                                                className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 24 24" 
                                                fill="currentColor" 
                                                stroke="currentColor"
                                            >
                                                <path 
                                                    fillRule="evenodd" 
                                                    d="M12 2.25a.75.75 0 0 1 .68.45l2.226 4.513 4.991.724a.75.75 0 0 1 .416 1.277l-3.607 3.515.85 4.946a.75.75 0 0 1-1.088.791L12 15.898l-4.446 2.337a.75.75 0 0 1-1.088-.79l.85-4.946-3.607-3.515a.75.75 0 0 1 .416-1.277l4.991-.724L11.32 2.7A.75.75 0 0 1 12 2.25z" 
                                                    clipRule="evenodd" 
                                                />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p>{review.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}