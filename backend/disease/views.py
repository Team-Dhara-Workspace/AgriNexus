from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def health(req):
    return HttpResponse("Disease Health is Working Fine")