import React from "react";
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
    center?: { lat: number, lng: number }
}

const InteractiveMap: React.FC<Props> = ({ locations, center }) => {
    const { isLoaded: isGoogleApiLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY
    })

    return (
        <>
            {isGoogleApiLoaded && (<GoogleMap mapContainerClassName="map-container" center={center || { lat: 30.6280, lng: -96.3344 }} zoom={11} options={{ streetViewControl: false, mapTypeControl: false}}>
                {locations.map((location, index) => {
                    if(location.latitude && location.longitude) {
                        return (
                            <MapMarker key={index} latitude={location.latitude} longitude={location.longitude} text={String.fromCharCode(65 + index)} />
                        )
                    }
                })}
            </GoogleMap>)}
        </>
    )
}

export default InteractiveMap;