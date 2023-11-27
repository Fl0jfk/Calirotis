import { useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useData } from "../../contexts/data";

export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  if (!isLoaded) return <div>Loading...</div>;
  return <MapKit/>;
 function MapKit(){
  const center = useMemo(() => ({ lat: 49.231, lng: 1.222 }), []);
  const data = useData();

return (
    <GoogleMap zoom={9} center={center} mapContainerClassName="max-w-[800px] w-[50%] h-[450px] rounded-xl mx-auto sm:w-full" options={{ disableDefaultUI: true }}>
        {data.profile.logo&&<Marker position={center} icon={{url: data.profile.logo, scaledSize: new window.google.maps.Size(60, 60),}}/>}
    </GoogleMap>
  );
 }
}