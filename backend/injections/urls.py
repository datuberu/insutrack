from django.urls import path

from .views import (
    InjectionLogListCreateView,
    InjectionLogDetailView,
    DashboardSummaryView,
    PreCheckView,
    UserSettingsView,
    MealReminderCreateView,
)

urlpatterns = [
    path("injections/", InjectionLogListCreateView.as_view(), name="injection-list-create"),
    path("injections/<int:pk>/", InjectionLogDetailView.as_view(), name="injection-detail"),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("precheck/", PreCheckView.as_view(), name="precheck"),
    path("settings/me/", UserSettingsView.as_view(), name="user-settings"),
    path("meal-reminders/", MealReminderCreateView.as_view(), name="meal-reminder-create"),
]