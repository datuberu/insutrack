import { useEffect, useState } from "react";
import { finishMealReminderAlarm } from "../features/reminders/notificationUtils";
import { useLanguage } from "../i18n/LanguageContext";

/*
  InsuTrack UI color system

  Background: #F7FAFC
  Surface: #FFFFFF
  Soft surface: #F1F5F9
  Border: #D9E2EC
  Main text: #102A43
  Secondary text: #627D98

  Primary blue: #1F4E79
  Primary hover: #173F63
  Soft primary: #EAF2F8

  Teal/reminder: #2A9D8F
  Soft teal: #E8F7F5

  Warning: #D69E2E
  Soft warning: #FFF8E1

  Success: #2F855A
  Soft success: #E6F6EC

  Danger: #E53E3E
  Soft danger: #FDECEC
*/

function formatDateTime(value, language) {
  if (!value) {
    return language === "id" ? "Sekarang" : "Now";
  }

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MealReminderAlarm() {
  const { t, language } = useLanguage();

  function text(key, fallback) {
    return t?.[key] || fallback;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    function handleMealTime(event) {
      setReminder(event?.detail?.reminder || null);
      setIsOpen(true);
    }

    window.addEventListener("insutrack-meal-time", handleMealTime);

    return () => {
      window.removeEventListener("insutrack-meal-time", handleMealTime);
    };
  }, []);

  function handleClose() {
    setIsOpen(false);
    setReminder(null);
    finishMealReminderAlarm();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A43]/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-reminder-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#BFE7E1] bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#E8F7F5] via-white to-[#EAF2F8] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2A9D8F] text-2xl text-white shadow-sm">
              🍽️
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#24786E]">
                {text("insutrackReminder", "InsuTrack reminder")}
              </p>

              <h2
                id="meal-reminder-title"
                className="mt-2 text-2xl font-bold tracking-tight text-[#102A43]"
              >
                {text("mealTime", "Meal time")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#486581]">
                {text(
                  "mealReminderAlarmDescription",
                  "This is your personal routine reminder after a rapid-acting insulin log."
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#24786E]">
              {text("reminderTime", "Reminder time")}
            </p>

            <p className="mt-1 text-base font-bold text-[#124E47]">
              {formatDateTime(reminder?.remind_at, language)}
            </p>

            <p className="mt-3 text-sm leading-6 text-[#246B63]">
              {text(
                "routineReminderOnly",
                "Personal routine reminder only. Follow your clinician's instructions."
              )}
            </p>
          </div>

          <div className="mt-4 rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
            <p className="text-sm font-bold text-[#8A5A00]">
              {text("safetyNote", "Safety note")}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
              {text(
                "mealReminderAlarmSafetyText",
                "InsuTrack does not calculate doses, decide meal timing, or provide medical advice."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="mt-5 w-full rounded-xl bg-[#2A9D8F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24786E] focus:outline-none focus:ring-4 focus:ring-[#E8F7F5]"
          >
            {text("iUnderstand", "I understand")}
          </button>
        </div>
      </div>
    </div>
  );
}