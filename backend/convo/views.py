from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .services import ConversationalAI
import os

# Initialize the AI service once
try:
    ai_service = ConversationalAI()
except Exception as e:
    print(f"Failed to initialize ConversationalAI: {e}")
    ai_service = None

@csrf_exempt
def live_chat(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    if ai_service is None:
        return JsonResponse({'error': 'AI Service is not initialized'}, status=500)

    audio_file = request.FILES.get('audio')
    
    if not audio_file:
        return JsonResponse({'error': 'No audio file provided'}, status=400)

    try:
        # Save the uploaded audio temporarily
        temp_path = default_storage.save(f"temp_{audio_file.name}", ContentFile(audio_file.read()))
        full_temp_path = default_storage.path(temp_path)

        lang = request.GET.get('lang', 'en')
        
        # 1. Transcribe the audio
        transcription = ai_service.transcribe_audio(full_temp_path, lang)
        
        # Clean up the temp file
        if os.path.exists(full_temp_path):
            os.remove(full_temp_path)

        if not transcription:
            return JsonResponse({'error': 'Could not transcribe audio'}, status=500)
            
        user_text = transcription
        
        # 2. Generate conversational response (with RAG context if enabled)
        ai_response = ai_service.generate_response(user_text, lang)
        
        return JsonResponse({
            'success': True,
            'transcription': user_text,
            'response': ai_response
        })

    except Exception as e:
        print(f"Error in live_chat view: {e}")
        return JsonResponse({'error': str(e)}, status=500)
