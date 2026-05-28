import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInjectionLogs,
  deleteInjectionLog,
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

function LoadingState({ text }) {
  return (
    <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 text-[#627D98] shadow-sm">
      {text("loadingInjectionHistory", "Loading injection history...")}
    </div>
  );
}

function ErrorState({ error, text }) {
  return (
    <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
      <h2 className="font-bold">{text("historyError", "History error")}</h2>

      <p className="mt-2 text-sm leading-6">{error}</p>

      <Link
        to="/login"
        className="mt-4 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
      >
        {text("goToLogin", "Go to login")}
      </Link>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#C9D8E6] bg-[#F7FAFC] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2F8] text-xl">
        📝
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#102A43]">
        {text("noInjectionLogsYet", "No injection logs yet")}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#627D98]">
        {text(
          "noInjectionLogsYetText",
          "After you record a completed injection, it will appear here for review, editing, or deletion."
        )}
      </p>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          to="/pre-check"
          className="rounded-xl bg-[#1F4E79] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63]"
        >
          {text("checkBeforeNextLog", "Check before next log")}
        </Link>
      </div>
    </div>
  );
}

function HistoryLogCard({ log, isDeleting, onDelete, text, language }) {
  return (
    <article className="rounded-3xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                log.insulin_type
              )}`}
            >
              {getInsulinTypeLabel(log.insulin_type, language)}
            </span>

            {log.duplicate_risk_flag && (
              <span className="inline-flex rounded-full border border-[#F6D365] bg-[#FFF8E1] px-3 py-1 text-xs font-semibold text-[#8A5A00]">
                {text("injectionTimeTooClose", "Injection time too close")}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold text-[#102A43]">
            {log.dose_units} {text("units", "units")}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#627D98]">
            {text("recordedBy", "Recorded by")}{" "}
            <span className="font-semibold text-[#102A43]">
              {log.recorded_by_name ||
                text("unknownRecorder", "Unknown recorder")}
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7FAFC] px-4 py-3 text-left lg:min-w-56">
          <p className="text-xs font-bold uppercase tracking-wide text-[#627D98]">
            {text("injectedAt", "Injected at")}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#102A43]">
            {formatDateTime(log.injected_at, language)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailItem
          label={text("dose", "Dose")}
          value={`${log.dose_units} ${text("units", "units")}`}
        />

        <DetailItem
          label={text("injectionTime", "Injection time")}
          value={formatDateTime(log.injected_at, language)}
        />

        <DetailItem
          label={text("recordedBy", "Recorded by")}
          value={
            log.recorded_by_name || text("unknownRecorder", "Unknown recorder")
          }
        />

        <DetailItem
          label={text("status", "Status")}
          value={
            log.duplicate_risk_flag
              ? text(
                  "savedWithCloseInjectionTimeWarning",
                  "Saved with close injection-time warning"
                )
              : text(
                  "savedWithoutCloseInjectionTimeWarning",
                  "Saved without close injection-time warning"
                )
          }
        />
      </div>

      {log.notes && (
        <div className="mt-4 rounded-2xl border border-[#D9E2EC] bg-[#F7FAFC] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#627D98]">
            {text("notes", "Notes")}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#486581]">{log.notes}</p>
        </div>
      )}

      {log.duplicate_risk_flag && (
        <div className="mt-4 rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-4 text-sm leading-6 text-[#8A5A00]">
          {text(
            "closeInjectionTimeFlagExplanation",
            "This log was flagged because the injection time was too close to a previous log. Review the injection details carefully when using this record as a reference."
          )}
        </div>
      )}

      {log.override_reason && (
        <div className="mt-4 rounded-2xl border border-[#BFE7E1] bg-[#E8F7F5] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#24786E]">
            {text("savedReason", "Saved reason")}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#246B63]">
            {log.override_reason}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          to={`/edit-injection/${log.id}`}
          className="rounded-xl border border-[#B8C9D9] bg-white px-4 py-2 text-center text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8]"
        >
          {text("editLog", "Edit log")}
        </Link>

        <button
          type="button"
          onClick={() => onDelete(log.id)}
          disabled={isDeleting}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting
            ? text("deleting", "Deleting...")
            : text("delete", "Delete")}
        </button>
      </div>
    </article>
  );
}

export default function HistoryPage() {
  const { t, language } = useLanguage();

  function text(key, fallback) {
    return t?.[key] || fallback;
  }

  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getInjectionLogs();
        setLogs(data);
      } catch {
        setError(
          t?.historyLoadError ||
            "Could not load injection history. Please login again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, [t]);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      text("deleteInjectionLogConfirm", "Delete this injection log?")
    );

    if (!confirmed) return;

    setError("");
    setIsDeletingId(id);

    try {
      await deleteInjectionLog(id);

      setLogs((currentLogs) =>
        currentLogs.filter((currentLog) => currentLog.id !== id)
      );
    } catch {
      setError(
        text("deleteInjectionLogError", "Could not delete this injection log.")
      );
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
      <section className="mx-auto max-w-6xl">
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
              to="/pre-check"
              className="rounded-xl bg-[#1F4E79] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63]"
            >
              {text("checkBeforeNextLog", "Check before next log")}
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
                  {text("injectionHistory", "Injection history")}
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
                  {text(
                    "injectionHistorySubtitle",
                    "Review, edit, or delete previously recorded insulin logs. Use this page as a reference before logging another completed injection."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5 lg:min-w-56">
                <p className="text-sm font-bold text-[#1F4E79]">
                  {text("savedRecords", "Saved records")}
                </p>

                <p className="mt-2 text-3xl font-bold text-[#102A43]">
                  {logs.length}
                </p>

                <p className="mt-1 text-sm leading-6 text-[#627D98]">
                  {text(
                    "totalInjectionLogs",
                    "Total injection logs in this account."
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                <p className="text-sm font-bold text-[#1F4E79]">
                  {text("reviewTimeline", "Review timeline")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  {text(
                    "reviewTimelineText",
                    "Check dose, time, recorder name, and notes from saved logs."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                <p className="text-sm font-bold text-[#24786E]">
                  {text("keepRecordsClean", "Keep records clean")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#246B63]">
                  {text(
                    "keepRecordsCleanText",
                    "Edit incorrect details or delete accidental entries."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                <p className="text-sm font-bold text-[#8A5A00]">
                  {text("watchCloseTimeFlags", "Watch close-time flags")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  {text(
                    "watchCloseTimeFlagsText",
                    "Logs with close injection-time warnings include their saved reason when available."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading && <LoadingState text={text} />}

        {error && <ErrorState error={error} text={text} />}

        {!isLoading && !error && (
          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                  {text("savedHistory", "Saved history")}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
                  {text("completedInjectionLogs", "Completed injection logs")}
                </h2>
              </div>
            </div>

            {logs.length === 0 ? (
              <EmptyState text={text} />
            ) : (
              <div className="grid gap-4">
                {logs.map((log) => (
                  <HistoryLogCard
                    key={log.id}
                    log={log}
                    isDeleting={isDeletingId === log.id}
                    onDelete={handleDelete}
                    text={text}
                    language={language}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-6">
          <SafetyNote text={text} />
        </div>
      </section>
    </main>
  );
}