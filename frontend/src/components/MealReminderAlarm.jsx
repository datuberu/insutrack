import { useEffect, useState } from "react";
import { finishMealReminderAlarm } from "../features/reminders/notificationUtils";

export default function MealReminderAlarm() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleMealTime() {
      setIsOpen(true);
    }

    window.addEventListener("insutrack-meal-time", handleMealTime);

    return () => {
      window.removeEventListener("insutrack-meal-time", handleMealTime);
    };
  }, []);

  function handleClose() {
    setIsOpen(false);
    finishMealReminderAlarm();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          InsuTrack reminder
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          Meal time
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Personal routine reminder only. Follow your clinician&apos;s
          instructions.
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          OK
        </button>
      </div>
    </div>
  );
}