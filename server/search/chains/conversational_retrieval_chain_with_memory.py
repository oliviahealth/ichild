from langchain.memory import ConversationBufferMemory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain.chains import ConversationalRetrievalChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

class StreamCallbackHandler(StreamingStdOutCallbackHandler):
    '''
    Defining a custom callback handler which will stream the LLM thoughts in real-time to the fronted via a websocket connection
    Need to override on_chain_start, on_llm_new_token and on_chain_end methods of base StreamingStdOutCallbackHandler
    '''
    def __init__(self, socketio_instance, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.socketio = socketio_instance

    def on_chain_start(self, serialized, prompts, **kwargs) -> None:
        self.socketio.emit('stream_start')
        
    def on_llm_new_token(self, token, **kwargs) -> None:
        # Implement here your streaming logic
        print(token, end='', flush=True)
        self.socketio.emit('stream_data', token)

    def on_chain_end(self, response, **kwargs) -> None:
        self.socketio.emit('stream_end')

def build_conversational_retrieval_chain_with_memory(llm, retriever, conversation_id, connection_string, socket=None):
    # Memory is stored and sourced from SQL
    # All messages (Human and AI) are stored in the message_store table and are linked together via the session_id
    # To continue an existing conversation, pass in an existing session_id
    # To create a new conversation, pass in a new session_id
    # Need to pass in a socket instance for streaming
    memory = ConversationBufferMemory(
        chat_memory=SQLChatMessageHistory(session_id=conversation_id, connection_string=connection_string),
        return_messages=True,
        memory_key="chat_history",
        output_key="answer"
    )

    if(socket):
        # StreamCallbackHandler used to stream LLM thoughts to frontend in real-time
        llm.streaming = True
        llm.callbacks = [StreamCallbackHandler(socket)]

    return ConversationalRetrievalChain.from_llm(
        llm=llm,
        memory=memory,
        retriever=retriever,
        condense_question_llm=llm,
        return_source_documents=True
    )