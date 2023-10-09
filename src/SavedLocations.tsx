import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";

import useAppStore from "./stores/useAppStore";
import fetchWithAxios from "./utils/fetchWithAxios";
import parseWithZod from "./utils/parseWithZod";
import { SavedLocationSchema, ISavedLocation, ILocation } from "./utils/interfaces";

import ChatBubble from "./components/Chat/ChatBubble";
import OllieAvatar from "./components/Chat/OllieAvatar";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { TfiMenuAlt } from "react-icons/tfi";
import { BiCopy } from "react-icons/bi";
import { BiSolidBookmark } from "react-icons/bi";
import LocationInfoPanel from "./components/Chat/LocationInfoPanel";

const SavedLocations: React.FC = () => {
    const user = useAppStore((state) => state.user);

    const [savedLocations, setSavedLocations] = useState<null | ISavedLocation[]>(null);
    const [focusedLocation, setFocusedLocation] = useState<null | ILocation>(null);
    const [deletingLocationName, setDeletingLocationName] = useState<null | string>(null);

    const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
    const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

    const copyText = useAppStore((state) => state.copyText);

    const { mutate: getSavedLocations, isLoading } = useMutation(async () => {
        const savedLocations: ISavedLocation[] = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/savedlocations`, 'GET', null, { name: 'userId', content: user!.id });

        // Make sure all of the saved locations are compliant with the location schema
        savedLocations.forEach((location: ISavedLocation) => parseWithZod(location, SavedLocationSchema));

        return savedLocations
    }, {
        onSuccess: (savedLocations) => {
            setSavedLocations(savedLocations);
        }
    });

    const { mutate: deleteSavedLocation, isLoading: isDeleteLoading } = useMutation(async (savedLocationName: string) => {
        await fetchWithAxios(`${import.meta.env.VITE_API_URL}/savedlocations`, 'DELETE', null, { name: 'name', content: savedLocationName });

        return savedLocationName;
    }, {
        onMutate: (savedLocationName) => setDeletingLocationName(savedLocationName),
        onSuccess: (savedLocationName) => {
            const newSavedLocations = savedLocations?.filter((location) => location.name !== savedLocationName);

            setSavedLocations(newSavedLocations ?? null);
        },
        onSettled: () => setDeletingLocationName(null)
    })

    useEffect(() => {
        if (user) {
            getSavedLocations();
        }
    }, [user])

    return (
        <div className="flex w-full flex-col h-full p-4">
            {!isSidePanelOpen && (
                <button className="drawer-content absolute btn w-12 m-3 btn-primary btn-outline border-primary bg-white z-10" onClick={() => setisSidePanelOpen(!isSidePanelOpen)}>
                    <TfiMenuAlt className="text-lg" />
                </button>
            )}

            {isLoading && (
                <LoadingSkeleton />
            )}

            <div className="flex overflow-y-auto max-h-[calc(100vh-11rem)]">
                <div className="w-1/2">
                    {savedLocations?.map((location, index) => (
                        <div key={index} className="xl:flex gap-4 my-4">
                            <div>
                                <OllieAvatar />
                            </div>

                            <div onClick={() => setFocusedLocation(location)}>
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
                                            {user && (<button onClick={() => deleteSavedLocation(location.name)} className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} >
                                                {isDeleteLoading && deletingLocationName === location.name ? (<span className="loading loading-spinner loading-sm"></span>) : (<BiSolidBookmark className="text-xl text-black" />)}
                                            </button>)}

                                            <button className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} onClick={() => copyText(location.address)}>
                                                <BiCopy className="text-xl text-black" />
                                            </button>
                                        </div>
                                    </div>
                                </ChatBubble>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-1/2">
                    {  focusedLocation && (<LocationInfoPanel location={focusedLocation} />) }
                </div>
            </div>
        </div>
    )
}

export default SavedLocations;