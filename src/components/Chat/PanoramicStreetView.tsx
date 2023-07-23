import React from "react";
import { GoogleMap, useLoadScript, StreetViewPanorama, LoadScript } from "@react-google-maps/api";

interface Props {
    latitude: number
    longitude: number
}

const PanoramicStreetView: React.FC<Props> = ({ latitude, longitude }) => {
    const containerStyle = {
        height: "100%",
        width: "100%"
    }

    const center = { lat: latitude, lng: longitude }

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyD4tYjfBgNNOLlWBY1eHw9tJeiWKnb5bV0"
    });

    return (
        <>
            {isLoaded ? (<GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                <StreetViewPanorama id="street-view" mapContainerStyle={containerStyle} position={center} visible={true} />
            </GoogleMap>) : ""}
        </>
    )
}

export default PanoramicStreetView;