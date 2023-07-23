import React from "react";

import GoogleMapReact from "google-map-react";

interface Props {
    latitude: number
    longitude: number
}

const InteractiveMap: React.FC<Props> = ({ latitude, longitude }) => {
    return (
        <GoogleMapReact
            bootstrapURLKeys={{ key: "" }}
            center={{ lat: latitude, lng: longitude }}
            defaultZoom={15}
        >
            { /* @ts-ignore */ }
            <p lat={latitude} lng={longitude} text="Marker" >
                Marker
            </p>
        </GoogleMapReact>
    )
}

export default InteractiveMap;