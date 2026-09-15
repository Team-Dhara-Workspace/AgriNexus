from django.urls import path
from . import views

urlpatterns = [
    path('live-chat', views.live_chat, name='live_chat'),
]
