from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import InjectionLog, UserSettings, MealReminder
from .serializers import (
    InjectionLogSerializer,
    UserSettingsSerializer,
    MealReminderSerializer,
)


DUPLICATE_WINDOWS = {
    "RAPID_ACTING": timedelta(hours=4),
    "LONG_ACTING": timedelta(hours=20),
}


class InjectionLogListCreateView(generics.ListCreateAPIView):
    serializer_class = InjectionLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InjectionLog.objects.filter(user=self.request.user).order_by("-injected_at")

    def perform_create(self, serializer):
        insulin_type = serializer.validated_data["insulin_type"]
        injected_at = serializer.validated_data["injected_at"]
        override_reason = serializer.validated_data.get("override_reason", "").strip()

        duplicate_risk = has_duplicate_risk(
            user=self.request.user,
            insulin_type=insulin_type,
            injected_at=injected_at,
        )

        if duplicate_risk and not override_reason:
            raise ValidationError(
                {
                    "override_reason": "Override reason is required when possible duplicate risk is detected."
                }
            )

        serializer.save(
            user=self.request.user,
            duplicate_risk_flag=duplicate_risk,
        )


class InjectionLogDetailView(generics.RetrieveAPIView):
    serializer_class = InjectionLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InjectionLog.objects.filter(user=self.request.user)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = InjectionLog.objects.filter(user=request.user).order_by("-injected_at")

        last_rapid_acting = logs.filter(insulin_type="RAPID_ACTING").first()
        last_long_acting = logs.filter(insulin_type="LONG_ACTING").first()
        recent_history = logs[:5]

        upcoming_meal_reminder = (
            MealReminder.objects.filter(
                user=request.user,
                is_completed=False,
                remind_at__gte=timezone.now(),
            )
            .order_by("remind_at")
            .first()
        )

        return Response(
            {
                "last_rapid_acting": InjectionLogSerializer(last_rapid_acting).data
                if last_rapid_acting
                else None,
                "last_long_acting": InjectionLogSerializer(last_long_acting).data
                if last_long_acting
                else None,
                "recent_history": InjectionLogSerializer(recent_history, many=True).data,
                "upcoming_meal_reminder": MealReminderSerializer(upcoming_meal_reminder).data
                if upcoming_meal_reminder
                else None,
            }
        )


class PreCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        insulin_type = request.data.get("insulin_type")

        if insulin_type not in DUPLICATE_WINDOWS:
            return Response(
                {"detail": "insulin_type must be RAPID_ACTING or LONG_ACTING."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        check_time = timezone.now()
        window = DUPLICATE_WINDOWS[insulin_type]
        since_time = check_time - window

        last_injection = (
            InjectionLog.objects.filter(
                user=request.user,
                insulin_type=insulin_type,
                injected_at__gte=since_time,
                injected_at__lte=check_time,
            )
            .order_by("-injected_at")
            .first()
        )

        if last_injection:
            minutes_since = int((check_time - last_injection.injected_at).total_seconds() / 60)
            insulin_label = get_insulin_display_label(insulin_type)

            return Response(
                {
                    "status": "caution",
                    "message": f"Possible duplicate {insulin_label} log detected. Please review the last injection before continuing.",
                    "last_injection": InjectionLogSerializer(last_injection).data,
                    "time_since_last_minutes": minutes_since,
                }
            )

        return Response(
            {
                "status": "safe",
                "message": "No recent matching injection was found in the duplicate-check window.",
                "last_injection": None,
                "time_since_last_minutes": None,
            }
        )


class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        return settings

    def get(self, request):
        settings = self.get_object(request)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings = self.get_object(request)
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MealReminderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        injection_log_id = request.data.get("injection_log")
        offset_minutes = request.data.get("offset_minutes")

        if injection_log_id is None or offset_minutes is None:
            return Response(
                {"detail": "injection_log and offset_minutes are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            offset_minutes = int(offset_minutes)
        except ValueError:
            return Response(
                {"detail": "offset_minutes must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if offset_minutes < 0 or offset_minutes > 180:
            return Response(
                {"detail": "offset_minutes must be between 0 and 180."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            injection_log = InjectionLog.objects.get(
                id=injection_log_id,
                user=request.user,
                insulin_type="RAPID_ACTING",
            )
        except InjectionLog.DoesNotExist:
            return Response(
                {"detail": "Rapid-acting insulin injection log not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        reminder = MealReminder.objects.create(
            user=request.user,
            injection_log=injection_log,
            offset_minutes=offset_minutes,
            remind_at=injection_log.injected_at + timedelta(minutes=offset_minutes),
        )

        serializer = MealReminderSerializer(reminder)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


def has_duplicate_risk(user, insulin_type, injected_at):
    window = DUPLICATE_WINDOWS.get(insulin_type)

    if not window:
        return False

    since_time = injected_at - window
    until_time = injected_at + window

    return InjectionLog.objects.filter(
        user=user,
        insulin_type=insulin_type,
        injected_at__gte=since_time,
        injected_at__lte=until_time,
    ).exists()


def get_insulin_display_label(insulin_type):
    labels = {
        "RAPID_ACTING": "rapid-acting insulin (bolus)",
        "LONG_ACTING": "long-acting insulin (basal)",
    }

    return labels.get(insulin_type, "insulin")