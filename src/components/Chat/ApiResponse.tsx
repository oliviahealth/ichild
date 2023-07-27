import React, { useEffect, useState } from "react";
import Slider from "react-slick";

import { IAPIResponse, ILocation } from "../../utils/interfaces";

import { HiOutlineArrowPath } from "react-icons/hi2";
import { MdOutlineOpenInNew } from "react-icons/md";
import { BiCopy } from "react-icons/bi";
import { RxDotFilled } from "react-icons/rx";
import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";
import InteractiveMap from "./InteractiveMap";
import PanoramicStreetView from "./PanoramicStreetView";

interface Props {
    apiResponse: IAPIResponse
    regenerateResponse: () => void
}

const ApiResponse: React.FC<Props> = ({ apiResponse, regenerateResponse }) => {
    console.log(apiResponse);

    const [focusedLocation, setFocusedLocation] = useState(apiResponse.locations[0] ?? null);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    useEffect(() => {
        setFocusedLocation(apiResponse.locations[0] ?? null);
    }, [apiResponse]);

    const copyText = (evt: React.MouseEvent, text: string) => {
        evt.stopPropagation();

        navigator.clipboard.writeText(text);
    }

    const changeFocusedLocation = (newLocation: ILocation) => {
        setFocusedLocation(newLocation);
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

                    <div className="w-full h-60 p-3 bg-white rounded-xl">
                        <InteractiveMap locations={apiResponse.locations} />
                    </div>

                    <div className="hidden xl:flex flex-row-reverse">
                        {focusedLocation && (
                            <div className="flex w-full h-full bg-[#F8F5F5] rounded-xl">
                                <div className="w-2 bg-primary rounded-l-lg" >
                                </div>

                                <div className="w-full h-full p-3 object-container">

                                    <PanoramicStreetView latitude={focusedLocation.latitude} longitude={focusedLocation.longitude} />

                                    <div className="my-4 flex flex-col gap-4">
                                        <p className="font-semibold text-2xl text-primary">{focusedLocation.name}</p>

                                        <p className="text-sm">{focusedLocation.description}</p>

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
                                    <div key={index} onClick={() => changeFocusedLocation(location)} className="cursor-pointer">
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

                            <button onClick={regenerateResponse} className={`my-1 btn btn-xs text-black bg-gray-300 border-none hover:bg-gray-400`}>
                                <HiOutlineArrowPath className="text-lg" />
                                <p>Regenerate response</p>
                            </button>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="w-full carousel rounded-box">
                            {apiResponse.locations.map((location, index) => (
                                <div key={index} className="carousel-item w-full" onFocus={() => alert("Alert")}>
                                    <div className="bg-white w-full p-3">
                                        <p className="font-semibold">{location.name}</p>

                                        <div className="flex gap-2 my-3">
                                            <a className="btn btn-xs border-none bg-gray-200 text-black hover:bg-gray-300">Website</a>
                                            <a href={location.addressLink} target="_blank" className="btn btn-xs border-none bg-gray-200 text-black hover:bg-gray-300">Directions</a>

                                            <button className={`btn btn-square btn-xs bg-inherit border-none hover:bg-gray-200`} onClick={(evt) => copyText(evt, location.address)}>
                                                <BiCopy className="text-xl text-black" />
                                            </button>
                                        </div>

                                        <p className="text-sm">{location.address}</p>

                                        <div className="h-40 my-2">
                                            <PanoramicStreetView latitude={focusedLocation.latitude} longitude={focusedLocation.longitude} />
                                        </div>

                                        <p onClick={() => setDescriptionExpanded(!descriptionExpanded)} className={`text-sm ${!descriptionExpanded ? "line-clamp-3" : ""}`}>{focusedLocation.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center items-center w-full py-2">
                            {apiResponse.locations.map((location, index) => (
                                <button key={index} className={`text-xl ${focusedLocation === location ? "text-primary" : "text-gray-400" }`}>
                                    <RxDotFilled />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


        </div >

    )
}

export default ApiResponse;