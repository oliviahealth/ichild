import React, { FormEvent, useState, useRef, useEffect } from "react";
import axios from "axios";

import { MdArrowForwardIos } from "react-icons/md";
import { IOllieResponse } from "../utils/interfaces";

import Ollie from "../assets/ollie.png";
import ChatBubble from "./Chat/ChatBubble";

interface OllieResponseProps {
  response: IOllieResponse;
}
const OllieResponse: React.FC<OllieResponseProps> = ({ response }) => {
  return (
    <>
      <div className={`chat w-full chat-start `}>
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img src={Ollie} />
          </div>
        </div>
        <p className={`chat-bubble whitespace-pre-wrap bg-primary`}>
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
      </div>
    </>
  );
};

const ChatComponent: React.FC = () => {
  const containerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState<IOllieResponse[]>([]);

  useEffect(() => {
    // Scroll to the bottom of the container with smooth animation
    //@ts-ignore
    containerRef.current.scrollTo({
      //@ts-ignore
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [responses]);

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(evt.target.value);
  };

  const handleFormSubmit = async (evt: FormEvent) => {
    evt.preventDefault();

    await getResponse(query);
  };

  const getResponse = async (query: string) => {
    const formData = new FormData();
    formData.append("data", query);

    await axios.post("http://localhost:5000/results", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((response) => {
      console.log(response.data);
      setResponses([...responses, { question: query, answer: response.data }]);

      setQuery("");
    });

    console.log(responses);
  };

  return (
    <div className="flex flex-col h-full opacity-80 bg-gray-100 rounded-b-lg">
      <div className="h-full p-4 flex flex-col justify-end overflow-hidden">
        <div ref={containerRef} className="overflow-y-auto max-h-[calc(100vh-18rem)]">
          <ChatBubble text="Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?" isResponse={true} />
          {responses.map((query, index) => {
            const locationsArray = query.answer.names.map((name, index) => ({
              location: name,
              description: query.answer.descriptions[index],
              address: query.answer.address[index + 1],
              phone: query.answer.phone[index],
            }));

            const formattedLocationsArray = locationsArray.map((location) => `${location.location}\n${location.phone}\n`);

            return (
              <>
                <ChatBubble key={`${index} - question`} text={query.question} isResponse={false} />
                <OllieResponse response={query} />
              </>
            );
          })}
        </div>
      </div>
      <form className="form-control" onSubmit={handleFormSubmit}>
        <div className="input-group">
          <input value={query} type="text" placeholder="Search…" className="input w-full bg-white" onChange={handleInputChange} />
          <button className="btn btn-square bg-primary border-none hover:bg-primary active:bg-primary-focus ">
            <p>
              <MdArrowForwardIos className="text-3xl" />
            </p>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;

/*
<ChatBubble text="Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?" isResponse={true} />
        {queries.map((query, index) => {
          const locationsArray = query.answer.names.map((name, index) => ({
            location: name,
            description: query.answer.descriptions[index],
            address: query.answer.address[index + 1],
            phone: query.answer.phone[index],
          }));

          const formattedLocationsArray = locationsArray.map((location) => `${location.location}\n${location.phone}\n`);

          return (
            <>
              <ChatBubble key={`${index} - question`} text={query.question} isResponse={false} />
              <ChatBubble
                key={`${index} - question`}
                text={`I've found ${locationsArray.length} possible matches for you, hover over a facility name for a description:\n\n${formattedLocationsArray.reduce(
                  (accr, curr) => `${accr}\n${curr}`
                )}`}
                isResponse={true}
              />
            </>
          );
        })}
*/
