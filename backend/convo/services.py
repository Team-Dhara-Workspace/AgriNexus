import os
from groq import Groq
from chatbot.services import RAGRetriver, VectorStore, EmbeddingManager

class ConversationalAI:
    def __init__(self):
        # We assume GROQ_API_KEY is in the environment
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        if not self.groq_api_key:
            print("WARNING: GROQ_API_KEY not found in environment")
            
        self.client = Groq(api_key=self.groq_api_key)
        
        # Initialize RAG components
        try:
            self.embedding_manager = EmbeddingManager()
            self.vector_store = VectorStore()
            self.rag_retriever = RAGRetriver(self.vector_store, self.embedding_manager)
            self.rag_enabled = True
            print("RAG components initialized for Conversational Mode")
        except Exception as e:
            print(f"Failed to initialize RAG for Conversational Mode: {e}")
            self.rag_enabled = False

    def transcribe_audio(self, audio_file_path, lang="en"):
        """
        Uses Groq's whisper-large-v3-turbo model for lightning fast STT.
        """
        try:
            with open(audio_file_path, "rb") as file:
                transcription = self.client.audio.transcriptions.create(
                    file=(os.path.basename(audio_file_path), file.read()),
                    model="whisper-large-v3-turbo",
                    prompt="The user is asking about agriculture, crops, diseases, or farming.",
                    response_format="text",
                    language=lang if lang in ['en', 'ta', 'te', 'hi'] else "en",
                )
            return transcription
        except Exception as e:
            print(f"Error during transcription: {e}")
            return None

    def generate_response(self, user_text, lang="en"):
        """
        Retrieves context via RAG and generates a concise conversational response in the requested language.
        """
        context = ""
        if self.rag_enabled:
            # Retrieve top 3 relevant documents
            retrieved_docs = self.rag_retriever.retrieve(query=user_text, top_k=3, score_threshold=0.4)
            if retrieved_docs:
                context = "\n\nRelevant Information from Knowledge Base:\n"
                for doc in retrieved_docs:
                    context += f"- {doc['content']}\n"
                    
        system_prompt = (
            "You are an AI on a live voice call with a farmer or agricultural worker. "
            "Your name is AgriNexus. "
            "Keep your responses extremely concise, conversational, and natural. "
            "DO NOT use markdown formatting like asterisks or bold text, because your response will be read aloud by a text-to-speech engine. "
            "Do not exceed 2 to 3 short sentences. Get straight to the point."
        )
        
        # Enforce language
        lang_map = {'en': 'English', 'ta': 'Tamil', 'te': 'Telugu', 'hi': 'Hindi'}
        target_lang = lang_map.get(lang, 'English')
        system_prompt += f"\n\nCRITICAL INSTRUCTION: You are fully capable of speaking {target_lang}. You MUST reply exclusively in {target_lang}. Do not apologize. Do not reply in English."
        
        if context:
            system_prompt += f"\n\nUse the following context to help answer the user if relevant. {context}"

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_text,
                    }
                ],
                model="groq/compound",
                temperature=0.5,
                max_tokens=256,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error during LLM generation: {e}")
            return "I'm sorry, I'm having trouble connecting right now."
