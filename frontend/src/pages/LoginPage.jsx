import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authApi";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";

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
  const { t } = useLanguage();

  const queryParams = new URLSearchParams(location.search);

  const registrationSuccessFromUrl = queryParams.get("registered") === "1";
  const usernameFromUrl = queryParams.get("username") || "";

  const registrationSuccessFromState = Boolean(
    location.state?.registrationSuccess
  );
  const usernameFromState = location.state?.username || "";

  const registrationSuccessFromStorage =
    sessionStorage.getItem("registration_success") === "true";
  const usernameFromStorage =
    sessionStorage.getItem("registered_username") || "";

  const registrationSuccess =
    registrationSuccessFromUrl ||
    registrationSuccessFromState ||
    registrationSuccessFromStorage;

  const registeredUsername =
    usernameFromUrl || usernameFromState || usernameFromStorage;

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

      sessionStorage.removeItem("registration_success");
      sessionStorage.removeItem("registered_username");

      navigate("/dashboard");
    } catch {
      setError(t.loginFailed);
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
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
                  {t.appName}
                </p>

                <LanguageSwitcher />
              </div>

              <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-[#102A43]">
                {t.loginHeroTitle}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#486581]">
                {t.loginHeroSubtitle}
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                  <p className="text-sm font-bold text-[#1F4E79]">
                    {t.preInjectionCheck}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#627D98]">
                    {t.preInjectionCheckShort}
                  </p>
                </div>

                <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                  <p className="text-sm font-bold text-[#24786E]">
                    {t.mealReminder}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#246B63]">
                    {t.routineReminderOnly}
                  </p>
                </div>

                <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                  <p className="text-sm font-bold text-[#8A5A00]">
                    {t.safetyNote}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                    {t.appDoesNotCalculate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 text-center lg:text-left">
            <div className="mb-4 flex justify-center lg:hidden">
              <LanguageSwitcher />
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
              {t.appName}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43]">
              {t.loginTitle}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#627D98]">
              {t.loginSubtitle}
            </p>
          </div>

          <section className="rounded-[2rem] border border-[#D9E2EC] bg-white p-6 shadow-sm sm:p-8">
            {registrationSuccess && (
              <div className="mb-5 rounded-2xl border border-[#B7E4C7] bg-[#E6F6EC] p-4 text-sm leading-6 text-[#2F855A]">
                <p className="font-bold">{t.accountCreated}</p>

                <p className="mt-1">{t.loginAfterRegister}</p>
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
                  {t.username}
                </label>

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  type="text"
                  placeholder={t.enterUsername}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#102A43]">
                  {t.password}
                </label>

                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                  type="password"
                  placeholder={t.enterPassword}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#1F4E79] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#173F63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? t.loggingIn : t.login}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#F6D365] bg-[#FFF8E1] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A5A00]">
                {t.safetyNote}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#8A5A00]">
                {t.safetyNoteText}
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-[#627D98]">
              {t.noAccount}{" "}
              <Link
                to="/register"
                className="font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
              >
                {t.createOne}
              </Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}