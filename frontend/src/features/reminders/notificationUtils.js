export function browserNotificationsSupported() {
  return "Notification" in window;
}

export async function requestMealReminderNotificationPermission() {
  if (!browserNotificationsSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return await Notification.requestPermission();
}

export function showMealReminderNotification() {
  if (!browserNotificationsSupported()) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  new Notification("InsuTrack meal reminder", {
    body: "Personal routine reminder only. Follow your clinician's instructions.",
    tag: "insutrack-meal-reminder",
  });

  return true;
}

export function scheduleMealReminderNotification(reminder) {
  if (!reminder?.remind_at) {
    return null;
  }

  const remindAtTime = new Date(reminder.remind_at).getTime();
  const delay = remindAtTime - Date.now();

  if (Number.isNaN(remindAtTime)) {
    return null;
  }

  if (delay <= 0) {
    showMealReminderNotification();
    return null;
  }

  const timeoutId = window.setTimeout(() => {
    showMealReminderNotification();
  }, delay);

  return timeoutId;
}