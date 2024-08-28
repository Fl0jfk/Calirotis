"use client";

import { useData } from "@/app/contexts/data";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type News = {
  id: number;
  daily: string;
  name: string;
  miniature: string;
  link: string;
  message: string;
  date: string;
};

export default function News() {
  const data = useData();
  const [loading, setLoading] = useState(true);
  const [sortedNews, setSortedNews] = useState<News | null>(null);
  useEffect(() => {
    if (data.news && data.news.length > 0) {
      const sorted = data.news
        .slice()
        .sort((a, b) =>
          new Date(b.date.split("/").reverse().join("-")).getTime() -
          new Date(a.date.split("/").reverse().join("-")).getTime()
        )[0];
      setSortedNews(sorted);
    }
    setLoading(false);
    console.log(data)
  }, [data.news]);
  if (loading) {
    return (
      <section className="p-8 flex flex-col items-center gap-8 text-white">
        <h2 className="text-6xl">On parle de nous !</h2>
        <p>Chargement des actualités...</p>
      </section>
    );
  }
  return (
    <section className="p-8 flex flex-col items-center justify-center gap-8 text-white max-w-[1000px]">
      <h2 className="text-6xl">On parle de nous !</h2>
      {sortedNews ? (
        <div className="flex items-center justify-center p-4 bg-gray-600 rounded-lg shadow-md h-full gap-4 sm:flex-col sm:gap-0">
          <div className="flex flex-col justify-center gap-4 sm:gap-2">
            <p>{sortedNews.daily}</p>
            <Image
              src={sortedNews.miniature}
              alt={sortedNews.name}
              width={200}
              height={200}
              style={{ width: "500px", height: "auto" }}
              className="rounded-md"
            />
          </div>
          <div className="flex flex-col justify-between gap-6 mt-8 sm:gap-2">
            <h3 className="text-2xl sm:text-xl">{sortedNews.name}</h3>
            <p>{sortedNews.message}</p>
            <Link href={sortedNews.link} target="_blank" rel="noopener noreferrer" className="underline">
            Lire l'article
            </Link>
          </div>
        </div>
      ) : (
        <p>Aucune actualité disponible pour le moment.</p>
      )}
    </section>
  );
}




