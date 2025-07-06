from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaskViewSet,
    CategoryViewSet,
    ContextEntryViewSet,
    AISuggestionView,
)

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"categories", CategoryViewSet)
router.register(r"context", ContextEntryViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("ai/suggestions/", AISuggestionView.as_view(), name="ai-suggestions"),
]
