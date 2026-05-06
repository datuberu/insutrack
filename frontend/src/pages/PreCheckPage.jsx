import { useState } from "react";
import { Link } from "react-router-dom";
import { runPreCheck } from "../features/precheck/precheckApi";

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

export default function PreCheckPage() {
  const [insulinType, setInsulinType] = useState("RAPID_ACTING");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const data = await runPreCheck({
        insulin_type: insulinType,
      });

      setResult(data);
    } catch {
      setError("Could not run pre-injection check. Please login again or try later.");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedInsulinLabel = getInsulinTypeLabel(insulinType);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 underline"
          >
            ← Back to dashboard
          </Link>

          <Link
            to="/history"
            className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View history
          </Link>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            InsuTrack
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Pre-injection check
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Check recent logs before recording another completed injection. This
            helps you review whether a similar insulin type was logged recently.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Which insulin type do you want to check?
            </label>

            <select
              value={insulinType}
              onChange={(event) => {
                setInsulinType(event.target.value);
                setResult(null);
                setError("");
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="RAPID_ACTING">Rapid-acting insulin (bolus)</option>
              <option value="LONG_ACTING">Long-acting insulin (basal)</option>
            </select>

            <p className="mt-2 text-sm text-slate-500">
              Selected:{" "}
              <span className="font-medium text-slate-700">
                {selectedInsulinLabel}
              </span>
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Safety note</h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              InsuTrack is a logging and routine-check tool only. It does not
              decide whether you should inject, calculate doses, or provide
              medical advice. Follow your clinician&apos;s instructions.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Checking..." : "Run pre-injection check"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <h2 className="font-semibold">Check failed</h2>

            <p className="mt-1 text-sm">{error}</p>

            <Link
              to="/login"
              className="mt-4 inline-block rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white"
            >
              Go to login
            </Link>
          </div>
        )}

        {result && result.status === "safe" && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Safe check result
            </p>

            <h2 className="mt-1 text-xl font-semibold text-green-950">
              No recent matching log found
            </h2>

            <p className="mt-2 text-sm leading-6 text-green-800">
              {result.message}
            </p>

            <div className="mt-4 rounded-xl border border-green-200 bg-white p-4 text-sm text-slate-700">
              This means InsuTrack did not find a recent saved log for{" "}
              <span className="font-medium">{selectedInsulinLabel}</span> inside
              the duplicate-check window. This is not medical advice.
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/log-injection"
                className="rounded-xl bg-green-700 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Continue to log completed injection
              </Link>

              <Link
                to="/dashboard"
                className="rounded-xl border border-green-300 px-4 py-2 text-center text-sm font-medium text-green-800"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}

        {result && result.status === "caution" && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Caution
            </p>

            <h2 className="mt-1 text-xl font-semibold text-amber-950">
              Possible duplicate detected
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              {result.message}
            </p>

            {result.last_injection && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-700">
                <h3 className="font-semibold text-slate-900">
                  Last matching log
                </h3>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {getInsulinTypeLabel(result.last_injection.insulin_type)}
                  </p>

                  <p>
                    <span className="font-medium">Dose:</span>{" "}
                    {result.last_injection.dose_units} units
                  </p>

                  <p>
                    <span className="font-medium">Injected at:</span>{" "}
                    {formatDateTime(result.last_injection.injected_at)}
                  </p>

                  <p>
                    <span className="font-medium">Recorded by:</span>{" "}
                    {result.last_injection.recorded_by_name}
                  </p>

                  {result.time_since_last_minutes !== null && (
                    <p className="sm:col-span-2">
                      <span className="font-medium">Time since last log:</span>{" "}
                      {result.time_since_last_minutes} minutes
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-100 p-4 text-sm leading-6 text-amber-950">
              Review your actual routine carefully before continuing. InsuTrack
              does not decide whether you should inject. If you already completed
              another injection and need to save it, the log page will require an
              override reason.
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/log-injection"
                className="rounded-xl bg-amber-700 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Continue to log if already completed
              </Link>

              <Link
                to="/history"
                className="rounded-xl border border-amber-300 px-4 py-2 text-center text-sm font-medium text-amber-900"
              >
                Review history
              </Link>

              <Link
                to="/dashboard"
                className="rounded-xl border border-amber-300 px-4 py-2 text-center text-sm font-medium text-amber-900"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}

        {!result && !error && (
          <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-slate-600 shadow-sm">
            Run the check to see whether there is a recent matching log for{" "}
            <span className="font-medium text-slate-900">
              {selectedInsulinLabel}
            </span>
            .
          </div>
        )}
      </section>
    </main>
  );
}