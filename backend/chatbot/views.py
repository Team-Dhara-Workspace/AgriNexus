import os
import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from chatbot.models import ChatSession, ChatMessage
from chatbot.services import EmbeddingManager, VectorStore, RAGRetriver
from chatbot.services import split_documents, process_all_Pdfs, ingest_pipeline
# pyrefly: ignore [missing-import]
from langchain_groq import ChatGroq
from dotenv import load_dotenv
# from groq import Groq

#available models
''' openai/gpt-oss-20b
canopylabs/orpheus-arabic-saudi
qwen/qwen3.6-27b
allam-2-7b
whisper-large-v3
groq/compound-mini
whisper-large-v3-turbo
openai/gpt-oss-120b
openai/gpt-oss-safeguard-20b
canopylabs/orpheus-v1-english
meta-llama/llama-prompt-guard-2-22m
groq/compound
meta-llama/llama-prompt-guard-2-86m'''

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in .env file.")

# 1. Create Groq client
# client = Groq(api_key=groq_api_key)

# 2. Get all available models
# models = client.models.list()

# 3. Print model IDs
# print("Available Groq models:\n")
# for model in models.data:
#     print(model.id)


embedding_manager = EmbeddingManager()
vector_store = VectorStore()
retriver = RAGRetriver(vector_store=vector_store, embedding_manager=embedding_manager)

llm = ChatGroq(groq_api_key=groq_api_key, model_name="openai/gpt-oss-120b", temperature=0.1, max_tokens=1024)

def get_authenticated_user(request, data=None):
    if request.user.is_authenticated:
        return request.user
    user_id = None
    if data and isinstance(data, dict):
        user_id = data.get('user_id')
    if not user_id:
        user_id = request.GET.get('user_id') or request.headers.get('X-User-Id')
    if user_id:
        try:
            return User.objects.get(id=int(user_id))
        except (User.DoesNotExist, ValueError):
            return None
    return None

def rag_retrive_context_llm(query, retriver, llm, history_text="", top_k=3):
    results = retriver.retrieve(query, top_k=top_k)
    context = "\n\n".join([doc['content'] for doc in results]) if results else ""
    if not context:
        print("No Relevant Context Found to Answer the Question")
    
    prompt = f"""Use the following context and conversation history to answer the query concisely.

Context: {context}

Previous Conversation History:
{history_text if history_text else 'No previous context.'}

User Query: {query}

From this context and history, structure & tweak a response based on the query. Don't add unnecessary information. Keep it helpful and direct.
"""

    response = llm.invoke([prompt])
    return response.content

def health(req):
    return HttpResponse("Chat Health Fine")

@csrf_exempt
def list_sessions(request):
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({"success": False, "error": "Authentication required. Please log in to view chat sessions."}, status=401)
    
    sessions = ChatSession.objects.filter(user=user).values('id', 'title', 'created_at', 'updated_at')
    session_list = [
        {
            "id": str(s['id']),
            "title": s['title'],
            "created_at": s['created_at'].isoformat(),
            "updated_at": s['updated_at'].isoformat(),
        }
        for s in sessions
    ]
    return JsonResponse({"success": True, "sessions": session_list})

@csrf_exempt
def create_session(request):
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({"success": False, "error": "Authentication required. Please log in to create a chat session."}, status=401)
    
    session = ChatSession.objects.create(user=user, title="New Chat")
    return JsonResponse({
        "success": True,
        "session": {
            "id": str(session.id),
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
        }
    }, status=201)

@csrf_exempt
def get_session_messages(request, session_id):
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({"success": False, "error": "Authentication required. Please log in."}, status=401)
    
    try:
        session = ChatSession.objects.get(id=session_id, user=user)
    except ChatSession.DoesNotExist:
        return JsonResponse({"success": False, "error": "Chat session not found"}, status=404)
    
    msgs = session.messages.all().order_by('created_at')
    messages_data = [
        {
            "id": str(msg.id),
            "text": msg.text,
            "sender": msg.sender,
            "created_at": msg.created_at.isoformat()
        }
        for msg in msgs
    ]
    return JsonResponse({
        "success": True,
        "session_id": str(session.id),
        "title": session.title,
        "messages": messages_data
    })

@csrf_exempt
def delete_session(request, session_id):
    if request.method not in ['DELETE', 'POST']:
        return JsonResponse({"success": False, "error": "Method not allowed"}, status=405)
        
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({"success": False, "error": "Authentication required. Please log in."}, status=401)
    
    try:
        session = ChatSession.objects.get(id=session_id, user=user)
        session.delete()
        return JsonResponse({"success": True, "message": "Session deleted successfully"})
    except ChatSession.DoesNotExist:
        return JsonResponse({"success": False, "error": "Chat session not found"}, status=404)

