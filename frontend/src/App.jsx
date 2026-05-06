import AppRouter from "./routes/AppRouter";
import MealReminderAlarm from "./components/MealReminderAlarm";

export default function App() {
  return (
    <>
      <AppRouter />
      <MealReminderAlarm />
    </>
  );
}