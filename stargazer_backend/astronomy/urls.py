from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StarViewSet, ConstellationViewSet

router = DefaultRouter()
router.register(r'stars', StarViewSet)
router.register(r'constellations', ConstellationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]