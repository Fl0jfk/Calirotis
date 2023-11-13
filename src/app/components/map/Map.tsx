import { useMemo, useEffect, useState, Suspense } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useData } from "../../contexts/data";

const MAP_OPTIONS = {
  disableDefaultUI: true,
};

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const center = useMemo(() => ({ lat: 49.231, lng: 1.222 }), []);
  const data = useData();
  useEffect(() => {
    if (isLoaded && !scriptLoaded) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = "https://maps.googleapis.com";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true; 
      script.onload = () => {
        setScriptLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, [isLoaded, scriptLoaded]);
  if (loadError) return <div>Erreur de chargement de la carte</div>;
  if (!isLoaded || !scriptLoaded) return <div>Loading...</div>;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleMap zoom={9} center={center} mapContainerClassName="max-w-[800px] w-[50%] h-[450px] rounded-xl mx-auto sm:w-full" options={MAP_OPTIONS}>
        {data.profile.logo && (
          <Marker position={center} icon={{ url: data.profile.logo, scaledSize: new window.google.maps.Size(70, 70)}}/>
        )}
      </GoogleMap>
    </Suspense>
  );
}
