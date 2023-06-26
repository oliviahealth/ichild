import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "react-query";
import { useForm } from "react-hook-form";
import axios from "axios";
import { IOllieResponse } from "../../utils/interfaces";

import OllieResponse from "./OllieResponse";
import ChatBubble from ".././Chat/ChatBubble";


const ChatComponent: React.FC = () => {
  const [responses, setResponses] = useState<IOllieResponse[]>([]);

  // Using react-hook-form to manage the state of the input field
  // https://www.react-hook-form.com/
  const { register, handleSubmit, reset, getValues } = useForm();

  // Creates the auto scroll when ollie responds
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the container with smooth animation
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [responses]);

  // Call the backend with the user entered query to get a response
  // https://tanstack.com/query/v4/docs/react/guides/mutations
  const getResponseMutation = useMutation(async (data: any) => {
    const formData = new FormData();
    formData.append("data", data.query);

    const response = (await axios.post("http://localhost:5000/results", formData, { headers: { "Content-Type": "multipart/form-data" } })).data

    console.log(response);

    setResponses([...responses, { question: data.query, answer: response }])

    // reset the value of the input field
    reset();
  })

  return (
    <div className="flex flex-col h-full bg-opacity-80 bg-gray-100 ">
      <div className="h-full p-4 flex flex-col justify-end overflow-hidden">
        <div ref={containerRef} className="overflow-y-auto max-h-[calc(100vh-15rem)] ">
          <ChatBubble text="Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?" isResponse={true} />
          {responses.map((query, index) => {
            return (
              <div key={`${index} - question`}>
                <ChatBubble text={query.question} isResponse={false} />
                <OllieResponse response={query} />
              </div>
            );
          })}


          { /* Render loading dots while fetching ollie response */}
          {getResponseMutation.isLoading ? (<>
            <ChatBubble text={getValues("query")} isResponse={false} />
            <ChatBubble text={<span className="loading loading-dots loading-md"></span>} isResponse={true} />
          </>) : ""}

        </div>
      </div>

      { /* input field with the submit button */}
      <form className="form-control" onSubmit={handleSubmit((data) => getResponseMutation.mutate(data))}>
        <div className="input-group">
          <input placeholder="Ask me a question" className="input w-full bg-white" {...register("query")} style={{ "borderRadius": 0 }} />
          <button className="btn btn-square bg-white border-none hover:bg-primary active:bg-primary-focus" style={{ "borderRadius": 0 }}>
            <p>
              <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path id="Subtract" d="M0.655396 34L31.263 17L0.655396 0L4.89595 13.1308L21.2664 17L4.89595 21.2815L0.655396 34Z" fill="lightGrey" />
              </svg>
            </p>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
