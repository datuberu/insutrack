from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import InjectionLog, MealReminder


class InjectionApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="datu",
            password="testpass123",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            password="testpass123",
        )

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def iso_datetime(self, value):
        return value.isoformat()

    def create_injection(
        self,
        user=None,
        insulin_type="RAPID_ACTING",
        dose_units=8,
        injected_at=None,
        recorded_by_name="Datu",
        duplicate_risk_flag=False,
        override_reason="",
    ):
        return InjectionLog.objects.create(
            user=user or self.user,
            insulin_type=insulin_type,
            dose_units=dose_units,
            injected_at=injected_at or timezone.now(),
            recorded_by_name=recorded_by_name,
            duplicate_risk_flag=duplicate_risk_flag,
            override_reason=override_reason,
        )

    def get_response_items(self, response):
        if isinstance(response.data, dict) and "results" in response.data:
            return response.data["results"]

        return response.data

    def test_injection_list_requires_login(self):
        response = self.client.get(reverse("injection-list-create"))

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_user_only_sees_their_own_injection_logs(self):
        own_log = self.create_injection(
            user=self.user,
            insulin_type="RAPID_ACTING",
            dose_units=8,
        )

        other_log = self.create_injection(
            user=self.other_user,
            insulin_type="LONG_ACTING",
            dose_units=14,
        )

        self.authenticate()

        response = self.client.get(reverse("injection-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        logs = self.get_response_items(response)
        returned_ids = [item["id"] for item in logs]

        self.assertIn(own_log.id, returned_ids)
        self.assertNotIn(other_log.id, returned_ids)

    def test_precheck_returns_safe_when_no_recent_matching_log_exists(self):
        self.authenticate()

        response = self.client.post(
            reverse("precheck"),
            {
                "insulin_type": "RAPID_ACTING",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "safe")
        self.assertIsNone(response.data["last_injection"])
        self.assertIsNone(response.data["time_since_last_minutes"])

    def test_precheck_returns_caution_when_recent_matching_log_exists(self):
        recent_log = self.create_injection(
            insulin_type="RAPID_ACTING",
            injected_at=timezone.now() - timedelta(minutes=30),
        )

        self.authenticate()

        response = self.client.post(
            reverse("precheck"),
            {
                "insulin_type": "RAPID_ACTING",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "caution")
        self.assertEqual(response.data["last_injection"]["id"], recent_log.id)
        self.assertIsNotNone(response.data["time_since_last_minutes"])

    def test_precheck_ignores_different_insulin_type(self):
        self.create_injection(
            insulin_type="LONG_ACTING",
            injected_at=timezone.now() - timedelta(minutes=30),
        )

        self.authenticate()

        response = self.client.post(
            reverse("precheck"),
            {
                "insulin_type": "RAPID_ACTING",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "safe")

    def test_precheck_rejects_invalid_insulin_type(self):
        self.authenticate()

        response = self.client.post(
            reverse("precheck"),
            {
                "insulin_type": "WRONG_TYPE",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_log_without_override_reason_is_rejected(self):
        self.create_injection(
            insulin_type="RAPID_ACTING",
            injected_at=timezone.now() - timedelta(minutes=30),
        )

        self.authenticate()

        response = self.client.post(
            reverse("injection-list-create"),
            {
                "insulin_type": "RAPID_ACTING",
                "dose_units": 8,
                "injected_at": self.iso_datetime(timezone.now()),
                "recorded_by_name": "Datu",
                "notes": "",
                "override_reason": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("override_reason", response.data)

        self.assertEqual(
            InjectionLog.objects.filter(
                user=self.user,
                insulin_type="RAPID_ACTING",
            ).count(),
            1,
        )

    def test_duplicate_log_with_override_reason_is_saved(self):
        existing_log = self.create_injection(
            insulin_type="RAPID_ACTING",
            injected_at=timezone.now() - timedelta(minutes=30),
        )

        self.authenticate()

        response = self.client.post(
            reverse("injection-list-create"),
            {
                "insulin_type": "RAPID_ACTING",
                "dose_units": 8,
                "injected_at": self.iso_datetime(timezone.now()),
                "recorded_by_name": "Datu",
                "notes": "",
                "override_reason": "I checked the previous log and this was separate.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_log = InjectionLog.objects.exclude(id=existing_log.id).get(
            user=self.user,
            insulin_type="RAPID_ACTING",
        )

        self.assertTrue(new_log.duplicate_risk_flag)
        self.assertEqual(
            new_log.override_reason,
            "I checked the previous log and this was separate.",
        )

    def test_non_duplicate_log_can_be_saved_without_override_reason(self):
        existing_log = self.create_injection(
            insulin_type="RAPID_ACTING",
            injected_at=timezone.now() - timedelta(hours=5),
        )

        self.authenticate()

        response = self.client.post(
            reverse("injection-list-create"),
            {
                "insulin_type": "RAPID_ACTING",
                "dose_units": 8,
                "injected_at": self.iso_datetime(timezone.now()),
                "recorded_by_name": "Datu",
                "notes": "",
                "override_reason": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_log = InjectionLog.objects.exclude(id=existing_log.id).get(
            user=self.user,
            insulin_type="RAPID_ACTING",
        )

        self.assertFalse(new_log.duplicate_risk_flag)
        self.assertEqual(new_log.override_reason, "")

    def test_meal_reminder_can_be_created_for_rapid_acting_log(self):
        rapid_log = self.create_injection(
            insulin_type="RAPID_ACTING",
            injected_at=timezone.now(),
        )

        self.authenticate()

        response = self.client.post(
            reverse("meal-reminder-create"),
            {
                "injection_log": rapid_log.id,
                "offset_minutes": 15,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        reminder = MealReminder.objects.get(
            user=self.user,
            injection_log=rapid_log,
        )

        self.assertEqual(reminder.offset_minutes, 15)
        self.assertEqual(
            reminder.remind_at,
            rapid_log.injected_at + timedelta(minutes=15),
        )
        self.assertFalse(reminder.is_completed)

    def test_meal_reminder_rejects_long_acting_log(self):
        long_log = self.create_injection(
            insulin_type="LONG_ACTING",
            injected_at=timezone.now(),
        )

        self.authenticate()

        response = self.client.post(
            reverse("meal-reminder-create"),
            {
                "injection_log": long_log.id,
                "offset_minutes": 15,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(MealReminder.objects.count(), 0)