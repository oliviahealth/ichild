import React, { useEffect } from "react";
import { useMutation } from "react-query";

import useAppStore from "./stores/useAppStore";
import fetchWithAxios from "./utils/fetchWithAxios";
import parseWithZod from "./utils/parseWithZod";
import { SavedLocationSchema, ISavedLocation } from "./utils/interfaces";

import ChatBubble from "./components/Chat/ChatBubble";
import OllieAvatar from "./components/Chat/OllieAvatar";
import InteractiveMap from "./components/Chat/InteractiveMap";
import { TfiMenuAlt } from "react-icons/tfi";
import { BiCopy } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";

const SavedLocations: React.FC = () => {
    const user = useAppStore((state) => state.user);

    const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

    const { data: savedLocations, mutate: getSavedLocations, isLoading } = useMutation(async () => {
        const savedLocations: ISavedLocation[] = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/savedlocations?userId=${user?.id}`, 'GET');

        // Make sure all of the saved locations are compliant with the location schema
        savedLocations.forEach((location: ISavedLocation) => parseWithZod(location, SavedLocationSchema));

        return savedLocations
    });

    useEffect(() => {
        if (user) {
            getSavedLocations();
        }
    }, [user])

    const copyText = (evt: React.MouseEvent, text: string) => {
        evt.stopPropagation();

        navigator.clipboard.writeText(text);
    }

    // Convert milliseconds to a formatted date and time
    function convertMillisecondsToFormattedDateTime(milliseconds: number) {
        const date = new Date(milliseconds);
        const year = date.getFullYear();
        const month = date.getMonth(); // Month is 0-based
        const day = date.getDate();
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const period = hours < 12 ? 'AM' : 'PM';
        const formattedHours = (hours % 12 === 0 ? 12 : hours % 12).toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

        return {
            formattedDate,
            formattedTime
        };
    }


    return (
        <div className="flex w-full flex-col h-full m-4">
            {!isSidePanelOpen && (
                <button className="drawer-content absolute btn w-12 m-3 btn-primary btn-outline border-primary bg-white z-10" onClick={() => setisSidePanelOpen(!isSidePanelOpen)}>
                    <TfiMenuAlt className="text-lg" />
                </button>
            )}

            { isLoading && (
                <div className="flex justify-center">
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                </div>
            ) }

            <div className="flex flex-col gap-6">
                {savedLocations?.map((location, index) => {
                    const { formattedDate, formattedTime } = convertMillisecondsToFormattedDateTime(location.dateCreated);

                    return (<div className="flex items-center gap-4">
                        <div>
                            <OllieAvatar />
                        </div>

                        <div>
                            <ChatBubble isResponse={true} >
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

                                    <div className="flex flex-col gap-6">
                                        <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} onClick={(evt) => copyText(evt, location.address)}>
                                            <BiCopy className="text-xl text-black" />
                                        </button>

                                        {user && (<button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} >
                                            <BsTrash className="text-xl text-black" />
                                        </button>)}
                                    </div>
                                </div>
                            </ChatBubble>
                        </div>

                        <div className="w-[29rem] h-32 p-3 bg-white rounded-xl">
                            <InteractiveMap center={{ lat: location.latitude, lng: location.longitude }} locations={[location]} />
                        </div>

                        <div className="text-sm">
                            <p>{formattedTime}</p>
                            <p>{formattedDate}</p>
                        </div>
                    </div>)
                })}
            </div>
        </div>
    )
}

export default SavedLocations;