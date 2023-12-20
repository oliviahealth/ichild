import React, { useState } from "react";
import { ILocation } from "../../utils/interfaces";

import { BiBookmark, BiSolidBookmark } from "react-icons/bi";
import { MdOutlineOpenInNew } from "react-icons/md";
import PanoramicStreetView from "./PanoramicStreetView";
import InteractiveMap from "./InteractiveMap";

interface Props {
    location: ILocation
    isDeleteLoading: boolean
    isSaveLoading: boolean
    locationToSave: ILocation | null

    saveLocation: (location: ILocation) => void
    deleteSavedLocation: (location: ILocation) => void
}

const LocationInfoPanel: React.FC<Props> = ({ location, isDeleteLoading, isSaveLoading, locationToSave, saveLocation, deleteSavedLocation }) => {
    const currentDayOfWeek = new Date().getDay()
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    return (
        <div className="my-4 flex flex-col gap-4 bg-[#F8F5F5] p-3 rounded-xl">
            <div className="h-80">
                {location.streetViewExists && location.latitude && location.longitude ? <PanoramicStreetView latitude={location.latitude} longitude={location.longitude} /> : <InteractiveMap locations={[location]} />}
            </div>

            <div className="flex gap-4 items-center">
                <p className="font-semibold text-2xl">{location.name}</p>

                {location.isSaved ? (
                        isDeleteLoading && locationToSave === location ? ( <span className="loading loading-spinner loading-sm"></span> ) : ( <BiSolidBookmark onClick={() => deleteSavedLocation(location)} className="text-xl text-black" /> )
                    ) : ( isSaveLoading && locationToSave === location ? ( <span className="loading loading-spinner loading-sm"></span> ) : ( <BiBookmark onClick={() => saveLocation(location)} className="text-xl text-black" /> ) 
                )}
            </div>

            <div className="flex gap-x-1 items-center">
                <div className="rating rating-md rating-half flex items-center gap-2">
                    {location.rating && (<>
                        <div>
                            {Array.from({ length: Math.round(location.rating * 2) }).map((_, elm) => (
                                <span key={`Rating: ${elm}`}>{(elm * 0.5) === Math.floor(elm * 0.5) ? <input type="radio" name="rating-10" className="bg-yellow-500 mask mask-star-2 mask-half-1" /> : <input type="radio" name="rating-10" className="bg-yellow-500 mask mask-star-2 mask-half-2" />}</span>
                            ))}
                        </div>
                        <span>({location.rating})</span></>)}
                </div>
            </div>

            <div className="collapse collapse-arrow bg-opacity-50 bg-gray-200 text-sm">
                <input type="checkbox" className="peer" />
                <div className="collapse-title flex justify-between items-center font-semibold">
                    <p>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][currentDayOfWeek]}</p>
                    <p>{Object.values(location.hoursOfOperation[currentDayOfWeek])[0].split(": ")[1]}</p>
                </div>
                <div className="collapse-content">
                    {location.hoursOfOperation.map((hours, index) => {
                        const dayOfWeek = Object.keys(hours)[0];
                        const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

                        return (
                            <div key={`DayOfWeek: ${index}`} className={`flex justify-between my-1 ${currentDayOfWeek === index ? 'font-semibold' : ''}`}>
                                <p key={`Capitalized Day of Week: ${index}`}>{capitalizedDayOfWeek}</p>

                                <p key={`Hours: ${index}`}>{Object.values(hours)[0].split(": ")[1]}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <p className={`text-sm ${!descriptionExpanded ? "line-clamp-4" : ""}`} onClick={() => setDescriptionExpanded(!descriptionExpanded)} >{location.description}</p>

            <div className="flex gap-x-1 items-center">
                <p className="font-semibold">Website: </p>
                <a className="text-primary" href={location.website} target="_blank">{location.website}</a>
            </div>

            <div className="flex gap-x-1 items-center">
                <p className="font-semibold">Phone: </p>
                <a href={`tel:${location.phone}`} target="_blank">{location.phone}</a>
            </div>

            <a href={location.addressLink} target="_blank" className={`max-w-[200px] btn btn-xs text-black bg-gray-300 border-none hover:bg-gray-400`}>
                <MdOutlineOpenInNew className="text-lg" />
                <p>Open Google Maps</p>
            </a>
        </div>
    )
}

export default LocationInfoPanel;