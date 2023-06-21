import React, { FormEvent, useState } from "react";
import axios from "axios";

import { MdArrowForwardIos } from "react-icons/md";
import { IQuery } from "../utils/interfaces";
import Ollie from "../assets/ollie.png";

interface ChatProps {
  text: string;
  isResponse: boolean;
}
const ChatBubble: React.FC<ChatProps> = ({ text, isResponse }) => {
  return (
    <div className={`chat w-full ${isResponse ? "chat-start" : "chat-end"} `}>
      <div className="chat-image avatar">
        <div className="w-14 rounded-full">
          <img src={Ollie} className={`${!isResponse ? "hidden" : ""}`} />
          <img className={`${isResponse ? "hidden" : ""}`} src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541" />
        </div>
      </div>
      <p className={`chat-bubble ${isResponse ? "bg-primary" : "bg-gray-500"} text-white`}>{text}</p>
    </div>
  );
};

const ChatComponent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [queries, setQueries] = useState<IQuery[]>([]);

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
      setQueries([...queries, { question: query, answer: response.data }]);

      setQuery("");
    });

    console.log(queries);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 opacity-80 rounded-b-lg">
      <div className="h-full p-4">
        <ChatBubble text="Hi! I’m Ollie, your virtual assistant for the OliviaHealth network. How can I help you?" isResponse={true} />
        {queries.map((query, index) => (
          <>
            <ChatBubble key={`${index} - question`} text={query.question} isResponse={false} />
            <ChatBubble key={`${index} - question`} text={`I've found ${query.answer.names.length} possible matches for you, hover over a facility name for a description:`} isResponse={true} />
          </>
        ))}
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
