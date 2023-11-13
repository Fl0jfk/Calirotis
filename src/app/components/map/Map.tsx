import { useMemo } from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { useData } from "../../contexts/data";

const MAP_OPTIONS = {
  disableDefaultUI: true,
};

export default function Map() {
  const center = useMemo(() => ({ lat: 49.231, lng: 1.222 }), []);
  const data = useData();
  return (
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
        <GoogleMap zoom={9} center={center} mapContainerClassName="max-w-[800px] w-[50%] h-[450px] rounded-xl mx-auto sm:w-full" options={MAP_OPTIONS}>
          {data.profile.logo && (
            <Marker position={center} icon={{ url: data.profile.logo, scaledSize: new window.google.maps.Size(70, 70)}}/>
          )}
        </GoogleMap>
      </LoadScript>
  )
}