import { useRef, useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import useAppStore from "../../stores/useAppStore";
import parseWithZod from "../../utils/parseWithZod";
import { APIResponseSchema, ConversationSchema, IAPIResponse, IConversation } from "../../utils/interfaces";

import { FaAngleRight } from "react-icons/fa6";

import OllieAvatar from "./OllieAvatar";
import ChatBubble from "./ChatBubble";
import ChatLoadingSkeleton from "./ChatLoadingSkeleton";
import ApiResponse from "./ApiResponse";
import quickResponses from "../../utils/quickResponses";

const ChatComponent = () => {
  const navigate = useNavigate();
  const setError = useAppStore(state => state.setError);

  /*
    Use Zustand to manage global state for the application
    https://github.com/pmndrs/zustand
  */
  const user = useAppStore((state) => state.user);
  const accessToken = useAppStore((state) => state.accessToken);

  const socket = useAppStore(state => state.socket);

  const isSidePanelOpen = useAppStore(state => state.isSidePanelOpen);

  // When the user submits a query, this will hold what they asked temporarily
  const [submittedQuery, setSubmittedQuery] = useState<null | string>(null);

  // The actual response from the api including the locations the api suggests
  const [apiResponses, setApiResponses] = useState<IAPIResponse[]>([]);

  // Conversation previews are an array of past conversations that the user has had, but only with the id and the title for each past conversation
  // We use the id to fetch the complete past conversation object when the user focuses on one of them
  const ConversationPreviews = useAppStore((state) => state.conversationPreviews);
  const setConversationPreviews = useAppStore((state) => state.setConversationPreviews);

  // Update the currentConversation object inside the app store whenever the user asks a question and gets a response
  const currentConversationId = useAppStore((state) => state.currentConversationId);
  const setCurrentConversationId = useAppStore((state) => state.setCurrentConversationId);

  const [temporaryMessage, setTemporaryMessage] = useState<null | string>(null);

  // Using react-hook-form to manage the state of the input field
  // https://www.react-hook-form.com/
  const { register, handleSubmit, reset, setValue } = useForm();

  // Creates the auto scroll when the api responds
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the container with smooth animation
  useEffect(() => {
    if(isSidePanelOpen) return;
    
    const elems = containerRef.current?.querySelectorAll("[data-is-scroll-target]");
    if (elems && elems.length > 0) {
      const elem = elems[elems.length - 1];
      elem.scrollIntoView({
        behavior: "smooth"
      });
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
    const headers = {
      "Authorization": "Bearer " + accessToken,
      "userId": user?.id,
    }

    const conversationDetails: IConversation = await axios.get(`${import.meta.env.VITE_API_URL}/conversation?id=${currentConversationId}`, { headers: { ...headers }, withCredentials: true })
      .then((res) => {
        parseWithZod(res.data, ConversationSchema);

        return res.data
      })
      .catch(() => null)

    return conversationDetails
  }, {
    onSuccess: (conversationDetails) => {
      if (conversationDetails) {
        setApiResponses(conversationDetails.responses);
      }
    }
  });

  useEffect(() => {
    setApiResponses([])

    if (currentConversationId) {
      getConversationDetails()
    }
  }, [currentConversationId]);


  useEffect(() => {
    socket.on("stream_data", (data) => {
      setTemporaryMessage((prev) => {
        if (prev === null) {
          return data
        }

        return prev + data;
      });
    });

    socket.on('stream_start', () => {
      setTemporaryMessage('');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Call the backend with the user entered query to get a response
  // https://tanstack.com/query/v4/docs/react/guides/mutations
  const { mutate: getResponse, isLoading: isResponseLoading } = useMutation(async (data: { query: string }) => {
    if (data.query === "") return
    if (!currentConversationId) return;

    const formData = new FormData();
    formData.append("data", data.query);
    formData.append("conversationId", currentConversationId);

    const headers = {
      "Authorization": "Bearer " + accessToken,
      "userId": user?.id,
    }

    const response: IAPIResponse = (await axios.post(`${import.meta.env.VITE_API_URL}/formattedresults`, formData, { headers: { ...headers }, withCredentials: true })).data;

    // setCurrentConversationId(response.conversationId);

    const conversation: IConversation = (await axios.post(`${import.meta.env.VITE_API_URL}/conversations`, { id: response.conversationId, title: response.userQuery }, { headers: { ...headers }, withCredentials: true })).data;
    await axios.post(`${import.meta.env.VITE_API_URL}/response`, { ...response, conversationId: conversation.id }, { headers: { ...headers }, withCredentials: true });

    // If this is a new conversation, add it to the recent activity on the sidepanel
    if (apiResponses.length < 1) {
      setConversationPreviews([{ id: conversation.id ?? uuid(), title: response.userQuery }, ...ConversationPreviews])
    }

    // Parse the response and make sure it complies with the expected API Response
    parseWithZod(response, APIResponseSchema);

    return response
  }, {
    onSuccess: async (response) => {
      if (response) {
        setApiResponses([...apiResponses, response]);
        setTemporaryMessage(null);
      }

      reset();
    },
    onError: (error: AxiosError) => {
      setError(error.message);

      if (error.request.status === 403) {
        navigate('/signin');
      }
    },
    onSettled: () => {
      setSubmittedQuery(null);
    }
  });

  const handleQuickResponse = (query: string) => {
    setValue("query", query);
    setSubmittedQuery(query);

    reset();

    handleSubmit(() => getResponse({ query }))();
  }

  return (
    <div className="flex w-full flex-col h-full">
      <div className={`h-full p-4 flex flex-col ${!isLoading ? 'justify-end' : 'justify-start'}`}>
        <div ref={containerRef} className="overflow-y-auto max-h-[calc(100vh-16rem)]">

          {isLoading ? (<ChatLoadingSkeleton />) : (
            <>
              { /* Initial greeting */}
              <div className="xl:flex gap-4">
                <div>
                  <OllieAvatar />
                </div>

                <div>
                  <ChatBubble isResponse={true}>
                    <p>Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?</p>
                  </ChatBubble>

                  <ChatBubble isResponse={true}>
                    <p className="font-bold pb-4 text-xl">Quick Responses</p>

                    <div className="space-y-3 text-base pb-3">
                      {quickResponses.map((quickResponse, index) => (
                        <div key={index} className="flex justify-between items-center space-x-5 text-primary cursor-pointer" onClick={() => handleQuickResponse(quickResponse)}>
                          <p>{quickResponse}</p>
                          <FaAngleRight className='text-gray-300' />
                        </div>
                      ))}
                    </div>

                  </ChatBubble>
                </div>
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
                  <p>{submittedQuery}</p>
                </ChatBubble>

                <div className="flex gap-4">
                  <OllieAvatar />
                  {temporaryMessage == null ? (<ChatBubble isResponse={true} isScrollTarget={true}>
                    <span className="loading loading-dots loading-md"></span>
                  </ChatBubble>) : (<ChatBubble isResponse={true} isScrollTarget={true}>
                    {temporaryMessage}
                  </ChatBubble>)}
                </div>
              </>) : ""}


            </>
          )}
        </div>
      </div>

      { /* input field with the submit button */}
      <form className="form-control mb-8" onSubmit={handleSubmit((data) => handleQuickResponse(data.query))}>
        <div className="input-group flex self-center w-[90%] rounded-box shadow-2xl group opacity-80 scale-100 focus-within:opacity-100 focus-within:scale-101 transition-all duration-300 text-lightgrey focus-within:text-primary">
          <input placeholder="Ask me a question" className="input w-full py-6 bg-white focus:outline-none border-none rounded-box rounded-r-none text-black" {...register("query")} />
          <button className="btn btn-square h-full bg-white border-none hover:bg-primary active:bg-primary-focus rounded-box rounded-l-none hover:text-white">
            <p>
              <svg width="24" height="26" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path id="Subtract" d="M0.655396 34L31.263 17L0.655396 0L4.89595 13.1308L21.2664 17L4.89595 21.2815L0.655396 34Z" className="fill-current" />
              </svg>
            </p>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;