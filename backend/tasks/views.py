from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from collections import Counter
from django.db.models import F

from .models import Task, Category, ContextEntry
from .serializers import (
    TaskSerializer,
    CategorySerializer,
    ContextEntrySerializer,
    TaskImportSerializer,
)
from ai_pipeline.service import get_ai_suggestions

# Create your views here.


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(
        detail=False,
        methods=["post"],
        url_path="import",
        serializer_class=TaskImportSerializer,
    )
    def bulk_import(self, request, *args, **kwargs):
        """
        Handles bulk import of tasks from a JSON payload (parsed from CSV).
        This action is available at /api/tasks/import/ via POST.
        """
        serializer = self.get_serializer(
            data=request.data, many=True, allow_empty=False
        )
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        tasks_to_create = [
            Task(**{k: v for k, v in item.items() if k != "categories"})
            for item in validated_data
        ]
        created_tasks = Task.objects.bulk_create(tasks_to_create)

        all_category_names = [
            name.strip().lower()
            for item in validated_data
            for name in item.get("categories", "").split(",")
            if name.strip()
        ]

        if not all_category_names:
            return Response(
                {
                    "message": f"Successfully imported {len(created_tasks)} tasks with no categories."
                },
                status=status.HTTP_201_CREATED,
            )

        existing_categories = {
            cat.name: cat
            for cat in Category.objects.filter(name__in=set(all_category_names))
        }
        new_category_names = set(all_category_names) - set(existing_categories.keys())

        newly_created_cats = Category.objects.bulk_create(
            [Category(name=name) for name in new_category_names]
        )
        for cat in newly_created_cats:
            existing_categories[cat.name] = cat

        ThroughModel = Task.categories.through
        relations_to_create = []
        for i, task in enumerate(created_tasks):
            category_str = validated_data[i].get("categories", "")
            if category_str:
                task_cat_names = [
                    name.strip().lower()
                    for name in category_str.split(",")
                    if name.strip()
                ]
                for name in task_cat_names:
                    if name in existing_categories:
                        relations_to_create.append(
                            ThroughModel(
                                task_id=task.id,
                                category_id=existing_categories[name].id,
                            )
                        )

        if relations_to_create:
            ThroughModel.objects.bulk_create(relations_to_create, ignore_conflicts=True)

        category_counts = Counter(all_category_names)
        for name, count in category_counts.items():
            Category.objects.filter(name=name).update(
                usage_count=F("usage_count") + count
            )

        return Response(
            {"message": f"Successfully imported {len(created_tasks)} tasks."},
            status=status.HTTP_201_CREATED,
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ContextEntryViewSet(viewsets.ModelViewSet):
    queryset = ContextEntry.objects.all()
    serializer_class = ContextEntrySerializer


class AISuggestionView(APIView):
    """
    An API view to get AI-powered suggestions for a new or existing task.
    """

    def post(self, request, *args, **kwargs):
        title = request.data.get("title", "")
        description = request.data.get("description", "")

        if not title:
            return Response(
                {"error": "Task title is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch the last 5 context entries.
        latest_context = ContextEntry.objects.order_by("-timestamp")[:5]

        # Calculate the user's current workload.
        active_task_count = Task.objects.filter(
            status__in=["TODO", "IN_PROGRESS"]
        ).count()

        suggestions = get_ai_suggestions(
            task_title=title,
            task_description=description,
            context_entries=latest_context,
            active_task_count=active_task_count,
        )

        if "error" in suggestions:
            return Response(suggestions, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(suggestions, status=status.HTTP_200_OK)
