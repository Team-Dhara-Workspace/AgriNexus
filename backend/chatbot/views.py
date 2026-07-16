import os
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from chatbot.services import EmbeddingManager,VectorStore,RAGRetriver
from chatbot.services import split_documents,process_all_Pdfs,ingest_pipeline

# pyrefly: ignore [missing-import]
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in .env file.")
# Create your views here.

# embedding_manager = EmbeddingManager()
# vector_store = VectorStore()
# retriver = RAGRetriver(vector_store=vector_store, embedding_manager=embedding_manager)

llm=ChatGroq(groq_api_key=groq_api_key,model_name="llama-3.1-8b-instant",temperature=0.1,max_tokens=1024)

def rag_retrive_context_llm(query,retriver,llm,top_k=3):

    results = retriver.retrieve(query,top_k=top_k)
    context = "\n\n".join([doc['content'] for doc in results]) if results else ""
    if not context:
        print("No Relevants Context Found to Answer the Question")
    
    prompt=f"""" Use the following context to the answer the query concisely 
    Context:{context}
    Query:{query}
    From this context , i want you to structure & tweak a respone in way based on the query. Don't add unnecessary information.
    """

    response = llm.invoke([prompt.format(context=context,query=query)])
    return response.content

def health(req):
    return HttpResponse("Chat Health Fine")

def chat(req):
    query = req.GET.get('query', '')
    top_k = int(req.GET.get('top_k', 2))
    print(query)
    try:
        # Get the retrieved docs (sources)
        results = retriver.retrieve(query, top_k=top_k)
        
        # Call the existing RAG answer generation function
        answer = rag_retrive_context_llm(query, retriver, llm, top_k=top_k)
            
        return JsonResponse({
            "query": query,
            "response": answer,
            # "sources": results
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise Exception(str(e))
    

def ingest(req):
    ingest_pipeline()
    return HttpResponse("Ingestion completed")
    
