import React from "react";

const ChatLoadingSkeleton: React.FC = () => {
    return (
        <div className="border border-none animate-pulse gap-4 flex justify-center">
            <div className="bg-gray-100 h-12 w-12 rounded-full"></div>

            <div className="w-full">
                <div className="rounded-xl flex w-full space-x-4">
                    <div className="w-full max-w-[29rem] space-y-2">
                        <div className="w-full bg-gray-100 h-32 rounded-xl"></div>
                    </div>

                    <div className="bg-gray-100 w-full h-32 rounded-xl">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatLoadingSkeleton;