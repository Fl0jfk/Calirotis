"use client"

import { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from "react";

type Profile = {
  firstname: string;
  lastname: string;
  profession: string;
  profilePhoto: string;
  logo: string;
};


type Meats = {
  id: number;
  name: string;
  img: string;
  halal: boolean;
  description: string;
};

type Slider = {
  id:number;
  image: string;
  alt:string;
};

type Testimonial = {
  id: number;
  author: string;
  job: string;
  photoAuthor: string;
  testimonial: string;
  website: string;
  linkedin: string;
};

type Other = {
  id: number;
  name: string;
  src: string;
}

type Data = {
  profile: Profile;
  meats: Meats[];
  slider: Slider[];
  testimonials: Testimonial[];
  others: Other[];
  error: Error | null;
};

const initialData: Data = {
  profile: {
    firstname: "",
    lastname: "",
    profession: "",
    profilePhoto: "",
    logo:""
  },
  meats: [],
  slider: [],
  testimonials: [],
  others: [],
  error: null
};

const DataContext = createContext<Data | undefined>(undefined);

export const DataProvider = ({ children }: PropsWithChildren<{}>) => {
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Data | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/data.json");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData: Data = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={data || initialData}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

