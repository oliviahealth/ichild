import React, { useEffect, useState } from "react";

import { IAPIResponse } from "../../utils/interfaces";

import { MdOutlineOpenInNew } from "react-icons/md";
import { BiCopy } from "react-icons/bi";
import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";
import LocationCarousel from "./LocationCarousel";
import InteractiveMap from "./InteractiveMap";
import PanoramicStreetView from "./PanoramicStreetView";

interface Props {
    apiResponse: IAPIResponse
}

const ApiResponse: React.FC<Props> = ({ apiResponse }) => {
    const [focusedLocation, setFocusedLocation] = useState(apiResponse.locations[0] ?? null);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    useEffect(() => {
        setFocusedLocation(apiResponse.locations[0] ?? null);
    }, [apiResponse]);

    const copyText = (evt: React.MouseEvent, text: string) => {
        evt.stopPropagation();

        navigator.clipboard.writeText(text);
    }

    return (
        <div>
            <div className="xl:flex gap-4 items-center w-full">
                <div className="self-start">
                    <OllieAvatar />
                </div>

                <div className="w-full h-full">
                    <ChatBubble isResponse={true}>
                        <p className="mb-2">I've found {apiResponse.locations.length} location{apiResponse.locations.length >= 2 || apiResponse.locations.length === 0 ? "s" : ""} for you</p>
                    </ChatBubble>

                
                    <div className="max-w-[29rem] h-48 p-3 bg-white rounded-xl">
                        <InteractiveMap locations={apiResponse.locations} />
                    </div>

                    <div className="hidden xl:flex flex-row-reverse">
                        {focusedLocation && (
                            <div className="flex w-full h-full bg-[#F8F5F5] rounded-xl">
                                <div className="w-2 bg-primary rounded-l-lg" >
                                </div>

                                <div className="w-full h-full p-3 object-container">

                                    <div className="h-80">
                                        <PanoramicStreetView latitude={focusedLocation.latitude} longitude={focusedLocation.longitude} />
                                    </div>

                                    <div className="my-4 flex flex-col gap-4">
                                        <p className="font-semibold text-2xl text-primary">{focusedLocation.name}</p>

                                        <p className={`text-sm ${!descriptionExpanded ? "line-clamp-4" : ""}`} onClick={() => setDescriptionExpanded(!descriptionExpanded)} >{focusedLocation.description}</p>

                                        <a href={focusedLocation.addressLink} target="_blank" className={`max-w-[200px] btn btn-xs text-black bg-gray-300 border-none hover:bg-gray-400`}>
                                            <MdOutlineOpenInNew className="text-lg" />
                                            <p>Open Google Maps</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            {apiResponse.locations.map((location, index) => {
                                return (
                                    <div key={index} onClick={() => setFocusedLocation(location)} className="cursor-pointer">
                                        <ChatBubble isResponse={true} isFocused={location === focusedLocation}>
                                            <div className="flex justify-between items-center p-1 sm:w-[27rem]">
                                                <div className="flex items-center gap-6 w-full">
                                                    {/* Render the letters of the alphabet starting with 'A' */}
                                                    <p className="text-3xl text-primary">{String.fromCharCode(65 + index)}</p>

                                                    <div className="w-full">
                                                        <p className="font-semibold">{location.name}</p>

                                                        <div className="flex gap-2 my-3">
                                                            <a className="btn btn-xs border-none bg-gray-200 text-black hover:bg-gray-300">Website</a>
                                                            <a href={location.addressLink} target="_blank" className="btn btn-xs border-none bg-gray-200 text-black hover:bg-gray-300">Directions</a>
                                                        </div>

                                                        <p className="text-sm">{location.address}</p>
                                                    </div>
                                                </div>

                                                <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} onClick={(evt) => copyText(evt, location.address)}>
                                                    <BiCopy className="text-xl text-black" />
                                                </button>
                                            </div>
                                        </ChatBubble>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="xl:hidden max-w-lg mt-2">
                        <LocationCarousel locations={apiResponse.locations} />
                    </div>
                </div>
            </div>


        </div >

    )
}

export default ApiResponse;