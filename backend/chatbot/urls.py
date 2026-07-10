from os import name
from chatbot import views
from django.urls import path

urlpatterns = [
    path('health', views.health, name='health'),
    path('chat', views.chat, name='chat'),
    path('ingest', views.ingest, name='ingest')
]