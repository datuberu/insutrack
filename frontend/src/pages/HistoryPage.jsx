import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInjectionLogs,
  deleteInjectionLog,
} from "../features/injections/injectionApi";

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
      setLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
    } catch {
      setError("Could not delete this injection log.");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 underline"
          >
            ← Back to dashboard
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/pre-check"
              className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white"
            >
              Pre-check
            </Link>

            <Link
              to="/log-injection"
              className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700"
            >
              Log injection
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">InsuTrack</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Injection history
          </h1>

          <p className="mt-2 text-slate-600">
            Review, edit, or delete previously recorded insulin logs.
          </p>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-2xl border bg-white p-5 text-slate-600">
            Loading history...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p>{error}</p>

            <Link
              to="/login"
              className="mt-3 inline-block rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white"
            >
              Go to login
            </Link>
          </div>
        )}

        {!isLoading && !error && (
          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-600">No injection logs yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getInsulinTypeLabel(log.insulin_type)}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {log.dose_units} units · recorded by{" "}
                          {log.recorded_by_name}
                        </p>
                      </div>

                      <p className="text-sm text-slate-500">
                        {formatDateTime(log.injected_at)}
                      </p>
                    </div>

                    {log.notes && (
                      <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        {log.notes}
                      </p>
                    )}

                    {log.duplicate_risk_flag && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Possible duplicate risk was flagged for this log.
                      </div>
                    )}

                    {log.override_reason && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <span className="font-medium">Override reason:</span>{" "}
                        {log.override_reason}
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        to={`/edit-injection/${log.id}`}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        disabled={isDeletingId === log.id}
                        className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                      >
                        {isDeletingId === log.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Safety note</h2>

          <p className="mt-1 text-sm text-amber-800">
            InsuTrack is a logging and routine-check tool only. Follow your
            clinician&apos;s instructions.
          </p>
        </div>
      </section>
    </main>
  );
}