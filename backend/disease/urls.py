from django.urls import path
from disease import views

urlpatterns = [
    path("health", views.health, name="health"),
    path("path", views.pestDisease, name="pest"),
]