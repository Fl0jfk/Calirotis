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
    <section className="p-8 flex flex-col items-center gap-8 text-white">
      <h2 className="text-6xl">On parle de nous !</h2>
      {sortedNews ? (
        <div>
          <Image
            src={sortedNews.miniature}
            alt={sortedNews.name}
            width={100}
            height={100}
            style={{ width: "100px", height: "auto" }}
          />
          <h3>{sortedNews.name}</h3>
          <p>{sortedNews.message}</p>
          <Link href={sortedNews.link} target="_blank" rel="noopener noreferrer">
            Lire l'article
          </Link>
          <p>Date: {new Date(sortedNews.date.split("/").reverse().join("-")).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>Aucune actualité disponible pour le moment.</p>
      )}
    </section>
  );
}




