import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3 py-2 text-sm shadow-sm">
      <span className="font-semibold text-[#627D98]">{t.language}</span>

      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="bg-white font-semibold text-[#1F4E79] outline-none"
        aria-label={t.language}
      >
        <option value="en">{t.english}</option>
        <option value="id">{t.indonesian}</option>
      </select>
    </div>
  );
}