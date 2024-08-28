import { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from "react";

type Profile = {
  firstname: string;
  lastname: string;
  profession: string;
  logo: string;
};

type Categories = {
  id: number;
  name: string;
  img: string;
  shortDescription: string;
  description: string;
};

type ImageCochon ={
  id: number;
  link:string;
}

type ImageAgneau ={
  id: number;
  link:string;
}

type ImageBarbecue ={
  id: number;
  link:string;
}

type ImageAccompagnement ={
  id: number;
  link:string;
}

type Reviews = {
  id:number;
  imageUser:string;
  nameUser:string;
  rating:number;
  message:string;
}

type News = {
  id:number;
  daily:string;
  name:string;
  miniature:string;
  link:string;
  message:string;
  date:string;
}

type Data = {
  profile: Profile;
  categories: Categories[];
  imageCochon: ImageCochon[];
  imageAgneau: ImageAgneau[];
  imageBarbecue: ImageBarbecue[];
  imageAccompagnement: ImageAccompagnement[];
  reviews: Reviews[];
  news: News[];
  error: Error | null;
};

const initialData: Data = {
  profile: {
    firstname: "",
    lastname: "",
    profession: "",
    logo: "",
  },
  categories: [],
  imageCochon: [],
  imageAgneau:[],
  imageBarbecue:[],
  imageAccompagnement:[],
  reviews:[],
  news:[],
  error: null
};

const DataContext = createContext<Data | undefined>(undefined);

export const DataProvider = ({ children }: PropsWithChildren<{}>) => {
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Data | undefined>(undefined);
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("https://calirotisassets.s3.eu-west-3.amazonaws.com/data.json");
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
    <DataContext.Provider value={data || initialData}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};