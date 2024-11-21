import React from "react";

interface Props {
    children: React.ReactNode
    isResponse: boolean
    isLocationResponse?: boolean
    isFocused?: boolean
    isScrollTarget?: boolean
}

const ChatBubble: React.FC<Props> = ({ children, isResponse, isLocationResponse: isLocation, isFocused: focused, isScrollTarget }) => {
    return (
        <div className={`chat ${isResponse ? "chat-start max-w-2xl w-max" : "chat-end"}`} data-is-scroll-target={isScrollTarget}>
            <div className={`flex rounded-box whitespace-pre-wrap ${ !isResponse ? "max-w-[80%] bg-primary text-white" : "bg-white" } ${focused ? "" : "bg-opacity-80"} text-black`}>
                <div className={`w-2 bg-${focused ? "primary" : "transparent"} rounded-l-lg`} hidden={!isLocation}>
                </div>

                <div className="w-full py-2 px-4">
                    { children }
                </div>
            </div>
        </div>
    )
};

export default ChatBubble;