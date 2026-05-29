import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";
import { getGlossaryTerms } from "../features/glossary/glossaryApi";

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

const CATEGORY_OPTIONS = ["safety", "record", "insulin", "reminder", "user"];

function getCategoryLabel(category, language) {
  const labels = {
    en: {
      safety: "Safety",
      record: "Record",
      insulin: "Insulin",
      reminder: "Reminder",
      user: "User",
    },
    id: {
      safety: "Keselamatan",
      record: "Catatan",
      insulin: "Insulin",
      reminder: "Pengingat",
      user: "Pengguna",
    },
  };

  return labels[language]?.[category] || category;
}

function CategoryBadge({ category, language }) {
  return (
    <span className="inline-flex rounded-full border border-[#B8C9D9] bg-[#EAF2F8] px-3 py-1 text-xs font-semibold text-[#1F4E79]">
      {getCategoryLabel(category, language)}
    </span>
  );
}

function GlossaryCard({ item, language }) {
  return (
    <article className="rounded-3xl border border-[#D9E2EC] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-xl font-bold text-[#102A43]">{item.term}</h2>

        <CategoryBadge category={item.category} language={language} />
      </div>

      <p className="mt-3 text-sm leading-6 text-[#486581]">
        {item.definition}
      </p>
    </article>
  );
}

function SafetyNote({ text }) {
  return (
    <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
      <h2 className="font-bold text-[#8A5A00]">
        {text("safetyNote", "Safety note")}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
        {text(
          "glossarySafetyNote",
          "This glossary is only for understanding terms used in InsuTrack. It is not medical advice."
        )}
      </p>
    </div>
  );
}

export default function GlossaryPage() {
  const { t, language } = useLanguage();

  function text(key, fallback) {
    return t?.[key] || fallback;
  }

  const [terms, setTerms] = useState([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadGlossary() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getGlossaryTerms({
          language,
          category,
          query,
        });

        if (shouldIgnore) return;

        setTerms(data.results || []);
        setDisclaimer(data.disclaimer || "");
      } catch {
        if (shouldIgnore) return;

        setError(
          t?.glossaryLoadError ||
            "Could not load glossary terms. Please try again."
        );
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    loadGlossary();

    return () => {
      shouldIgnore = true;
    };
  }, [language, category, query, t]);

  function clearFilters() {
    setCategory("");
    setQuery("");
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] p-4 text-[#102A43] sm:p-6">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#1F4E79] underline-offset-4 hover:underline"
          >
            ← {text("backToDashboard", "Back to dashboard")}
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <LanguageSwitcher />

            <Link
              to="/pre-check"
              className="rounded-xl bg-[#1F4E79] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#173F63]"
            >
              {text("runCheck", "Run check")}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#D9E2EC] bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#EAF2F8] via-white to-[#E8F7F5] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1F4E79]">
              {text("appName", "InsuTrack")}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
              {text("glossaryTitle", "Glossary")}
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[#486581]">
              {text(
                "glossarySubtitle",
                "Learn the meaning of important terms used in InsuTrack, including insulin logging, safety checks, reminders, and warning messages."
              )}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#B8C9D9] bg-white/80 p-5">
                <p className="text-sm font-bold text-[#1F4E79]">
                  {text("understandTerms", "Understand terms")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  {text(
                    "understandTermsText",
                    "Review simple explanations for words used across the app."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#BFE7E1] bg-[#E8F7F5] p-5">
                <p className="text-sm font-bold text-[#24786E]">
                  {text("bilingualSupport", "Bilingual support")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#246B63]">
                  {text(
                    "bilingualSupportText",
                    "The glossary follows your selected language."
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5">
                <p className="text-sm font-bold text-[#8A5A00]">
                  {text("notMedicalAdvice", "Not medical advice")}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#8A5A00]">
                  {text(
                    "notMedicalAdviceText",
                    "The glossary explains app terms only. Follow your clinician's instructions."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_240px_auto] md:items-end">
            <div>
              <label className="block text-sm font-bold text-[#102A43]">
                {text("searchGlossary", "Search glossary")}
              </label>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition placeholder:text-[#9FB3C8] focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
                type="text"
                placeholder={text("searchGlossaryPlaceholder", "Search insulin, reminder, safety...")}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#102A43]">
                {text("category", "Category")}
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 text-[#102A43] outline-none transition focus:border-[#1F4E79] focus:ring-4 focus:ring-[#EAF2F8]"
              >
                <option value="">
                  {text("allCategories", "All categories")}
                </option>

                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {getCategoryLabel(item, language)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-[#B8C9D9] bg-white px-4 py-3 text-sm font-semibold text-[#1F4E79] shadow-sm transition hover:bg-[#EAF2F8]"
            >
              {text("clearFilters", "Clear filters")}
            </button>
          </div>
        </section>

        {isLoading && (
          <div className="mt-6 rounded-3xl border border-[#D9E2EC] bg-white p-5 text-[#627D98] shadow-sm">
            {text("loadingGlossary", "Loading glossary...")}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-[#FDECEC] p-5 text-red-700">
            <h2 className="font-bold">
              {text("glossaryError", "Glossary error")}
            </h2>

            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#627D98]">
                  {text("glossaryResults", "Glossary results")}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
                  {terms.length} {text("termsFound", "terms found")}
                </h2>
              </div>
            </div>

            {terms.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#C9D8E6] bg-white p-6 text-center">
                <h2 className="text-lg font-bold text-[#102A43]">
                  {text("noGlossaryTermsFound", "No glossary terms found")}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  {text(
                    "noGlossaryTermsFoundText",
                    "Try another search keyword or category."
                  )}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {terms.map((item) => (
                  <GlossaryCard
                    key={item.key}
                    item={item}
                    language={language}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {disclaimer && (
          <div className="mt-6 rounded-3xl border border-[#F6D365] bg-[#FFF8E1] p-5 text-sm leading-6 text-[#8A5A00]">
            {disclaimer}
          </div>
        )}

        <div className="mt-6">
          <SafetyNote text={text} />
        </div>
      </section>
    </main>
  );
}