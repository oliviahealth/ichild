import json
import textwrap

import openai
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain.memory import ConversationBufferMemory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain.chains import ConversationalRetrievalChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler


# ---------------- Stream handler (unchanged) ----------------
class StreamCallbackHandler(StreamingStdOutCallbackHandler):
    def __init__(self, socketio_instance=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.socketio = socketio_instance

    def on_chain_start(self, serialized, prompts, **kwargs) -> None:
        if self.socketio:
            self.socketio.emit('stream_start')

    def on_llm_new_token(self, token, **kwargs) -> None:
        print(token, end='', flush=True)
        if self.socketio:
            self.socketio.emit('stream_data', token)

    def on_chain_end(self, response, **kwargs) -> None:
        if self.socketio:
            self.socketio.emit('stream_end')


def judge_context(query, context_docs):
    """
    True  -> context is sufficient
    False -> context is insufficient (should fetch extra context)
    """
    combined = "\n\n---\n\n".join(
        (getattr(d, "page_content", "") or "").strip()
            for d in (context_docs or [])
            if (getattr(d, "page_content", "") or "").strip()
    )

    system_msg = (
        "You are a careful judge. Determine if the provided context is enough "
        "to confidently and accurately answer the question. "
        'Respond ONLY with JSON: {"sufficient": true|false}'
    )
    user_msg = f"Question:\n{query}\n\nContext:\n{combined or '[empty]'}"

    resp = openai.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
    )

    content = resp.choices[0].message.content or "{}"

    try:
        data = json.loads(content)
        return bool(data.get("sufficient", False))
    except Exception:
        return False

def fetch_external_context(conversation_id, query):
    """
    Return extra context snippets (NOT a final answer).
    """
    system_msg = (
        "You are an information-gathering assistant. Given a user's question, "
        "provide concise additional context or key facts from general knowledge that could help answer the question "
        "more completely. Do NOT write the final answer—just provide extra factual context as bullet points or "
        "short paragraphs."
    )
    user_msg = (
        f"conversation_id: {conversation_id or 'new'}\n"
        f"Question: {query}\n\n"
    )

    try:
        resp = openai.chat.completions.create(
            model="gpt-4o",
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception:
        return ""

class ContextDecidingRetriever(BaseRetriever):
    """
    Wraps a base retriever. On each call:
      - fetch KB docs
      - judge sufficiency
      - if weak and external allowed, fetch extra context and append as a Document
      - return merged docs
    """

    base_retriever: BaseRetriever
    conversation_id: str = None
    allow_external: bool = True
    socket: any = None

    def _get_relevant_documents(self, query: str, *, run_manager = None):
        # 1) KB retrieval
        kb_docs = self.base_retriever.get_relevant_documents(query)

        # 2) Judge sufficiency (before answer composition)
        sufficient = judge_context(query, kb_docs)
        if sufficient or not self.allow_external:
            return kb_docs

        extra = (fetch_external_context( self.conversation_id, query) or "").strip()
        if extra:
            kb_docs.append(
                Document(
                    page_content=textwrap.dedent(
                        f"[EXTERNAL CONTEXT]\n{extra}").strip(),
                    metadata={"source": "external_context"},
                )
            )
        return kb_docs

    async def _aget_relevant_documents(self, query, *, run_manager = None):
        # Simple async wrapper around sync behavior
        return self._get_relevant_documents(query, run_manager=run_manager)

def build_conversational_retrieval_chain_with_memory( llm, retriever: BaseRetriever, conversation_id, connection_string, socket=None, allow_external: bool = True ):
    """
    Build a standard ConversationalRetrievalChain, but pass a retriever that
    decides (and augments) context before the chain composes the answer.
    """
    memory = ConversationBufferMemory(
        chat_memory=SQLChatMessageHistory(
            session_id=conversation_id, connection_string=connection_string),
        return_messages=True,
        memory_key="chat_history",
        output_key="answer",
    )

    if socket:
        llm.streaming = True
        llm.callbacks = [StreamCallbackHandler(socket)]

    deciding_retriever = ContextDecidingRetriever(
        base_retriever=retriever,
        conversation_id=conversation_id,
        allow_external=allow_external,
        socket=socket,
    )

    return ConversationalRetrievalChain.from_llm(
        llm=llm,
        memory=memory,
        retriever=deciding_retriever,
        condense_question_llm=llm,
        return_source_documents=True,
    )
