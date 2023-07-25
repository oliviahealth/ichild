import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, StreetViewPanorama, useLoadScript } from "@react-google-maps/api";

interface Props {
    latitude: number
    longitude: number
}

const PanoramicStreetView: React.FC<Props> = ({ latitude, longitude }) => {
    const { isLoaded: isGoogleApiLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY
    })

    const [streetViewExists, setStreetViewExists] = useState(false);

    const center = { lat: latitude, lng: longitude }

    // Only render the compnent if a streetview can be found from Google  
    const checkIfStreetViewExists = async () => {
        const { data } = await axios.get(`https://maps.googleapis.com/maps/api/streetview/metadata?key=${import.meta.env.VITE_GOOGLE_API_KEY}&location=${latitude},${longitude}`);

        data.status === "OK" ? setStreetViewExists(true) : setStreetViewExists(false);
    }

    useEffect(() => {
        checkIfStreetViewExists()
    });

    if (!streetViewExists) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                
            </div>
        )
    }

    return (
        <div className="h-80">
            {isGoogleApiLoaded && (<GoogleMap mapContainerClassName="map-container" center={center} zoom={10}>
                { /* @ts-ignore */ }
                <StreetViewPanorama id="street-view" mapContainerClassName="map-container" position={center} visible={true} options={{ addressControl: false, enableCloseButton: false }}/>
            </GoogleMap>)}
        </div>
    )
}

export default PanoramicStreetView;