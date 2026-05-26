import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../features/auth/authApi";

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
*/

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
  setIsLoading(true);

  try {
    await registerUser(form);

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  } catch {
    setError("Registration failed. Try another username or check your input.");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-8 text-[#102A43]">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="mx-auto w-full max-w-md lg:order-1">
          <div className="mb-5 text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
              InsuTrack
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43]">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#627D98]">
              Start logging completed injections and reviewing recent records
              with a safety-first workflow.
            </p>
          </div>

          <section className="rounded-[2rem] border border-[#D9E2EC] bg-white p-6 shadow-sm sm:p-8">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-[#FDECEC] p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#102A43]">
                  Username
                </label>

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  type="text"
                  placeholder="Choose username"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#102A43]">
                  Email address
                </label>

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  type="email"
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#102A43]">
                  Password
                </label>

                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  type="password"
                  placeholder="Create password"
                  autoComplete="new-password"
                  required
                />

                <p className="mt-2 text-xs leading-5 text-[#627D98]">
                  Use a password you can remember. Keep your login private.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#1F4E79] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#173F63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A5A00]">
                Safety note
              </p>

              <p className="mt-1 text-sm leading-6 text-[#8A5A00]">
                InsuTrack is a logging and routine-check tool only. Follow your
                clinician&apos;s instructions.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-[#627D98]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </p>
          </section>
        </div>

        <div className="hidden lg:order-2 lg:block">
          <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
                Safety-first workflow
              </p>

              <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-[#102A43]">
                Built for clear manual insulin record keeping.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#486581]">
                InsuTrack helps users and caregivers review recent injection
                records before saving another completed log.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1F4E79] text-sm font-bold text-white">
                      1
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#1F4E79]">
                        Register and login
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#627D98]">
                        Each user can access their own protected dashboard and
                        saved injection logs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2A9D8F] text-sm font-bold text-white">
                      2
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#24786E]">
                        Check before logging
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#246B63]">
                        Pre-injection check helps review whether a similar insulin type
                        was logged recently.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D69E2E] text-sm font-bold text-white">
                      3
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#8A5A00]">
                        Record only completed injections
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                        The app supports logging and routine checks, not medical
                        dose decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}