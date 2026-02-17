from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task
from .serializers import TaskSerializer, TaskUpdateSerializer

class TaskSerializerTests(APITestCase):
	def test_task_serializer_valid_payload(self):
		payload = {
			"title": "Dummy title",
			"description": "Dummy description",
			"status": "in_progress",
			"due_date_time": timezone.now().isoformat(),
		}

		serializer = TaskSerializer(data=payload)
		self.assertTrue(serializer.is_valid(), serializer.errors)

	def test_task_serializer_missing_required_fields(self):
		payload = {"description": "Only description"}

		serializer = TaskSerializer(data=payload)
		self.assertFalse(serializer.is_valid())
		self.assertIn("title", serializer.errors)
		self.assertIn("status", serializer.errors)
		self.assertIn("due_date_time", serializer.errors)

	def test_task_serializer_invalid_status(self):
		payload = {
			"title": "Task with invalid status",
			"description": "This task has an invalid status",
			"status": "invalid_status",
			"due_date_time": timezone.now().isoformat(),
		}

		serializer = TaskSerializer(data=payload)
		self.assertFalse(serializer.is_valid())
		self.assertIn("status", serializer.errors)

	def test_task_update_serializer_read_only_fields(self):
		task = Task.objects.create(
			title="Original",
			description="Original description",
			status="not_started",
			due_date_time=timezone.now(),
		)
		payload = {
			"title": "Changed",
			"description": "Changed description",
			"status": "completed",
			"due_date_time": timezone.now().isoformat(),
		}

		serializer = TaskUpdateSerializer(task, data=payload, partial=True)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		updated = serializer.save()

		self.assertEqual(updated.status, "completed")
		self.assertEqual(updated.title, "Original")
		self.assertEqual(updated.description, "Original description")


class TaskApiTests(APITestCase):
	def setUp(self):
		self.list_url = reverse("tasks-list")
		self.task = Task.objects.create(
			title="Initial",
			description="Initial description",
			status="not_started",
			due_date_time=timezone.now(),
		)
		self.detail_url = reverse("tasks-detail", args=[self.task.id])

	def test_list_tasks(self):
		response = self.client.get(self.list_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)

	def test_create_task_success(self):
		payload = {
			"title": "New task",
			"description": "Some description",
			"status": "in_progress",
			"due_date_time": timezone.now().isoformat(),
		}

		response = self.client.post(self.list_url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Task.objects.count(), 2)

	def test_create_task_missing_required_fields(self):
		response = self.client.post(
			self.list_url, {"description": "Only description"}, format="json"
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("title", response.data)
		self.assertIn("status", response.data)
		self.assertIn("due_date_time", response.data)

	def test_create_task_invalid_status(self):
		payload = {
			"title": "Bad status",
			"description": "Invalid status",
			"status": "invalid",
			"due_date_time": timezone.now().isoformat(),
		}

		response = self.client.post(self.list_url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("status", response.data)

	def test_retrieve_task(self):
		response = self.client.get(self.detail_url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(str(response.data["id"]), str(self.task.id))

	def test_partial_update_status_only(self):
		payload = {
			"title": "Should not change",
			"description": "Should not change",
			"status": "completed",
		}

		response = self.client.patch(self.detail_url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.task.refresh_from_db()
		self.assertEqual(self.task.status, "completed")
		self.assertEqual(self.task.title, "Initial")
		self.assertEqual(self.task.description, "Initial description")

	def test_update_with_invalid_status(self):
		response = self.client.patch(
			self.detail_url, {"status": "invalid"}, format="json"
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("status", response.data)

	def test_delete_task(self):
		response = self.client.delete(self.detail_url)

		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertEqual(Task.objects.count(), 0)
