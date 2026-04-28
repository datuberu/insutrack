import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInjectionLog } from "../features/injections/injectionApi";

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function LogInjectionPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    insulin_type: "RAPID_ACTING",
    dose_units: "",
    injected_at: getCurrentDateTimeLocal(),
    recorded_by_name: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [successLog, setSuccessLog] = useState(null);
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
      const payload = {
        insulin_type: form.insulin_type,
        dose_units: Number(form.dose_units),
        injected_at: new Date(form.injected_at).toISOString(),
        recorded_by_name: form.recorded_by_name.trim(),
        notes: form.notes.trim(),
      };

      const savedLog = await createInjectionLog(payload);
      setSuccessLog(savedLog);
    } catch {
      setError("Could not save the injection log. Please check your input.");
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
          <Link to="/dashboard" className="text-sm font-medium text-slate-600 underline">
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
                This log was flagged as a possible duplicate based on your recent history.
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

        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Insulin type
              </label>
              <select
                name="insulin_type"
                value={form.insulin_type}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                required
              >
                <option value="RAPID_ACTING">Rapid-acting insulin (bolus)</option>
                <option value="LONG_ACTING">Long-acting insulin (basal)</option>
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
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Safety note</h2>
            <p className="mt-1 text-sm text-amber-800">
              InsuTrack is a logging and routine-check tool only. Follow your clinician&apos;s instructions.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save injection log"}
          </button>
        </form>
      </section>
    </main>
  );
}