from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "message": "Welcome to InsuTrack API",
        "status": "running",
        "available_endpoints": {
            "health": "/api/health/",
            "auth": "/api/auth/",
            "injections": "/api/",
            "admin": "/admin/",
        },
    })


def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "InsuTrack backend is running",
    })


urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/health/", health_check),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("injections.urls")),
]