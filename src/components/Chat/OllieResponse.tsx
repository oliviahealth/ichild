import React from "react";

import { IOllieResponse } from "../../utils/interfaces";

import { BiCopy } from "react-icons/bi";
import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";

interface Props {
    ollieResponse: IOllieResponse
}

const OllieResponse: React.FC<Props> = ({ ollieResponse }) => {
    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
    }

    return (
        <div className="flex gap-4">
            <div>
                <OllieAvatar />
            </div>

            <div className="w-full">
                <ChatBubble isResponse={true}>
                    <p>I've found {ollieResponse.names.length} location{ollieResponse.names.length >= 2 || ollieResponse.names.length === 0 ? "s" : ""} for you</p>
                </ChatBubble>

                {ollieResponse.names.map((response, index) => {
                    const addressLink = ollieResponse.addressLinks[index];
                    const unencodedAddress = ollieResponse.unencodedAddress[index];

                    return (
                        <ChatBubble isResponse={true}>
                            <div className="flex justify-between items-center p-1 w-[28rem]">
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

                                <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} onClick={() => copyText(unencodedAddress)}>
                                    <BiCopy className="text-xl text-black" />
                                </button>
                            </div>
                        </ChatBubble>
                    )
                })}
            </div>
        </div>

    )
}

export default OllieResponse;