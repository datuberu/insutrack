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
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm font-medium text-slate-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">InsuTrack</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Pre-injection check
          </h1>

          <p className="mt-2 text-slate-600">
            Check your recent logs before injecting. This helps reduce the risk
            of accidentally logging or repeating the same insulin type too soon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Which insulin type are you about to check?
            </label>

            <select
              value={insulinType}
              onChange={(event) => setInsulinType(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="RAPID_ACTING">Rapid-acting insulin (bolus)</option>
              <option value="LONG_ACTING">Long-acting insulin (basal)</option>
            </select>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Safety note</h2>
            <p className="mt-1 text-sm text-amber-800">
              InsuTrack is a logging and routine-check tool only. It does not
              provide medical advice or dosing recommendations. Follow your
              clinician&apos;s instructions.
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
            <p>{error}</p>

            <Link
              to="/login"
              className="mt-3 inline-block rounded-xl bg-red-700 px-4 py-2 text-sm font-medium text-white"
            >
              Go to login
            </Link>
          </div>
        )}

        {result && result.status === "safe" && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-semibold text-green-900">
              No recent matching log found
            </h2>

            <p className="mt-2 text-sm text-green-800">
              {result.message}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/log-injection"
                className="rounded-xl bg-green-700 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Continue to log injection
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
            <h2 className="text-lg font-semibold text-amber-950">
              Possible duplicate detected
            </h2>

            <p className="mt-2 text-sm text-amber-900">
              {result.message}
            </p>

            {result.last_injection && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-700">
                <h3 className="font-semibold text-slate-900">
                  Last matching log
                </h3>

                <p className="mt-2">
                  <span className="font-medium">Type:</span>{" "}
                  {getInsulinTypeLabel(result.last_injection.insulin_type)}
                </p>

                <p className="mt-1">
                  <span className="font-medium">Dose:</span>{" "}
                  {result.last_injection.dose_units} units
                </p>

                <p className="mt-1">
                  <span className="font-medium">Injected at:</span>{" "}
                  {formatDateTime(result.last_injection.injected_at)}
                </p>

                <p className="mt-1">
                  <span className="font-medium">Recorded by:</span>{" "}
                  {result.last_injection.recorded_by_name}
                </p>

                {result.time_since_last_minutes !== null && (
                  <p className="mt-1">
                    <span className="font-medium">Time since last log:</span>{" "}
                    {result.time_since_last_minutes} minutes
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-100 p-4 text-sm text-amber-950">
              Review your actual routine carefully before continuing. This app
              does not decide whether you should inject.
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/log-injection"
                className="rounded-xl bg-amber-700 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Continue to log if already injected
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
          <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-slate-600">
            Selected: <span className="font-medium">{selectedInsulinLabel}</span>
          </div>
        )}
      </section>
    </main>
  );
}