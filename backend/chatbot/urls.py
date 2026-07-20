from chatbot import views
from django.urls import path

urlpatterns = [
    path('health', views.health, name='health'),
    path('chat', views.chat, name='chat'),
    path('ingest', views.ingest, name='ingest'),
    path('sessions', views.list_sessions, name='list_sessions'),
    path('sessions/create', views.create_session, name='create_session'),
    path('sessions/<int:session_id>/messages', views.get_session_messages, name='get_session_messages'),
    path('sessions/<int:session_id>/delete', views.delete_session, name='delete_session'),
]