import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { ILocation } from "../../utils/interfaces";

import { BiCopy } from "react-icons/bi";
import { RxDotFilled } from "react-icons/rx";
import PanoramicStreetView from "./PanoramicStreetView";

interface Props {
    locations: ILocation[]
}

const LocationCarousel: React.FC<Props> = ({ locations }) => {
    // Gain access to the embla carousel api
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

    const [currentSlideIndex, setCurrentSlideIndex] = useState(emblaApi?.selectedScrollSnap() ?? 0);

    // Whenever a new slide is in view, update the currentSlideIndex
    emblaApi?.on("select", () => setCurrentSlideIndex(emblaApi?.selectedScrollSnap()));

    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    const copyText = (evt: React.MouseEvent, text: string) => {
        evt.stopPropagation();

        navigator.clipboard.writeText(text);
    }

    return (
        <div>
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">

                    {locations.map((location, index) => (
                        <div key={index} className="embla__slide p-3 mr-1 bg-white rounded-lg" >
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
                                <PanoramicStreetView latitude={location.latitude} longitude={location.longitude} />
                            </div>

                            <p onClick={() => setDescriptionExpanded(!descriptionExpanded)} className={`text-sm ${!descriptionExpanded ? "line-clamp-4" : ""}`}>{location.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center items-center w-full py-2">
                {locations.map((_, index) => (
                    <button key={index} className={`text-xl ${currentSlideIndex === index ? "text-primary" : "text-gray-400"}`}>
                        <RxDotFilled />
                    </button>
                ))}
            </div>
        </div>
    )
};

export default LocationCarousel;