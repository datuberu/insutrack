import { useState } from "react";
import { Link } from "react-router-dom";
import { runPreCheck } from "../features/precheck/precheckApi";

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

  return "border-slate-200 bg-slate-100 text-slate-700";
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
    <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
          >
            ← Back to dashboard
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/history"
              className="rounded-xl border border-[#B8C9D9] bg-white px-4 py-2 text-center text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8]"
            >
              View history
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
              InsuTrack
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
              Pre-injection check
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
              Review recent logs before recording another completed injection.
              This helps you check whether a similar insulin type was logged
              recently.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                <p className="text-sm font-bold text-[#1F4E79]">
                  1. Choose insulin
                </p>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  Select rapid-acting or long-acting insulin.
                </p>
              </div>

              <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                <p className="text-sm font-bold text-[#24786E]">
                  2. Run check
                </p>

                <p className="mt-2 text-sm leading-6 text-[#246B63]">
                  InsuTrack checks your recent saved logs.
                </p>
              </div>

              <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                <p className="text-sm font-bold text-[#8A5A00]">
                  3. Review result
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  Safe means no matching recent log was found. Caution means
                  review carefully.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="block text-sm font-bold text-[#102A43]">
                Which insulin type do you want to check?
              </label>

              <select
                value={insulinType}
                onChange={(event) => {
                  setInsulinType(event.target.value);
                  setResult(null);
                  setError("");
                }}
                className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
              >
                <option value="RAPID_ACTING">Rapid-acting insulin (bolus)</option>
                <option value="LONG_ACTING">Long-acting insulin (basal)</option>
              </select>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                    insulinType
                  )}`}
                >
                  Selected: {selectedInsulinLabel}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-[#1F4E79] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#173F63] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Checking..." : "Run check"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
            <h2 className="font-bold">Check failed</h2>

            <p className="mt-2 text-sm leading-6">{error}</p>

            <Link
              to="/login"
              className="mt-4 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Go to login
            </Link>
          </div>
        )}

        {result && result.status === "safe" && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#B7E4C7] bg-white shadow-sm">
            <div className="bg-[#E6F6EC] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#2F855A]">
                Safe check result
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#174A31]">
                No recent matching log found
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#2F855A]">
                {result.message}
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-[#B7E4C7] bg-[#F7FAFC] p-5 text-sm leading-6 text-[#486581]">
                InsuTrack did not find a recent saved log for{" "}
                <span className="font-bold text-[#102A43]">
                  {selectedInsulinLabel}
                </span>{" "}
                inside the safety-check time window. This is not medical advice.
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/log-injection"
                  className="rounded-xl bg-[#2F855A] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#276749]"
                >
                  Continue to log completed injection
                </Link>

                <Link
                  to="/dashboard"
                  className="rounded-xl border border-[#B7E4C7] bg-white px-4 py-3 text-center text-sm font-semibold text-[#2F855A] transition hover:bg-[#E6F6EC]"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {result && result.status === "caution" && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#F6D365] bg-white shadow-sm">
            <div className="bg-[#FFF8E1] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8A5A00]">
                Caution
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#8A5A00]">
                Injection time is too close to a recent log
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8A5A00]">
                {result.message}
              </p>
            </div>

            <div className="p-6">
              {result.last_injection && (
                <div className="rounded-3xl border border-[#D9E2EC] bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-[#627D98]">
                        Last matching log
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getInsulinTagStyle(
                          result.last_injection.insulin_type
                        )}`}
                      >
                        {getInsulinTypeLabel(result.last_injection.insulin_type)}
                      </span>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-[#F6D365] bg-[#FFF8E1] px-3 py-1 text-xs font-semibold text-[#8A5A00]">
                      Review carefully
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DetailItem
                      label="Dose"
                      value={`${result.last_injection.dose_units} units`}
                    />

                    <DetailItem
                      label="Injected at"
                      value={formatDateTime(result.last_injection.injected_at)}
                    />

                    <DetailItem
                      label="Recorded by"
                      value={result.last_injection.recorded_by_name}
                    />

                    {result.time_since_last_minutes !== null && (
                      <DetailItem
                        label="Time since last log"
                        value={`${result.time_since_last_minutes} minutes`}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-5 text-sm leading-6 text-[#8A5A00]">
                Review your actual routine carefully before continuing.
                InsuTrack does not decide whether you should inject. If you already completed another injection and need to save it, the log
                page will require a reason because the injection time is close to a previous log.
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/log-injection"
                  state={{
                    duplicateWarning: result,
                    insulinType,
                  }}
                  className="rounded-xl bg-[#D69E2E] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#B7791F]"
                >
                  Continue if already completed
              </Link>

                <Link
                  to="/history"
                  className="rounded-xl border border-[#F6D365] bg-white px-4 py-3 text-center text-sm font-semibold text-[#8A5A00] transition hover:bg-[#FFF8E1]"
                >
                  Review history
                </Link>

                <Link
                  to="/dashboard"
                  className="rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-center text-sm font-semibold text-[#1F4E79] transition hover:bg-[#EAF2F8]"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {!result && !error && (
          <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 text-sm leading-6 text-[#627D98] shadow-sm">
            Run the check to see whether there is a recent matching log for{" "}
            <span className="font-bold text-[#102A43]">
              {selectedInsulinLabel}
            </span>
            .
          </div>
        )}

        <div className="mt-6">
          <SafetyNote />
        </div>
      </section>
    </main>
  );
}