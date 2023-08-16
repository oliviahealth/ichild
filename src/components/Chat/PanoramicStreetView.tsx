import React from "react";
import { GoogleMap, StreetViewPanorama, useLoadScript } from "@react-google-maps/api";

interface Props {
    latitude: number
    longitude: number
}

const PanoramicStreetView: React.FC<Props> = ({ latitude, longitude }) => {
    const { isLoaded: isGoogleApiLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY
    })

    const center = { lat: latitude, lng: longitude }

    return (
        <div className="h-full">
            {isGoogleApiLoaded && (<GoogleMap mapContainerClassName="map-container" center={center} zoom={10}>
                { /* @ts-ignore */ }
                <StreetViewPanorama id="street-view" mapContainerClassName="map-container" position={center} visible={true} options={{ addressControl: false, enableCloseButton: false }}/>
            </GoogleMap>)}
        </div>
    )
}

export default PanoramicStreetView;