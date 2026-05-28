import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createInjectionLog } from "../features/injections/injectionApi";
import { runPreCheck } from "../features/precheck/precheckApi";
import {
  createMealReminder,
  updateUserSettings,
} from "../features/reminders/reminderApi";
import {
  scheduleMealReminderNotification,
  unlockReminderSound,
} from "../features/reminders/notificationUtils";
import LanguageSwitcher from "../components/LanguageSwitcher";
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

  Rapid tag: #2563EB / #DBEAFE
  Long tag: #7C3AED / #EDE9FE
*/

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function formatDateTime(value, language) {
  if (!value) {
    return language === "id" ? "Tidak ada waktu tercatat" : "No time recorded";
  }

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInsulinTypeLabel(insulinType, language) {
  if (insulinType === "RAPID_ACTING") {
    return language === "id"
      ? "Insulin kerja cepat (bolus)"
      : "Rapid-acting insulin (bolus)";
  }

  if (insulinType === "LONG_ACTING") {
    return language === "id"
      ? "Insulin kerja panjang (basal)"
      : "Long-acting insulin (basal)";
  }

  return "Insulin";
}

function getInsulinTagStyle(insulinType) {
  if (insulinType === "RAPID_ACTING") {
    return "border-[#BFDBFE] bg-[#DBEAFE] text-[#1D4ED8]";
  }

  if (insulinType === "LONG_ACTING") {
    return "border-[#DDD6FE] bg-[#EDE9FE] text-[#6D28D9]";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getApiErrorMessage(error, text) {
  const data = error?.response?.data;

  if (!data) {
    return text(
      "saveInjectionLogError",
      "Could not save the injection log. Please check your input."
    );
  }

  if (Array.isArray(data.override_reason)) {
    return text(
      "closeTimeReasonRequiredBeforeSaving",
      "Please provide a reason before saving this log because the injection time is too close to a previous log."
    );
  }

  if (typeof data.override_reason === "string") {
    return text(
      "closeTimeReasonRequiredBeforeSaving",
      "Please provide a reason before saving this log because the injection time is too close to a previous log."
    );
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  return text(
    "saveInjectionLogError",
    "Could not save the injection log. Please check your input."
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="block text-sm font-bold text-[#102A43]">
      {children}
      {required && (
        <span className="ml-1 text-red-600" aria-label="required">
          *
        </span>
      )}
    </label>
  );
}

function SafetyNote({ text }) {
  return (
    <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
      <h2 className="font-bold text-[#8A5A00]">
        {text("safetyNote", "Safety note")}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
        {text(
          "logSafetyNoteText",
          "InsuTrack is a logging and routine-check tool only. It does not calculate doses or provide medical advice. Follow your clinician's instructions."
        )}
      </p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F7FAFC] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#627D98]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#102A43]">{value}</p>
    </div>
  );
}

export default function LogInjectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  function text(key, fallback) {
    return t?.[key] || fallback;
  }

  const incomingDuplicateWarning = location.state?.duplicateWarning || null;
  const incomingInsulinType =
    location.state?.insulinType ||
    incomingDuplicateWarning?.last_injection?.insulin_type ||
    "RAPID_ACTING";

  const [form, setForm] = useState({
    insulin_type: incomingInsulinType,
    dose_units: "",
    injected_at: getCurrentDateTimeLocal(),
    recorded_by_name: "",
    notes: "",
    override_reason: "",
  });

  const [error, setError] = useState("");
  const [successLog, setSuccessLog] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(
    incomingDuplicateWarning
  );
  const [isLoading, setIsLoading] = useState(false);

  const [mealReminderOffset, setMealReminderOffset] = useState("10");
  const [customMealReminderOffset, setCustomMealReminderOffset] = useState("");
  const [mealReminderMessage, setMealReminderMessage] = useState("");
  const [mealReminderError, setMealReminderError] = useState("");
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [reminderSkipped, setReminderSkipped] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessLog(null);
    setMealReminderMessage("");
    setMealReminderError("");
    setReminderSkipped(false);
    setIsLoading(true);

    try {
      if (!duplicateWarning) {
        const precheckResult = await runPreCheck({
          insulin_type: form.insulin_type,
        });

        if (precheckResult.status === "caution") {
          setDuplicateWarning(precheckResult);
          setIsLoading(false);
          return;
        }
      }

      if (duplicateWarning && !form.override_reason.trim()) {
        setError(
          text(
            "closeTimeReasonRequiredBeforeSaving",
            "Please provide a reason before saving this log because the injection time is too close to a previous log."
          )
        );
        setIsLoading(false);
        return;
      }

      const payload = {
        insulin_type: form.insulin_type,
        dose_units: Number(form.dose_units),
        injected_at: new Date(form.injected_at).toISOString(),
        recorded_by_name: form.recorded_by_name.trim(),
        notes: form.notes.trim(),
        override_reason: form.override_reason.trim(),
      };

      const savedLog = await createInjectionLog(payload);

      setSuccessLog(savedLog);
      setDuplicateWarning(null);

      setForm({
        insulin_type: "RAPID_ACTING",
        dose_units: "",
        injected_at: getCurrentDateTimeLocal(),
        recorded_by_name: "",
        notes: "",
        override_reason: "",
      });
    } catch (err) {
      setError(getApiErrorMessage(err, text));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveMealReminder() {
    if (!successLog) return;

    setMealReminderError("");
    setMealReminderMessage("");
    setIsSavingReminder(true);

    await unlockReminderSound();

    const offset =
      mealReminderOffset === "custom"
        ? Number(customMealReminderOffset)
        : Number(mealReminderOffset);

    if (!Number.isInteger(offset) || offset < 1 || offset > 180) {
      setMealReminderError(
        text(
          "reminderOffsetError",
          "Reminder offset must be between 1 and 180 minutes."
        )
      );
      setIsSavingReminder(false);
      return;
    }

    try {
      await updateUserSettings({
        meal_reminder_enabled: true,
        meal_reminder_offset_minutes: offset,
      });

      const reminder = await createMealReminder({
        injection_log: successLog.id,
        offset_minutes: offset,
      });

      scheduleMealReminderNotification(reminder);

      setMealReminderMessage(
        `${text("mealReminderSavedFor", "Meal reminder saved for")} ${formatDateTime(
          reminder.remind_at,
          language
        )}.`
      );
    } catch {
      setMealReminderError(
        text("saveMealReminderError", "Could not save meal reminder. Please try again.")
      );
    } finally {
      setIsSavingReminder(false);
    }
  }

  function handleGoToDashboard() {
    navigate("/dashboard");
  }

  const shouldShowMealReminderPrompt =
    successLog?.insulin_type === "RAPID_ACTING" &&
    !mealReminderMessage &&
    !reminderSkipped;

  return (
    <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
          >
            ← {text("backToDashboard", "Back to dashboard")}
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <LanguageSwitcher />

            <Link
              to="/history"
              className="w-fit rounded-xl border border-[#B8C9D9] bg-white px-4 py-2 text-center text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8]"
            >
              {text("viewHistory", "View history")}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
              {text("appName", "InsuTrack")}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
              {text("logCompletedInjectionTitle", "Log completed injection")}
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
              {text(
                "logCompletedInjectionSubtitle",
                "Record an injection only after it has actually been completed. The app checks recent logs first and asks for a reason if the injection time is too close to a previous log."
              )}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                <p className="text-sm font-bold text-[#1F4E79]">
                  1. {text("checkRecentLogs", "Check recent logs")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  {text(
                    "checkRecentLogsText",
                    "InsuTrack checks whether a similar insulin type was logged recently."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                <p className="text-sm font-bold text-[#24786E]">
                  2. {text("saveCompletedLog", "Save completed log")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#246B63]">
                  {text(
                    "saveCompletedLogText",
                    "Add dose, time, recorder name, and optional notes."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                <p className="text-sm font-bold text-[#8A5A00]">
                  3. {text("reviewWarnings", "Review warnings")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  {text(
                    "reviewWarningsText",
                    "If the injection time is too close, provide a reason before saving."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
            <h2 className="font-bold">
              {text("couldNotSaveLog", "Could not save log")}
            </h2>

            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        )}

        {successLog && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#B7E4C7] bg-white shadow-sm">
            <div className="bg-[#E6F6EC] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2F855A]">
                {text("saved", "Saved")}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#174A31]">
                {text("injectionLogSaved", "Injection log saved")}
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                    successLog.insulin_type
                  )}`}
                >
                  {getInsulinTypeLabel(successLog.insulin_type, language)}
                </span>

                <span className="inline-flex rounded-full border border-[#B7E4C7] bg-white px-3 py-1 text-xs font-semibold text-[#2F855A]">
                  {successLog.dose_units} {text("units", "units")}
                </span>
              </div>
            </div>

            <div className="p-6">
              {successLog.duplicate_risk_flag && (
                <div className="rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-5 text-sm leading-6 text-[#8A5A00]">
                  {text(
                    "savedWithCloseTimeWarningNotice",
                    "This log was saved even though the injection time was too close to a previous log. The reason is saved in history."
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="rounded-xl bg-[#2F855A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#276749]"
                >
                  {text("goToDashboard", "Go to dashboard")}
                </button>

                <Link
                  to="/history"
                  className="rounded-xl border border-[#B7E4C7] bg-white px-4 py-3 text-center text-sm font-semibold text-[#2F855A] transition hover:bg-[#E6F6EC]"
                >
                  {text("viewHistory", "View history")}
                </Link>
              </div>
            </div>
          </div>
        )}

        {shouldShowMealReminderPrompt && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#BFE7E1] bg-white shadow-sm">
            <div className="bg-[#E8F7F5] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#24786E]">
                {text("routineReminder", "Routine reminder")}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#124E47]">
                {text("setMealReminder", "Set meal reminder?")}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#246B63]">
                {text(
                  "setMealReminderText",
                  "This reminder is only for your personal routine. It is separate from the close-time safety check."
                )}
              </p>

              <p className="mt-2 text-xs leading-5 text-[#24786E]">
                {text(
                  "routineReminderOnly",
                  "Personal routine reminder only. Follow your clinician's instructions."
                )}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <FieldLabel>
                    {text("reminderTiming", "Reminder timing")}
                  </FieldLabel>

                  <select
                    value={mealReminderOffset}
                    onChange={(event) =>
                      setMealReminderOffset(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[#BFE7E1] bg-white px-4 py-3 text-[#102A43] outline-none transition focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#E8F7F5]"
                  >
                    <option value="10">10 {text("minutes", "minutes")}</option>
                    <option value="15">15 {text("minutes", "minutes")}</option>
                    <option value="custom">{text("custom", "Custom")}</option>
                  </select>
                </div>

                {mealReminderOffset === "custom" && (
                  <div>
                    <FieldLabel>
                      {text("customMinutes", "Custom minutes")}
                    </FieldLabel>

                    <input
                      value={customMealReminderOffset}
                      onChange={(event) =>
                        setCustomMealReminderOffset(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#BFE7E1] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#2A9D8F] focus:ring-4 focus:ring-[#E8F7F5]"
                      type="number"
                      min="1"
                      max="180"
                      placeholder={text("enterMinutes", "Enter minutes")}
                    />
                  </div>
                )}
              </div>

              {mealReminderError && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-[#FDECEC] p-4 text-sm leading-6 text-red-700">
                  {mealReminderError}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSaveMealReminder}
                  disabled={isSavingReminder}
                  className="rounded-xl bg-[#2A9D8F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24786E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingReminder
                    ? text("savingReminder", "Saving reminder...")
                    : text("saveReminder", "Save reminder")}
                </button>

                <button
                  type="button"
                  onClick={() => setReminderSkipped(true)}
                  className="rounded-xl border border-[#BFE7E1] bg-white px-4 py-3 text-sm font-semibold text-[#24786E] transition hover:bg-[#E8F7F5]"
                >
                  {text("skipReminder", "Skip reminder")}
                </button>
              </div>
            </div>
          </div>
        )}

        {mealReminderMessage && (
          <div className="mt-6 rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5 text-[#124E47]">
            <h2 className="font-bold">
              {text("mealReminderSaved", "Meal reminder saved")}
            </h2>

            <p className="mt-2 text-sm leading-6">{mealReminderMessage}</p>

            <p className="mt-2 text-xs leading-5 text-[#24786E]">
              {text(
                "routineReminderOnly",
                "Personal routine reminder only. Follow your clinician's instructions."
              )}
            </p>
          </div>
        )}

        {duplicateWarning && !successLog && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#F6D365] bg-white shadow-sm">
            <div className="bg-[#FFF8E1] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8A5A00]">
                {text("caution", "Caution")}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#8A5A00]">
                {text(
                  "injectionTimeTooCloseToRecentLog",
                  "Injection time is too close to a recent log"
                )}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8A5A00]">
                {text(
                  "closeTimeWarningDescription",
                  "A recent matching insulin log already exists, so this injection time is close to a previous log. Review the last log carefully before saving another one."
                )}
              </p>
            </div>

            <div className="p-6">
              {duplicateWarning.last_injection && (
                <div className="rounded-3xl border border-[#D9E2EC] bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-[#627D98]">
                        {text("lastMatchingLog", "Last matching log")}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                          duplicateWarning.last_injection.insulin_type
                        )}`}
                      >
                        {getInsulinTypeLabel(
                          duplicateWarning.last_injection.insulin_type,
                          language
                        )}
                      </span>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-[#F6D365] bg-[#FFF8E1] px-3 py-1 text-xs font-semibold text-[#8A5A00]">
                      {text("reviewCarefully", "Review carefully")}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DetailItem
                      label={text("dose", "Dose")}
                      value={`${duplicateWarning.last_injection.dose_units} ${text(
                        "units",
                        "units"
                      )}`}
                    />

                    <DetailItem
                      label={text("injectedAt", "Injected at")}
                      value={formatDateTime(
                        duplicateWarning.last_injection.injected_at,
                        language
                      )}
                    />

                    <DetailItem
                      label={text("recordedBy", "Recorded by")}
                      value={
                        duplicateWarning.last_injection.recorded_by_name ||
                        text("unknownRecorder", "Unknown recorder")
                      }
                    />

                    {duplicateWarning.time_since_last_minutes !== null && (
                      <DetailItem
                        label={text("timeSinceLastLog", "Time since last log")}
                        value={`${duplicateWarning.time_since_last_minutes} ${text(
                          "minutes",
                          "minutes"
                        )}`}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-5 text-sm leading-6 text-[#8A5A00]">
                {text(
                  "enterReasonIfAlreadyCompleted",
                  "If this injection was actually completed and you still need to save the log, enter a reason below."
                )}
              </div>
            </div>
          </div>
        )}

        {!successLog && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                  {text("injectionDetails", "Injection details")}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
                  {text("completedInjectionLog", "Completed injection log")}
                </h2>
              </div>

              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                  form.insulin_type
                )}`}
              >
                {getInsulinTypeLabel(form.insulin_type, language)}
              </span>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <FieldLabel>{text("insulinType", "Insulin type")}</FieldLabel>

                <select
                  name="insulin_type"
                  value={form.insulin_type}
                  onChange={(event) => {
                    handleChange(event);
                    setDuplicateWarning(null);
                    setError("");
                  }}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  required
                >
                  <option value="RAPID_ACTING">
                    {getInsulinTypeLabel("RAPID_ACTING", language)}
                  </option>

                  <option value="LONG_ACTING">
                    {getInsulinTypeLabel("LONG_ACTING", language)}
                  </option>
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>{text("doseUnits", "Dose units")}</FieldLabel>

                  <input
                    name="dose_units"
                    value={form.dose_units}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                    type="number"
                    min="1"
                    placeholder={text("doseExample", "Example: 8")}
                    required
                  />
                </div>

                <div>
                  <FieldLabel>
                    {text("injectionTime", "Injection time")}
                  </FieldLabel>

                  <input
                    name="injected_at"
                    value={form.injected_at}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>

              <div>
                <FieldLabel required>{text("recordedBy", "Recorded by")}</FieldLabel>

                <input
                  name="recorded_by_name"
                  value={form.recorded_by_name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  type="text"
                  placeholder={text("recordedByExampleSelf", "Example: John (self)")}
                  required
                />
              </div>

              <div>
                <FieldLabel>{text("notes", "Notes")}</FieldLabel>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="mt-2 min-h-28 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  placeholder={text("optionalNotes", "Optional notes")}
                />
              </div>

              {duplicateWarning && (
                <div>
                  <FieldLabel>
                    {text("reason", "Reason")}
                  </FieldLabel>

                  <textarea
                    name="override_reason"
                    value={form.override_reason}
                    onChange={handleChange}
                    className="mt-2 min-h-28 w-full rounded-xl border border-[#F6D365] bg-[#FFF8E1] px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9A6B00] focus:border-[#D69E2E] focus:ring-4 focus:ring-[#FFF8E1]"
                    placeholder={text(
                      "overrideReasonExample",
                      "Example: I checked the previous log and this was a separate completed injection."
                    )}
                    required
                  />

                  <p className="mt-2 text-xs leading-5 text-[#8A5A00]">
                    {text(
                      "reasonRequiredCloseTime",
                      "Required because the injection time is too close to a previous log."
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <SafetyNote text={text} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-xl bg-[#1F4E79] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#173F63] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? duplicateWarning
                  ? text("saving", "Saving...")
                  : text("checking", "Checking...")
                : duplicateWarning
                  ? text("saveWithReason", "Save with reason")
                  : text("checkAndSaveInjectionLog", "Check and save injection log")}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}