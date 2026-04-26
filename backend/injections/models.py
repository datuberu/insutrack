from django.conf import settings
from django.db import models


class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_settings"
    )
    meal_reminder_enabled = models.BooleanField(default=False)
    meal_reminder_offset_minutes = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"Settings for {self.user.username}"


class InjectionLog(models.Model):
    class InsulinType(models.TextChoices):
        RAPID_ACTING = "RAPID_ACTING", "Rapid-acting insulin (bolus)"
        LONG_ACTING = "LONG_ACTING", "Long-acting insulin (basal)"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="injection_logs"
    )

    insulin_type = models.CharField(
        max_length=30,
        choices=InsulinType.choices
    )

    dose_units = models.PositiveIntegerField()
    injected_at = models.DateTimeField()
    recorded_by_name = models.CharField(max_length=100)
    notes = models.TextField(blank=True)

    duplicate_risk_flag = models.BooleanField(default=False)
    override_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-injected_at"]

    def __str__(self):
        return f"{self.user.username} - {self.insulin_type} - {self.injected_at}"


class MealReminder(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meal_reminders"
    )

    injection_log = models.ForeignKey(
        InjectionLog,
        on_delete=models.CASCADE,
        related_name="meal_reminders"
    )

    remind_at = models.DateTimeField()
    offset_minutes = models.PositiveIntegerField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["remind_at"]

    def __str__(self):
        return f"Meal reminder for {self.user.username} at {self.remind_at}"