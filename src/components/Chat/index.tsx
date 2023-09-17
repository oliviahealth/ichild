import React, { useRef, useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";

import useAppStore from "../../stores/useAppStore";
import parseWithZod from "../../utils/parseWithZod";
import { APIResponseSchema, ConversationSchema, IAPIResponse, IConversation } from "../../utils/interfaces";

import { TfiMenuAlt } from "react-icons/tfi";

import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";
import ChatLoadingSkeleton from "./ChatLoadingSkeleton";
import ApiResponse from "./ApiResponse";
import fetchWithAxios from "../../utils/fetchWithAxios";

const ChatComponent: React.FC = () => {
  /*
    Use Zustand to manage global state for the application
    https://github.com/pmndrs/zustand
  */
  const user = useAppStore((state) => state.user);

  const isSidePanelOpen = useAppStore((state) => state.isSidePanelOpen);
  const setisSidePanelOpen = useAppStore((state) => state.setisSidePanelOpen);

  // The actual response from the api including the locations the api suggests
  const [apiResponses, setApiResponses] = useState<IAPIResponse[]>([]);

  // Conversation previews are an array of past conversations that the user has had, but only with the id and the title for each past conversation
  // We use the id to fetch the complete past conversation object when the user focuses on one of them
  const ConversationPreviews = useAppStore((state) => state.conversationPreviews);
  const setConversationPreviews = useAppStore((state) => state.setConversationPreviews);

  // Update the currentConversation object inside the app store whenever the user asks a question and gets a response
  const currentConversationId = useAppStore((state) => state.currentConversationId);
  const setCurrentConversationId = useAppStore((state) => state.setCurrentConversationId);

  // Using react-hook-form to manage the state of the input field
  // https://www.react-hook-form.com/
  const { register, handleSubmit, reset, getValues } = useForm();

  // Creates the auto scroll when the api responds
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the container with smooth animation
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  });

  // Set the current conversation id to be null when the user navigates off the chat page
  useEffect(() => {
    return () => {
      setCurrentConversationId(null);
    };
  }, []);

  { /* When the user focuses on a previous conversation from the sidepanel, we fetch the complete conversation object and populate the api response array to display the suggested locations */ }
  const { mutate: getConversationDetails, isLoading } = useMutation(async () => {
    const conversationDetails: IConversation = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversation?conversationId=${currentConversationId}`, 'GET');
    
    parseWithZod(conversationDetails, ConversationSchema)

    return conversationDetails
  }, {
    onSuccess: (conversationDetails) => {
      setApiResponses(conversationDetails.responses);
    }
  });

  useEffect(() => {
    setApiResponses([])

    if (currentConversationId) {
      getConversationDetails()
    }
  }, [currentConversationId]);

  // Call the backend with the user entered query to get a response
  // https://tanstack.com/query/v4/docs/react/guides/mutations
  const { mutate: getResponse, isLoading: isResponseLoading } = useMutation(async (data: any) => {
    if (data.query === "") return

    const formData = new FormData();
    formData.append("data", data.query);

    const response: IAPIResponse = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/formattedresults`, 'POST', formData, { "Content-Type": "multipart/form-data" })

    // If a user is logged in, save their conversation
    if (user) {
      const conversation: IConversation = await fetchWithAxios(`${import.meta.env.VITE_API_URL}/conversations?userId=${user.id}`, 'POST', { id: currentConversationId, title: response.userQuery, userId: user.id }).catch((err) => console.log(err))
      await fetchWithAxios(`${import.meta.env.VITE_API_URL}/response`, 'POST', { ...response, conversationId: conversation.id }).catch((err) => console.log(err));

      // If this is a new conversation, add it to the recent activity on the sidepanel
      if (!currentConversationId) {
        setConversationPreviews([...ConversationPreviews, { id: conversation.id ?? uuid(), title: response.userQuery }])
      }

      setCurrentConversationId(conversation.id);
    }

    // Parse the response and make sure it complies with the expected API Response
    parseWithZod(response, APIResponseSchema);

    return response
  }, {
    onSuccess: (response) => {
      if (response) {
        setApiResponses([...apiResponses, response])
      }

      reset()
    }
  });

  return (
    <div className="flex w-full flex-col h-full">
      {!isSidePanelOpen && (
        <button className="drawer-content absolute btn w-12 m-3 btn-primary btn-outline border-primary bg-white z-10" onClick={() => setisSidePanelOpen(!isSidePanelOpen)}>
          <TfiMenuAlt className="text-lg" />
        </button>
      )}

      <div className={ `h-full p-4 flex flex-col ${ !isLoading ? 'justify-end' : 'justify-start'}` }>
        <div ref={containerRef} className="overflow-y-auto max-h-[calc(100vh-14rem)] ">

          {isLoading ? (<ChatLoadingSkeleton />) : (
            <>
              { /* Initial greeting */}
              <div className="xl:flex gap-4">
                <OllieAvatar />
                <ChatBubble isResponse={true}>
                  <p>Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?</p>
                </ChatBubble>
              </div>

              { /* Api response to user query */}
              {apiResponses.map((response, index) => {
                return (
                  <div key={`${index} - question`}>
                    <ChatBubble isResponse={false}>
                      {response.userQuery}
                    </ChatBubble>

                    <ApiResponse apiResponse={response} />
                  </div>
                );
              })}

              { /* Render loading dots while fetching api response */}
              {isResponseLoading ? (<>
                <ChatBubble isResponse={false}>
                  <p>{getValues("query")}</p>
                </ChatBubble>

                <div className="flex gap-4">
                  <OllieAvatar />
                  <ChatBubble isResponse={true}>
                    <span className="loading loading-dots loading-md"></span>
                  </ChatBubble>
                </div>
              </>) : ""}
            </>
          )}
        </div>
      </div>

      { /* input field with the submit button */}
      <form className="form-control shadow-2xl" onSubmit={handleSubmit((data) => getResponse(data))}>
        <div className="input-group">
          <input placeholder="Ask me a question" className="input w-full py-6 bg-white focus:outline-none" {...register("query")} style={{ "borderRadius": 0 }} />
          <button className="btn btn-square h-full bg-white border-none hover:bg-primary active:bg-primary-focus">
            <p>
              <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path id="Subtract" d="M0.655396 34L31.263 17L0.655396 0L4.89595 13.1308L21.2664 17L4.89595 21.2815L0.655396 34Z" fill="lightGrey" />
              </svg>
            </p>
          </button>
        </div>
      </form>
    </div >
  );
};

export default ChatComponent;