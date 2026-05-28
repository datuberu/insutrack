import AppRouter from "./routes/AppRouter";
import MealReminderAlarm from "./components/MealReminderAlarm";
import { LanguageProvider } from "./i18n/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <AppRouter />
      <MealReminderAlarm />
    </LanguageProvider>
  );
}