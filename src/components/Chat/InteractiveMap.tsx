import React from "react";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";

import { ILocation } from "../../utils/interfaces";

interface MapMarkerProps {
    latitude: number
    longitude: number
}
const MapMarker: React.FC<MapMarkerProps> = ({ latitude, longitude }) => {
    return <MarkerF position={{ lat: latitude, lng: longitude }}  />
}

interface Props {
    locations?: ILocation[]
    center?: { lat: number, lng: number }
}

const InteractiveMap: React.FC<Props> = ({ locations }) => {
    const { isLoaded: isGoogleApiLoaded } = useLoadScript({
        version: '3.55',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    })

    return (
        <>
            {isGoogleApiLoaded && (<GoogleMap mapContainerClassName="map-container" center={{ lat: locations![0].latitude ?? 30.6280, lng: locations![0].longitude ?? -96.3344 }} zoom={15} options={{ streetViewControl: false, mapTypeControl: false}}>
                {locations?.map((location, index) => {
                    if(location.latitude && location.longitude) {
                        return (
                            <MapMarker key={`Map Marker: ${index}`} latitude={location.latitude} longitude={location.longitude} />
                        )
                    }
                })}
            </GoogleMap>)}
        </>
    )
}

export default InteractiveMap;