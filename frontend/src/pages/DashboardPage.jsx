import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../features/dashboard/dashboardApi";
import { scheduleMealReminderNotification } from "../features/reminders/notificationUtils";

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


function getInsulinTagStyle(insulinType) {
  if (insulinType === "RAPID_ACTING") {
    return "border-[#BFDBFE] bg-[#DBEAFE] text-[#1D4ED8]";
  }

  if (insulinType === "LONG_ACTING") {
    return "border-[#DDD6FE] bg-[#EDE9FE] text-[#6D28D9]";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function ActionCard({
  to,
  eyebrow,
  title,
  description,
  variant = "secondary",
}) {
  if (variant === "primary") {
    return (
      <Link
        to={to}
        className="group rounded-3xl border border-[#1F4E79] bg-[#1F4E79] p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#173F63] hover:shadow-md"
      >
        <p className="text-sm font-medium text-blue-100">{eyebrow}</p>

        <h2 className="mt-2 text-xl font-bold">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-blue-50">{description}</p>

        <span className="mt-4 inline-flex text-sm font-semibold text-white underline-offset-4 group-hover:underline">
          Start here →
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group rounded-3xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#A7C5DC] hover:bg-[#F8FBFD] hover:shadow-md"
    >
      <p className="text-sm font-medium text-[#627D98]">{eyebrow}</p>

      <h2 className="mt-2 text-xl font-bold text-[#102A43]">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-[#627D98]">{description}</p>

      <span className="mt-4 inline-flex text-sm font-semibold text-[#1F4E79] underline-offset-4 group-hover:underline">
        Open →
      </span>
    </Link>
  );
}

function InsulinSummaryCard({ insulinType, title, log, emptyText }) {
  return (
    <div className="rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
              insulinType
            )}`}
          >
            {title}
          </span>

          <h2 className="mt-4 text-lg font-bold text-[#102A43]">
            Latest completed log
          </h2>
        </div>

        {log?.duplicate_risk_flag && (
          <span className="inline-flex w-fit rounded-full border border-[#F6D365] bg-[#FFF8E1] px-3 py-1 text-xs font-semibold text-[#9A6B00]">
            Duplicate risk flagged
          </span>
        )}
      </div>

      {!log ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#C9D8E6] bg-[#F7FAFC] p-5">
          <p className="text-sm leading-6 text-[#627D98]">{emptyText}</p>

          <Link
            to="/log-injection"
            className="mt-4 inline-flex rounded-xl bg-[#1F4E79] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#173F63]"
          >
            Log completed injection
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 text-sm text-[#243B53]">
          <div className="rounded-2xl bg-[#F7FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#627D98]">
              Dose
            </p>

            <p className="mt-1 text-base font-bold text-[#102A43]">
              {log.dose_units} units
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F7FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#627D98]">
                Injected at
              </p>

              <p className="mt-1 font-medium text-[#102A43]">
                {formatDateTime(log.injected_at)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#627D98]">
                Recorded by
              </p>

              <p className="mt-1 font-medium text-[#102A43]">
                {log.recorded_by_name}
              </p>
            </div>
          </div>

          {log.duplicate_risk_flag && (
            <div className="rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-4 text-[#8A5A00]">
              This log was saved with possible duplicate risk.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MealReminderCard({ reminder }) {
  if (!reminder) return null;

  return (
    <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#24786E]">
            Routine reminder
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#124E47]">
            Upcoming meal reminder
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#246B63]">
            Personal routine reminder only. Follow your clinician&apos;s
            instructions.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-4 text-left md:min-w-56">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#24786E]">
            Reminder time
          </p>

          <p className="mt-1 text-base font-bold text-[#124E47]">
            {formatDateTime(reminder.remind_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SafetyNote() {
  return (
    <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
      <h2 className="font-bold text-[#8A5A00]">Safety note</h2>

      <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
        InsuTrack is a logging and routine-check tool only. Follow your
        clinician&apos;s instructions.
      </p>
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

  useEffect(() => {
  if (!summary?.upcoming_meal_reminder) {
    return;
  }

  scheduleMealReminderNotification(summary.upcoming_meal_reminder);
}, [summary?.upcoming_meal_reminder]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
      <section className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
                  InsuTrack
                </p>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
                  Injection safety dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
                  Review your latest insulin logs, run a pre-check, and record a
                  completed injection with a clear safety-first workflow.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-fit rounded-xl border border-[#B8C9D9] bg-white px-4 py-2 text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8]"
              >
                Logout
              </button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <ActionCard
                to="/pre-check"
                eyebrow="Recommended first"
                title="Pre-check"
                description="Check recent logs before recording another injection."
                variant="primary"
              />

              <ActionCard
                to="/log-injection"
                eyebrow="After injection"
                title="Log injection"
                description="Record an injection only after it has actually been completed."
              />

              <ActionCard
                to="/history"
                eyebrow="Review records"
                title="History"
                description="View, edit, or delete your saved injection logs."
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 text-[#627D98] shadow-sm">
            Loading dashboard...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
            <h2 className="font-bold">Dashboard error</h2>

            <p className="mt-1 text-sm">{error}</p>

            <Link
              to="/login"
              className="mt-4 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Go to login
            </Link>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                  Latest status
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
                  Latest completed logs
                </h2>
              </div>

              <Link
                to="/history"
                className="text-sm font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
              >
                View full history →
              </Link>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <InsulinSummaryCard
                insulinType="RAPID_ACTING"
                title="Rapid-acting insulin (bolus)"
                log={summary?.last_rapid_acting}
                emptyText="No rapid-acting insulin log yet."
              />

              <InsulinSummaryCard
                insulinType="LONG_ACTING"
                title="Long-acting insulin (basal)"
                log={summary?.last_long_acting}
                emptyText="No long-acting insulin log yet."
              />
            </div>

            <div className="mt-6">
              <MealReminderCard reminder={summary?.upcoming_meal_reminder} />
            </div>
          </>
        )}

        <div className="mt-6">
          <SafetyNote />
        </div>
      </section>
    </main>
  );
}