import React, { useState } from "react";

import { IOllieResponse } from "../../utils/interfaces";

import { HiOutlineArrowPath } from "react-icons/hi2";
import { MdOutlineOpenInNew } from "react-icons/md"
import { BiCopy } from "react-icons/bi";
import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";

interface Props {
    ollieResponse: IOllieResponse
    regenerateResponse: () => void
}

const OllieResponse: React.FC<Props> = ({ ollieResponse, regenerateResponse }) => {
    const [focusedLocation, setFocusedLocation] = useState(ollieResponse.unencodedAddress[0] ?? null);

    const copyText = (evt: React.MouseEvent, text: string) => {
        evt.stopPropagation();

        navigator.clipboard.writeText(text);
    }

    const changeFocusedLocation = (newAddress: string) => {
        setFocusedLocation(newAddress);
    }

    return (
        <div>
            <div className="sm:flex gap-4 items-center w-full">
                <div className="self-start">
                    <OllieAvatar />
                </div>

                <div className="w-full h-full">
                    <ChatBubble isResponse={true}>
                        <p>I've found {ollieResponse.names.length} location{ollieResponse.names.length >= 2 || ollieResponse.names.length === 0 ? "s" : ""} for you</p>
                    </ChatBubble>

                    <div className="xl:flex flex-row-reverse">
                        {focusedLocation && (
                            <div className="flex flex-col w-full h-96 p-3 pb-1 bg-white rounded-xl">
                                <iframe
                                    className={`w-full h-full`}
                                    loading="lazy"
                                    allowFullScreen={true}
                                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD4tYjfBgNNOLlWBY1eHw9tJeiWKnb5bV0&q=${focusedLocation}`}>
                                </iframe>

                                <a href={ollieResponse.addressLinks[ollieResponse.unencodedAddress.indexOf(focusedLocation)]} target="_blank" className={`max-w-[200px] my-2 btn btn-xs text-black bg-gray-300 border-none hover:bg-gray-400`}>
                                    <MdOutlineOpenInNew className="text-lg" />
                                    <p>Open Google Maps</p>
                                </a>
                            </div>
                        )}

                        <div className="w-full">
                            {ollieResponse.names.map((response, index) => {
                                const addressLink = ollieResponse.addressLinks[index];
                                const unencodedAddress = ollieResponse.unencodedAddress[index];

                                return (
                                    <div onClick={() => changeFocusedLocation(unencodedAddress)} className="cursor-pointer">
                                        <ChatBubble isResponse={true}>
                                            <div className="flex justify-between items-center p-1 w-full sm:w-[28rem]">
                                                <div className="flex items-center gap-6">
                                                    {/* Render the letters of the alphabet starting with 'A' */}
                                                    <p className="text-3xl text-primary">{String.fromCharCode(65 + index)}</p>

                                                    <div>
                                                        <p className="font-semibold">{response}</p>

                                                        <div className="flex gap-2 my-3">
                                                            <a className="btn btn-xs border-none bg-gray-200 text-black hover:bg-gray-300">Website</a>
                                                            <a href={addressLink} target="_blank" className="btn btn-xs border-none bg-gray-200 text-black hover:bg-gray-300">Directions</a>
                                                        </div>

                                                        <p className="text-sm">{unencodedAddress}</p>
                                                    </div>
                                                </div>

                                                <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} onClick={(evt) => copyText(evt, unencodedAddress)}>
                                                    <BiCopy className="text-xl text-black" />
                                                </button>
                                            </div>
                                        </ChatBubble>
                                    </div>
                                )
                            })}
                            <button onClick={regenerateResponse} className={`my-1 btn btn-xs text-black bg-gray-300 border-none hover:bg-gray-400 `}>
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

export default OllieResponse;