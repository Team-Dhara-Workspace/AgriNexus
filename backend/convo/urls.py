from django.urls import path
# pyrefly: ignore [missing-import]
from . import views

urlpatterns = [
    path('live-chat', views.live_chat, name='live_chat'),
    path('commodity-price', views.commodity_price_lookup, name='commodity_price_lookup'),
]
