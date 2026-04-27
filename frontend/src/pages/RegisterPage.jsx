export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm border">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start using InsuTrack for injection logging and safety checks.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="text"
              placeholder="Choose username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="email"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="password"
              placeholder="Create password"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-slate-900 px-4 py-2 font-medium text-white"
          >
            Register
          </button>
        </form>
      </section>
    </main>
  );
}
