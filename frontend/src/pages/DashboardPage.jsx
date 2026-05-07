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

  Success: #2F855A
  Soft success: #E6F6EC

  Danger: #E53E3E
  Soft danger: #FDECEC
*/

function formatDateTime(value) {
  if (!value) return "No time recorded";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ActionCard({
  to,
  eyebrow,
  title,
  description,
  actionLabel,
  variant = "secondary",
}) {
  if (variant === "primary") {
    return (
      <Link
        to={to}
        className="group rounded-3xl border border-[#1F4E79] bg-[#1F4E79] p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#173F63] hover:shadow-md"
      >
        <p className="text-sm font-semibold text-blue-100">{eyebrow}</p>

        <h2 className="mt-3 text-2xl font-bold">{title}</h2>

        <p className="mt-3 text-sm leading-6 text-blue-50">{description}</p>

        <span className="mt-5 inline-flex text-sm font-semibold text-white underline-offset-4 group-hover:underline">
          {actionLabel} →
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#A7C5DC] hover:bg-[#F8FBFD] hover:shadow-md"
    >
      <p className="text-sm font-semibold text-[#627D98]">{eyebrow}</p>

      <h2 className="mt-3 text-2xl font-bold text-[#102A43]">{title}</h2>

      <p className="mt-3 text-sm leading-6 text-[#627D98]">{description}</p>

      <span className="mt-5 inline-flex text-sm font-semibold text-[#1F4E79] underline-offset-4 group-hover:underline">
        {actionLabel} →
      </span>
    </Link>
  );
}

function WorkflowStep({ number, title, description, variant = "blue" }) {
  const styles = {
    blue: {
      wrapper: "border-[#B8C9D9] bg-white/80",
      badge: "bg-[#1F4E79] text-white",
      title: "text-[#1F4E79]",
      text: "text-[#627D98]",
    },
    teal: {
      wrapper: "border-[#BFE7E1] bg-[#E8F7F5]",
      badge: "bg-[#2A9D8F] text-white",
      title: "text-[#24786E]",
      text: "text-[#246B63]",
    },
    warning: {
      wrapper: "border-[#F6D365] bg-[#FFF8E1]",
      badge: "bg-[#D69E2E] text-white",
      title: "text-[#8A5A00]",
      text: "text-[#8A5A00]",
    },
  };

  const selected = styles[variant];

  return (
    <div className={`rounded-3xl border p-5 ${selected.wrapper}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${selected.badge}`}
        >
          {number}
        </div>

        <div>
          <p className={`text-sm font-bold ${selected.title}`}>{title}</p>

          <p className={`mt-2 text-sm leading-6 ${selected.text}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function MealReminderCard({ reminder }) {
  if (!reminder) return null;

  return (
    <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#24786E]">
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
          <p className="text-xs font-bold uppercase tracking-wide text-[#24786E]">
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
        InsuTrack is a logging and routine-check tool only. It does not decide
        whether you should inject, calculate doses, or provide medical advice.
        Follow your clinician&apos;s instructions.
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
        setError("Could not load reminder data. Please login again if your session expired.");
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
                  Choose the next step in your insulin logging workflow. Use
                  pre-injection check before injecting, log only completed injections, and
                  review detailed records in history.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-fit rounded-xl border border-[#B8C9D9] bg-white px-4 py-2 text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8]"
              >
                Logout
              </button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <ActionCard
                to="/pre-check"
                eyebrow="Before injection"
                title="Pre-injection check"
                description="Run a guided check to see whether a similar insulin type was logged recently."
                actionLabel="Run check"
                variant="primary"
              />

              <ActionCard
                to="/log-injection"
                eyebrow="After injection"
                title="Log injection"
                description="Record an injection only after it has actually been completed."
                actionLabel="Log completed injection"
              />

              <ActionCard
                to="/history"
                eyebrow="Review records"
                title="History"
                description="View, edit, or delete saved injection logs and review duplicate warning details."
                actionLabel="View history"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <WorkflowStep
            number="1"
            title="About to inject?"
            description="Start with pre-injection check."
            variant="blue"
          />

          <WorkflowStep
            number="2"
            title="Already completed?"
            description="Use the log page only after the injection has actually happened."
            variant="teal"
          />

          <WorkflowStep
            number="3"
            title="Need details?"
            description="Use history for the full timeline, edits, duplicate flags, and override reasons."
            variant="warning"
          />
        </div>

        {isLoading && (
          <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 text-[#627D98] shadow-sm">
            Checking active reminders...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
            <h2 className="font-bold">Dashboard notice</h2>

            <p className="mt-2 text-sm leading-6">{error}</p>

            <Link
              to="/login"
              className="mt-4 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Go to login
            </Link>
          </div>
        )}

        {!isLoading && !error && (
          <div className="mt-6">
            <MealReminderCard reminder={summary?.upcoming_meal_reminder} />
          </div>
        )}

        <div className="mt-6">
          <SafetyNote />
        </div>
      </section>
    </main>
  );
}