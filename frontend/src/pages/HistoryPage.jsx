import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInjectionLogs,
  deleteInjectionLog,
} from "../features/injections/injectionApi";

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

function formatDateTime(value) {
  if (!value) return "No time recorded";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInsulinTypeLabel(insulinType) {
  if (insulinType === "RAPID_ACTING") {
    return "Rapid-acting insulin (bolus)";
  }

  if (insulinType === "LONG_ACTING") {
    return "Long-acting insulin (basal)";
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

function SafetyNote() {
  return (
    <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
      <h2 className="font-bold text-[#8A5A00]">Safety note</h2>

      <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
        InsuTrack is a logging and routine-check tool only. It does not decide
        whether you should inject, calculate doses, or provide medical advice.
        Follow your clinician&apos;s instructions.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 text-[#627D98] shadow-sm">
      Loading injection history...
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
      <h2 className="font-bold">History error</h2>

      <p className="mt-2 text-sm leading-6">{error}</p>

      <Link
        to="/login"
        className="mt-4 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
      >
        Go to login
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#C9D8E6] bg-[#F7FAFC] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2F8] text-xl">
        📝
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#102A43]">
        No injection logs yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#627D98]">
        After you record a completed injection, it will appear here for review,
        editing, or deletion.
      </p>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          to="/pre-check"
          className="rounded-xl bg-[#1F4E79] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63]"
        >
          Check before next log
        </Link>
      </div>
    </div>
  );
}

function HistoryLogCard({ log, isDeleting, onDelete }) {
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
              {getInsulinTypeLabel(log.insulin_type)}
            </span>

            {log.duplicate_risk_flag && (
              <span className="inline-flex rounded-full border border-[#F6D365] bg-[#FFF8E1] px-3 py-1 text-xs font-semibold text-[#8A5A00]">
                Duplicate risk flagged
              </span>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold text-[#102A43]">
            {log.dose_units} units
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#627D98]">
            Recorded by{" "}
            <span className="font-semibold text-[#102A43]">
              {log.recorded_by_name || "Unknown recorder"}
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7FAFC] px-4 py-3 text-left lg:min-w-56">
          <p className="text-xs font-bold uppercase tracking-wide text-[#627D98]">
            Injected at
          </p>

          <p className="mt-1 text-sm font-semibold text-[#102A43]">
            {formatDateTime(log.injected_at)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailItem label="Dose" value={`${log.dose_units} units`} />

        <DetailItem
          label="Injection time"
          value={formatDateTime(log.injected_at)}
        />

        <DetailItem
          label="Recorded by"
          value={log.recorded_by_name || "Unknown recorder"}
        />

        <DetailItem
          label="Status"
          value={
            log.duplicate_risk_flag
              ? "Saved with duplicate warning"
              : "Saved without duplicate warning"
          }
        />
      </div>

      {log.notes && (
        <div className="mt-4 rounded-2xl border border-[#D9E2EC] bg-[#F7FAFC] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#627D98]">
            Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-[#486581]">{log.notes}</p>
        </div>
      )}

      {log.duplicate_risk_flag && (
        <div className="mt-4 rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-4 text-sm leading-6 text-[#8A5A00]">
          Possible duplicate risk was flagged for this log. Review the injection
          details carefully when using this record as a reference.
        </div>
      )}

      {log.override_reason && (
        <div className="mt-4 rounded-2xl border border-[#BFE7E1] bg-[#E8F7F5] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#24786E]">
            Override reason
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
          Edit log
        </Link>

        <button
          type="button"
          onClick={() => onDelete(log.id)}
          disabled={isDeleting}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default function HistoryPage() {
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
        setError("Could not load injection history. Please login again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLogs();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this injection log?");

    if (!confirmed) return;

    setError("");
    setIsDeletingId(id);

    try {
      await deleteInjectionLog(id);

      setLogs((currentLogs) =>
        currentLogs.filter((currentLog) => currentLog.id !== id)
      );
    } catch {
      setError("Could not delete this injection log.");
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
            ← Back to dashboard
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/pre-check"
              className="rounded-xl bg-[#1F4E79] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63]"
            >
              Check before next log
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
                  InsuTrack
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
                  Injection history
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
                  Review, edit, or delete previously recorded insulin logs. Use
                  this page as a reference before logging another completed
                  injection.
                </p>
              </div>

              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5 lg:min-w-56">
                <p className="text-sm font-bold text-[#1F4E79]">
                  Saved records
                </p>

                <p className="mt-2 text-3xl font-bold text-[#102A43]">
                  {logs.length}
                </p>

                <p className="mt-1 text-sm leading-6 text-[#627D98]">
                  Total injection logs in this account.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                <p className="text-sm font-bold text-[#1F4E79]">
                  Review timeline
                </p>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  Check dose, time, recorder name, and notes from saved logs.
                </p>
              </div>

              <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                <p className="text-sm font-bold text-[#24786E]">
                  Keep records clean
                </p>

                <p className="mt-2 text-sm leading-6 text-[#246B63]">
                  Edit incorrect details or delete accidental entries.
                </p>
              </div>

              <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                <p className="text-sm font-bold text-[#8A5A00]">
                  Watch duplicate flags
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  Logs with duplicate warnings include their saved override
                  reason when available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading && <LoadingState />}

        {error && <ErrorState error={error} />}

        {!isLoading && !error && (
          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                  Saved history
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
                  Completed injection logs
                </h2>
              </div>
            </div>

            {logs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {logs.map((log) => (
                  <HistoryLogCard
                    key={log.id}
                    log={log}
                    isDeleting={isDeletingId === log.id}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-6">
          <SafetyNote />
        </div>
      </section>
    </main>
  );
}