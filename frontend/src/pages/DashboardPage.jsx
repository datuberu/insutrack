export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">InsuTrack</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Injection safety dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Check recent logs before injection and record completed injections.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Rapid-acting insulin (bolus)
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No recent log loaded yet.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Long-acting insulin (basal)
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No recent log loaded yet.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Safety note</h2>
          <p className="mt-1 text-sm text-amber-800">
            InsuTrack is a logging and routine-check tool only. Follow your clinician's instructions.
          </p>
        </div>
      </section>
    </main>
  );
}