from django.contrib import admin
from .models import InjectionLog, UserSettings, MealReminder


@admin.register(InjectionLog)
class InjectionLogAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "insulin_type",
        "dose_units",
        "injected_at",
        "recorded_by_name",
        "duplicate_risk_flag",
    )
    list_filter = ("insulin_type", "duplicate_risk_flag", "created_at")
    search_fields = ("user__username", "recorded_by_name", "notes")
    ordering = ("-injected_at",)


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "meal_reminder_enabled",
        "meal_reminder_offset_minutes",
    )


@admin.register(MealReminder)
class MealReminderAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "injection_log",
        "remind_at",
        "offset_minutes",
        "is_completed",
    )
    list_filter = ("is_completed", "created_at")