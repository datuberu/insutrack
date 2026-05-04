import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getInjectionLog,
  updateInjectionLog,
} from "../features/injections/injectionApi";

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function EditInjectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    insulin_type: "RAPID_ACTING",
    dose_units: "",
    injected_at: "",
    recorded_by_name: "",
    notes: "",
    override_reason: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadLog() {
      try {
        const data = await getInjectionLog(id);

        setForm({
          insulin_type: data.insulin_type,
          dose_units: data.dose_units,
          injected_at: toDateTimeLocal(data.injected_at),
          recorded_by_name: data.recorded_by_name || "",
          notes: data.notes || "",
          override_reason: data.override_reason || "",
        });
      } catch {
        setError("Could not load this injection log.");
      } finally {
        setIsLoading(false);
      }
    }

    loadLog();
  }, [id]);

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
    setIsSaving(true);

    try {
      const payload = {
        insulin_type: form.insulin_type,
        dose_units: Number(form.dose_units),
        injected_at: new Date(form.injected_at).toISOString(),
        recorded_by_name: form.recorded_by_name.trim(),
        notes: form.notes.trim(),
        override_reason: form.override_reason.trim(),
      };

      await updateInjectionLog(id, payload);
      navigate("/history");
    } catch {
      setError("Could not update the injection log. Please check your input.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-6">
          Loading injection log...
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            to="/history"
            className="text-sm font-medium text-slate-600 underline"
          >
            ← Back to history
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">InsuTrack</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Edit injection log
          </h1>

          <p className="mt-2 text-slate-600">
            Update a previously recorded injection log.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
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
                onChange={handleChange}
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Override reason
              </label>

              <textarea
                name="override_reason"
                value={form.override_reason}
                onChange={handleChange}
                className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2"
                placeholder="Optional unless this log was flagged as duplicate."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </main>
  );
}