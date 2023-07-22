import React, { useEffect, useState } from "react";

import { IAPIResponse, ILocation } from "../../utils/interfaces";

import { HiOutlineArrowPath } from "react-icons/hi2";
import { MdOutlineOpenInNew } from "react-icons/md"
import { BiCopy } from "react-icons/bi";
import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";

interface Props {
    apiResponse: IAPIResponse
    regenerateResponse: () => void
}

const ApiResponse: React.FC<Props> = ({ apiResponse, regenerateResponse }) => {
    const [focusedLocation, setFocusedLocation] = useState(apiResponse.locations[0] ?? null);

    console.log(focusedLocation);

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
                        <p>I've found {apiResponse.locations.length} location{apiResponse.locations.length >= 2 || apiResponse.locations.length === 0 ? "s" : ""} for you</p>
                    </ChatBubble>

                    <div className="lg:flex gap-6 flex-row-reverse w-full">
                        {focusedLocation && (
                            <div className="flex w-full h-96 bg-[#F8F5F5] rounded-xl">
                                <div className="w-2 bg-primary rounded-l-lg" >
                                </div> 

                                <div className="w-full h-full p-3">
                                    <iframe
                                        className={`w-full h-full`}
                                        loading="lazy"
                                        allowFullScreen={true}
                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD4tYjfBgNNOLlWBY1eHw9tJeiWKnb5bV0&q=${focusedLocation.address}`}>
                                    </iframe>
                                </div>
                                
                            </div>
                        )}

                        <div className="mr-auto">
                            {apiResponse.locations.map((location, index) => {
                                return (
                                    <div key={index} onClick={() => changeFocusedLocation(location)} className="cursor-pointer">
                                        <ChatBubble isResponse={true} isFocused={location === focusedLocation}>
                                            <div className="flex justify-between items-center p-1 sm:w-[25rem]">
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
                </div>
            </div>


        </div>

    )
}

export default ApiResponse;