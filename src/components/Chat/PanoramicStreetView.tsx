import React from "react";
import { GoogleMap, StreetViewPanorama, LoadScript } from "@react-google-maps/api";

interface Props {
    latitude: number
    longitude: number
}

const PanoramicStreetView: React.FC<Props> = ({ latitude, longitude }) => {
    const center = { lat: latitude, lng: longitude }

    return (
        <LoadScript googleMapsApiKey="AIzaSyD4tYjfBgNNOLlWBY1eHw9tJeiWKnb5bV0">
            <GoogleMap mapContainerClassName="map-container" center={center} zoom={10}>
                <StreetViewPanorama id="street-view" mapContainerClassName="map-container" position={center} visible={true} />
            </GoogleMap>
        </LoadScript>
    )
}

export default PanoramicStreetView;