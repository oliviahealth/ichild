import React, { useMemo } from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";

import { ILocation } from "../../utils/interfaces";

interface MapMarkerProps {
    latitude: number
    longitude: number
    text: string
}
const MapMarker: React.FC<MapMarkerProps> = ({ latitude, longitude, text }) => {
    return <MarkerF position={{ lat: latitude, lng: longitude }} label={{ text, color: "#fff" }} />
}

interface Props {
    locations: ILocation[]
}

const InteractiveMap: React.FC<Props> = ({ locations }) => {
    const { isLoaded: isGoogleApiLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY
    })

    const center = useMemo(() => ({ lat: 30.6280, lng: -96.3344 }), []);

    return (
        <>
            {isGoogleApiLoaded && (<GoogleMap mapContainerClassName="map-container" center={center} zoom={11} options={{ mapTypeControl: false}}>
                {locations.map((location, index) => (
                    <MapMarker key={index} latitude={location.latitude} longitude={location.longitude} text={String.fromCharCode(65 + index)} />
                ))}
            </GoogleMap>)}
        </>
    )
}

export default InteractiveMap;