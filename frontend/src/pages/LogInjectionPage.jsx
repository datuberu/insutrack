import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInjectionLog } from "../features/injections/injectionApi";
import { runPreCheck } from "../features/precheck/precheckApi";

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

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

function getApiErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return "Could not save the injection log. Please check your input.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.override_reason)) {
    return data.override_reason[0];
  }

  if (typeof data.override_reason === "string") {
    return data.override_reason;
  }

  return "Could not save the injection log. Please check your input.";
}

export default function LogInjectionPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    insulin_type: "RAPID_ACTING",
    dose_units: "",
    injected_at: getCurrentDateTimeLocal(),
    recorded_by_name: "",
    notes: "",
    override_reason: "",
  });

  const [error, setError] = useState("");
  const [successLog, setSuccessLog] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
          "Please provide an override reason before saving this possible duplicate log."
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
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoToDashboard() {
    navigate("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-slate-600 underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">InsuTrack</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Log completed injection
          </h1>

          <p className="mt-2 text-slate-600">
            Record an injection only after it has actually been completed.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {successLog && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
            <h2 className="font-semibold">Injection log saved.</h2>

            {successLog.duplicate_risk_flag && (
              <p className="mt-2 text-sm">
                This log was flagged as a possible duplicate based on your recent
                history.
              </p>
            )}

            <button
              onClick={handleGoToDashboard}
              className="mt-4 rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white"
            >
              Go to dashboard
            </button>
          </div>
        )}

        {duplicateWarning && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-950">
              Possible duplicate detected
            </h2>

            <p className="mt-2 text-sm text-amber-900">
              A recent matching insulin log already exists. Review it carefully
              before saving another log.
            </p>

            {duplicateWarning.last_injection && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-700">
                <h3 className="font-semibold text-slate-900">
                  Last matching log
                </h3>

                <p className="mt-2">
                  <span className="font-medium">Type:</span>{" "}
                  {getInsulinTypeLabel(
                    duplicateWarning.last_injection.insulin_type
                  )}
                </p>

                <p className="mt-1">
                  <span className="font-medium">Dose:</span>{" "}
                  {duplicateWarning.last_injection.dose_units} units
                </p>

                <p className="mt-1">
                  <span className="font-medium">Injected at:</span>{" "}
                  {formatDateTime(duplicateWarning.last_injection.injected_at)}
                </p>

                <p className="mt-1">
                  <span className="font-medium">Recorded by:</span>{" "}
                  {duplicateWarning.last_injection.recorded_by_name}
                </p>

                {duplicateWarning.time_since_last_minutes !== null && (
                  <p className="mt-1">
                    <span className="font-medium">Time since last log:</span>{" "}
                    {duplicateWarning.time_since_last_minutes} minutes
                  </p>
                )}
              </div>
            )}

            <p className="mt-4 text-sm text-amber-900">
              If this injection was actually completed and you still need to save
              the log, enter an override reason below.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Insulin type
              </label>

              <select
                name="insulin_type"
                value={form.insulin_type}
                onChange={(event) => {
                  handleChange(event);
                  setDuplicateWarning(null);
                  setError("");
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                required
              >
                <option value="RAPID_ACTING">
                  Rapid-acting insulin (bolus)
                </option>
                <option value="LONG_ACTING">
                  Long-acting insulin (basal)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Dose units
              </label>

              <input
                name="dose_units"
                value={form.dose_units}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                min="1"
                placeholder="Example: 8"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Injection time
              </label>

              <input
                name="injected_at"
                value={form.injected_at}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="datetime-local"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Recorded by
              </label>

              <input
                name="recorded_by_name"
                value={form.recorded_by_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="text"
                placeholder="Example: Datu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Optional notes"
              />
            </div>

            {duplicateWarning && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Override reason
                </label>

                <textarea
                  name="override_reason"
                  value={form.override_reason}
                  onChange={handleChange}
                  className="mt-1 min-h-24 w-full rounded-xl border border-amber-300 px-3 py-2"
                  placeholder="Example: I checked with caregiver and this was a separate completed injection."
                  required
                />
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Safety note</h2>

            <p className="mt-1 text-sm text-amber-800">
              InsuTrack is a logging and routine-check tool only. Follow your
              clinician&apos;s instructions.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isLoading
              ? "Checking..."
              : duplicateWarning
                ? "Save with override reason"
                : "Check and save injection log"}
          </button>
        </form>
      </section>
    </main>
  );
}