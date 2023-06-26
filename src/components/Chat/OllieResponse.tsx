import React, { useRef } from "react";

import { IOllieResponse } from "../../utils/interfaces";

import { BiCopy } from "react-icons/bi";
import Ollie from "../../assets/ollie.png";

interface OllieResponseProps {
    response: IOllieResponse;
}

const OllieResponse: React.FC<OllieResponseProps> = ({ response }) => {
    const ollieResponseRef = useRef<HTMLParagraphElement>(null);

    const copyOllieResponse = () => {
        if (ollieResponseRef.current) {
            const textToCopy = ollieResponseRef.current.innerText;

            navigator.clipboard.writeText(textToCopy);
        }
    }

    return (
        <>
            <div className={`chat w-full chat-start `}>
                <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                        <img src={Ollie} />
                    </div>
                </div>
                <div className={`flex items-center py-2 px-4 rounded-lg whitespace-pre-wrap bg-white`}>
                    <p ref={ollieResponseRef}>
                        I've found {response.answer.names.length} possible matches for you, hover over a facility name for a description

                        {response.answer.names.map((name, index) => (
                            <div className="text-sm" key={index}>
                                <br />
                                <p className="text-base tooltip" data-tip={response.answer.descriptions[index]}>
                                    {name}
                                </p>
                                <p>{response.answer.phone[index]}</p>
                                <p>{response.answer.unencodedAddress[index]}</p>
                            </div>
                        ))}

                    </p>

                    <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} onClick={copyOllieResponse}>
                        <BiCopy className="text-xl text-black" />
                    </button>
                </div>

            </div>
        </>
    );
};

export default OllieResponse;