@csrf_exempt
def chat(request):
    data = {}
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}
    
    user = get_authenticated_user(request, data)
    if not user:
        return JsonResponse({"success": False, "error": "Authentication required. Please log in to chat."}, status=401)

    query = data.get('query') or request.GET.get('query', '')
    session_id = data.get('session_id') or request.GET.get('session_id')
    top_k = int(data.get('top_k') or request.GET.get('top_k', 2))

    if not query or not query.strip():
        return JsonResponse({"success": False, "error": "Query cannot be empty"}, status=400)

    query = query.strip()

    # Find or create session
    session = None
    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id, user=user)
        except ChatSession.DoesNotExist:
            session = None

    if not session:
        # Create new session if no valid session_id passed
        title_summary = query[:30] + "..." if len(query) > 30 else query
        session = ChatSession.objects.create(user=user, title=title_summary)
    elif session.title == "New Chat":
        session.title = query[:30] + "..." if len(query) > 30 else query
        session.save()

    # Save user message to database
    user_msg = ChatMessage.objects.create(session=session, sender='user', text=query)

    try:
        # Fetch previous conversation history for LLM context (last 6 messages prior to current query)
        past_msgs = session.messages.exclude(id=user_msg.id).order_by('-created_at')[:6]
        past_msgs = reversed(list(past_msgs))
        history_lines = [f"{m.sender.upper()}: {m.text}" for m in past_msgs]
        history_text = "\n".join(history_lines)

        # Call RAG answer generation function with context and history
        answer = rag_retrive_context_llm(query, retriver, llm, history_text=history_text, top_k=top_k)
        processed_answer = answer.strip() if answer else "No response generated."

        # Save bot message to database
        bot_msg = ChatMessage.objects.create(session=session, sender='bot', text=processed_answer)
        session.save() # update session updated_at timestamp

        return JsonResponse({
            "success": True,
            "session_id": str(session.id),
            "session_title": session.title,
            "query": query,
            "response": processed_answer,
            "message_id": str(bot_msg.id)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# voice chat code
@csrf_exempt
def voice_chat(request):
    user = get_authenticated_user(request)
    if not user:
        return JsonResponse({"success": False, "error": "Authentication required. Please log in to voice chat."}, status=401)

    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "POST required"}, status=405)

    audio_file = request.FILES.get('audio')
    session_id = request.POST.get('session_id')
    
    # Try to safely parse top_k
    try:
        top_k = int(request.POST.get('top_k', 2))
    except ValueError:
        top_k = 2

    if not audio_file:
        return JsonResponse({"success": False, "error": "No audio file provided"}, status=400)

    try:
        from groq import Groq
        client = Groq(api_key=groq_api_key)
        
        # Whisper requires a filename ending with the format. We'll assume .m4a as it's common for Expo AV
        transcription = client.audio.transcriptions.create(
            file=("audio.m4a", audio_file.read()),
            model="whisper-large-v3-turbo"
        )
        query = transcription.text.strip()
        
        if not query:
            return JsonResponse({"success": False, "error": "Could not transcribe audio (empty result)"}, status=400)
            
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
            except ChatSession.DoesNotExist:
                session = None

        if not session:
            title_summary = query[:30] + "..." if len(query) > 30 else query
            session = ChatSession.objects.create(user=user, title=title_summary)
        elif session.title == "New Chat":
            session.title = query[:30] + "..." if len(query) > 30 else query
            session.save()

        user_msg = ChatMessage.objects.create(session=session, sender='user', text=query)

        past_msgs = session.messages.exclude(id=user_msg.id).order_by('-created_at')[:6]
        past_msgs = reversed(list(past_msgs))
        history_lines = [f"{m.sender.upper()}: {m.text}" for m in past_msgs]
        history_text = "\n".join(history_lines)

        answer = rag_retrive_context_llm(query, retriver, llm, history_text=history_text, top_k=top_k)
        processed_answer = answer.strip() if answer else "No response generated."

        bot_msg = ChatMessage.objects.create(session=session, sender='bot', text=processed_answer)
        session.save() 

        return JsonResponse({
            "success": True,
            "session_id": str(session.id),
            "session_title": session.title,
            "query": query,
            "response": processed_answer,
            "message_id": str(bot_msg.id)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)

# end of voice chat code 

def ingest(req):
    ingest_pipeline()
    return HttpResponse("Ingestion completed")
