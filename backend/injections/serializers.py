from rest_framework import serializers

from .models import InjectionLog, UserSettings, MealReminder


class InjectionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InjectionLog
        fields = [
            "id",
            "insulin_type",
            "dose_units",
            "injected_at",
            "recorded_by_name",
            "notes",
            "duplicate_risk_flag",
            "override_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "duplicate_risk_flag",
            "created_at",
            "updated_at",
        ]


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            "meal_reminder_enabled",
            "meal_reminder_offset_minutes",
        ]


class MealReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealReminder
        fields = [
            "id",
            "injection_log",
            "remind_at",
            "offset_minutes",
            "is_completed",
            "created_at",
        ]
        read_only_fields = ["id", "remind_at", "created_at"]