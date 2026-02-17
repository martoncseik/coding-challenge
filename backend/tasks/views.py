from django.shortcuts import render
from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer, TaskUpdateSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer