import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authApi";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;
  const registeredUsername = location.state?.username || "";

  const [form, setForm] = useState({
  username: registeredUsername,
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
      const data = await loginUser(form);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      navigate("/dashboard");
    } catch {
      setError("Login failed. Please check your username and password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] px-4 py-8 text-[#102A43]">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
                InsuTrack
              </p>

              <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-[#102A43]">
                Safety-first insulin logging and routine checking.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#486581]">
                InsuTrack helps keep manual insulin routines clearer for users
                and caregivers.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                  <p className="text-sm font-bold text-[#1F4E79]">
                    Pre-injection check
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#627D98]">
                    Check recent logs before recording another completed
                    injection.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                  <p className="text-sm font-bold text-[#24786E]">
                    Meal reminder
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#246B63]">
                    Personal routine reminder only. Follow your clinician&apos;s
                    instructions.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                  <p className="text-sm font-bold text-[#8A5A00]">
                    Safety note
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                    This app does not calculate doses or provide medical advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
              InsuTrack
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#627D98]">
              Login to access your dashboard and injection history.
            </p>
          </div>

          <section className="rounded-[2rem] border border-[#D9E2EC] bg-white p-6 shadow-sm sm:p-8">
            {registrationSuccess && (
              <div className="mb-5 rounded-2xl border border-[#B7E4C7] bg-[#E6F6EC] p-4 text-sm leading-6 text-[#2F855A]">
                <p className="font-bold">Account created successfully.</p>
                <p className="mt-1">
                  Please log in with your username and password to continue.
            </p>
              </div>
            </div>
          )}

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
                  placeholder="Enter username"
                  autoComplete="username"
                  required
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
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#1F4E79] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#173F63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Logging in..." : "Login"}
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
              No account yet?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}