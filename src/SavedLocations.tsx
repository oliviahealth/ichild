import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import axios from "axios";

import useAppStore from "./stores/useAppStore";
import parseWithZod from "./utils/parseWithZod";
import { SavedLocationSchema, ISavedLocation, ILocation } from "./utils/interfaces";

import ChatBubble from "./components/Chat/ChatBubble";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { BiCopy } from "react-icons/bi";
import { BiSolidBookmark } from "react-icons/bi";
import LocationInfoPanel from "./components/Chat/LocationInfoPanel";

const SavedLocations: React.FC = () => {
    const user = useAppStore((state) => state.user);
    const accessToken = useAppStore((state) => state.accessToken);

    const [savedLocations, setSavedLocations] = useState<null | ISavedLocation[]>(null);
    const [focusedLocation, setFocusedLocation] = useState<null | ILocation>(null);
    const [deletingLocationName, setDeletingLocationName] = useState<null | string>(null);

    const copyText = useAppStore((state) => state.copyText);

    const { mutate: getSavedLocations, isLoading: getSavedLocationsLoading } = useMutation(async () => {
        const headers = {
            "Authorization": "Bearer " + accessToken,
            "userId": user?.id,
        }

        const savedLocations: ISavedLocation[] = (await axios.get(`${import.meta.env.VITE_API_URL}/savedlocations`, { headers: { ...headers }, withCredentials: true })).data

        // Make sure all of the saved locations are compliant with the location schema
        savedLocations.forEach((location: ISavedLocation) => parseWithZod(location, SavedLocationSchema));

        return savedLocations
    }, {
        onSuccess: (savedLocations) => {
            setSavedLocations(savedLocations);
        }
    });

    const { mutate: deleteSavedLocation, isLoading: isDeleteLoading } = useMutation(async (savedLocation: ILocation) => {
        const headers = {
            "Authorization": "Bearer " + accessToken,
            "userId": user?.id,
        }

        await axios.delete(`${import.meta.env.VITE_API_URL}/savedlocations?name=${savedLocation.name}`, { headers: { ...headers }, withCredentials: true });

        return savedLocation;
    }, {
        onMutate: (savedLocation) => setDeletingLocationName(savedLocation.name),
        onSuccess: (savedLocation) => {
            if(savedLocation === focusedLocation) {
                setFocusedLocation(null)
            }

            const newSavedLocations = savedLocations?.filter((location) => location.name !== savedLocation.name);

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
            {getSavedLocationsLoading && (
                <LoadingSkeleton />
            )}

            <div className="flex overflow-y-auto max-h-[calc(100vh-11rem)]">
                <div className="w-1/2">
                    {savedLocations?.map((location, index) => (
                        <div key={index} className="xl:flex gap-4 my-4">
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
                                            {user && (<button onClick={() => deleteSavedLocation(location)} className={`btn btn-square btn-xs bg-inherit border-none ml-4 hover:bg-gray-200`} >
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
                    { focusedLocation && (<LocationInfoPanel location={focusedLocation} locationToSave={null} saveLocation={null} isSaveLoading={null} isDeleteLoading={isDeleteLoading} deleteSavedLocation={deleteSavedLocation} />) }
                </div>
            </div>
        </div>
    )
}

export default SavedLocations;