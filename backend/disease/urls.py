from django.urls import path
from disease import views

urlpatterns = [
    path("health", views.health, name="health"),
    path("health/", views.health, name="health_slash"),
    path("pest", views.pestDisease, name="pest"),
    path("pest/", views.pestDisease, name="pest_slash"),
]
