import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../features/dashboard/dashboardApi";

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

function InsulinSummaryCard({ title, log }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      {!log ? (
        <p className="mt-2 text-sm text-slate-600">No recent log loaded yet.</p>
      ) : (
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Dose:</span> {log.dose_units} units
          </p>

          <p>
            <span className="font-medium">Injected at:</span>{" "}
            {formatDateTime(log.injected_at)}
          </p>

          <p>
            <span className="font-medium">Recorded by:</span>{" "}
            {log.recorded_by_name}
          </p>

          {log.duplicate_risk_flag && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
              Possible duplicate risk was flagged for this log.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch {
        setError("Could not load dashboard data. Please login again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">InsuTrack</p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Injection safety dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Check recent logs before injection and record completed injections.
            </p>
          </div>

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

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-2xl border bg-white p-5 text-slate-600">
            Loading dashboard...
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
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InsulinSummaryCard
                title="Rapid-acting insulin (bolus)"
                log={summary?.last_rapid_acting}
              />

              <InsulinSummaryCard
                title="Long-acting insulin (basal)"
                log={summary?.last_long_acting}
              />
            </div>

            {summary?.upcoming_meal_reminder && (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <h2 className="font-semibold text-sky-900">
                  Upcoming meal reminder
                </h2>

                <p className="mt-1 text-sm text-sky-800">
                  Reminder time:{" "}
                  {formatDateTime(summary.upcoming_meal_reminder.remind_at)}
                </p>

                <p className="mt-1 text-xs text-sky-700">
                  Personal routine reminder only — follow your clinician&apos;s
                  instructions.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent history
              </h2>

              {summary?.recent_history?.length ? (
                <div className="mt-4 space-y-3">
                  {summary.recent_history.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-200 p-4 text-sm"
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <p className="font-medium text-slate-900">
                          {getInsulinTypeLabel(log.insulin_type)}
                        </p>

                        <p className="text-slate-500">
                          {formatDateTime(log.injected_at)}
                        </p>
                      </div>

                      <p className="mt-2 text-slate-700">
                        {log.dose_units} units · recorded by{" "}
                        {log.recorded_by_name}
                      </p>

                      {log.duplicate_risk_flag && (
                        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                          Possible duplicate risk was flagged.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  No injection history yet.
                </p>
              )}
            </div>
          </>
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