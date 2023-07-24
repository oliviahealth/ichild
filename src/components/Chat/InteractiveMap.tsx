import React, { useMemo } from "react";
import { GoogleMap, MarkerF, LoadScript } from "@react-google-maps/api";

import { ILocation } from "../../utils/interfaces";

interface MapMarkerProps {
    latitude: number
    longitude: number
    text: string
}
const MapMarker: React.FC<MapMarkerProps> = ({ latitude, longitude, text }) => {
    return <MarkerF position={{ lat: latitude, lng: longitude }} label={{ text, color: "#fff" }}  />
}

interface Props {
    locations: ILocation[]
}

const InteractiveMap: React.FC<Props> = ({ locations }) => {
    const center = useMemo(() => ({ lat: 30.6280, lng: -96.3344 }), []);

    return (
       <LoadScript googleMapsApiKey="AIzaSyD4tYjfBgNNOLlWBY1eHw9tJeiWKnb5bV0">
            <GoogleMap mapContainerClassName="map-container" center={center} zoom={11}>
            { locations.map((location, index) => (
                <MapMarker key={index} latitude={location.latLng.lat} longitude={location.latLng.lng} text={String.fromCharCode(65 + index)} />
            )) }
        </GoogleMap>
       </LoadScript>
    )
}

export default InteractiveMap;