import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getInjectionLog,
  updateInjectionLog,
} from "../features/injections/injectionApi";
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

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
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

  return "border-[#D9E2EC] bg-[#F1F5F9] text-[#627D98]";
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
          "fullSafetyNoteText",
          "InsuTrack is a logging and routine-check tool only. It does not decide whether you should inject, calculate doses, or provide medical advice. Follow your clinician's instructions."
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

export default function EditInjectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  function text(key, fallback) {
    return t?.[key] || fallback;
  }

  const [form, setForm] = useState({
    insulin_type: "RAPID_ACTING",
    dose_units: "",
    injected_at: "",
    recorded_by_name: "",
    notes: "",
    override_reason: "",
  });

  const [originalLog, setOriginalLog] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const wasSavedWithCloseTimeWarning = Boolean(
    originalLog?.duplicate_risk_flag
  );

  useEffect(() => {
    async function loadLog() {
      try {
        const data = await getInjectionLog(id);

        setOriginalLog(data);

        setForm({
          insulin_type: data.insulin_type || "RAPID_ACTING",
          dose_units: data.dose_units || "",
          injected_at: toDateTimeLocal(data.injected_at),
          recorded_by_name: data.recorded_by_name || "",
          notes: data.notes || "",
          override_reason: data.override_reason || "",
        });
      } catch {
        setError(
          t?.editLoadError || "Could not load this injection log."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLog();
  }, [id, t]);

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
    setIsSaving(true);

    try {
      const payload = {
        insulin_type: form.insulin_type,
        dose_units: Number(form.dose_units),
        injected_at: new Date(form.injected_at).toISOString(),
        recorded_by_name: form.recorded_by_name.trim(),
        notes: form.notes.trim(),
        override_reason: wasSavedWithCloseTimeWarning
          ? form.override_reason.trim()
          : "",
      };

      await updateInjectionLog(id, payload);
      navigate("/history");
    } catch {
      setError(
        text(
          "editSaveError",
          "Could not update the injection log. Please check your input."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
        <section className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-[#D9E2EC] bg-white p-6 text-[#627D98] shadow-sm">
            {text("loadingInjectionLog", "Loading injection log...")}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/history"
            className="text-sm font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
          >
            ← {text("backToHistory", "Back to history")}
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <LanguageSwitcher />

            <Link
              to="/dashboard"
              className="rounded-xl bg-[#1F4E79] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63]"
            >
              {text("dashboard", "Dashboard")}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
                  {text("appName", "InsuTrack")}
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
                  {text("editInjectionTitle", "Edit injection log")}
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
                  {text(
                    "editInjectionSubtitle",
                    "Update a previously recorded insulin log. Keep the history accurate so future pre-injection checks and reviews are easier to understand."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5 lg:min-w-60">
                <p className="text-sm font-bold text-[#1F4E79]">
                  {text("currentRecord", "Current record")}
                </p>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                      form.insulin_type
                    )}`}
                  >
                    {getInsulinTypeLabel(form.insulin_type, language)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#627D98]">
                  {text("logId", "Log ID")}:{" "}
                  <span className="font-semibold text-[#102A43]">{id}</span>
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                <p className="text-sm font-bold text-[#1F4E79]">
                  1. {text("reviewDetails", "Review details")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  {text(
                    "reviewDetailsText",
                    "Check the insulin type, dose, time, and recorder name."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                <p className="text-sm font-bold text-[#24786E]">
                  2. {text("correctMistakes", "Correct mistakes")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#246B63]">
                  {text(
                    "correctMistakesText",
                    "Update only the information that was entered incorrectly."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                <p className="text-sm font-bold text-[#8A5A00]">
                  3. {text("saveCarefully", "Save carefully")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  {text(
                    "saveCarefullyText",
                    "Edited logs may affect what you see in history and future safety checks."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
            <h2 className="font-bold">
              {text("editError", "Edit error")}
            </h2>

            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        )}

        {originalLog && (
          <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                  {text("originalSavedLog", "Original saved log")}
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#102A43]">
                  {text("beforeEditing", "Before editing")}
                </h2>
              </div>

              {wasSavedWithCloseTimeWarning && (
                <span className="inline-flex w-fit rounded-full border border-[#F6D365] bg-[#FFF8E1] px-3 py-1 text-xs font-semibold text-[#8A5A00]">
                  {text("injectionTimeTooClose", "Injection time too close")}
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem
                label={text("insulinType", "Insulin type")}
                value={getInsulinTypeLabel(originalLog.insulin_type, language)}
              />

              <DetailItem
                label={text("dose", "Dose")}
                value={`${originalLog.dose_units} ${text("units", "units")}`}
              />

              <DetailItem
                label={text("injectedAt", "Injected at")}
                value={formatDateTime(originalLog.injected_at, language)}
              />

              <DetailItem
                label={text("recordedBy", "Recorded by")}
                value={
                  originalLog.recorded_by_name ||
                  text("unknownRecorder", "Unknown recorder")
                }
              />
            </div>
          </div>
        )}

        {wasSavedWithCloseTimeWarning && (
          <div className="mt-6 rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8A5A00]">
              {text(
                "closeInjectionTimeWarningDetails",
                "Close injection-time warning details"
              )}
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#8A5A00]">
              {text(
                "savedWithCloseTimeWarning",
                "This log was saved even though the injection time was too close"
              )}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8A5A00]">
              {text(
                "closeTimeReasonExplanation",
                "The reason field is shown because this specific record had a close injection-time warning when it was saved."
              )}
            </p>

            {originalLog?.override_reason && (
              <div className="mt-4 rounded-2xl border border-[#F6D365] bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8A5A00]">
                  {text("savedReason", "Saved reason")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  {originalLog.override_reason}
                </p>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                {text("editDetails", "Edit details")}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
                {text("injectionLogForm", "Injection log form")}
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
                onChange={handleChange}
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
                placeholder={text("recordedByExample", "Example: Datu")}
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

            {wasSavedWithCloseTimeWarning && (
              <div>
                <FieldLabel>
                  {text(
                    "reasonCloseTimeWarningLogWasSaved",
                    "Reason this close injection-time warning log was saved"
                  )}
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
                    "closeTimeReasonRequired",
                    "Required because this saved record was marked as having an injection time too close to a previous log."
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <SafetyNote text={text} />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#1F4E79] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
            >
              {isSaving
                ? text("savingChanges", "Saving changes...")
                : text("saveChanges", "Save changes")}
            </button>

            <Link
              to="/history"
              className="rounded-xl border border-[#B8C9D9] bg-white px-5 py-3 text-center text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8] sm:flex-1"
            >
              {text("cancel", "Cancel")}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}