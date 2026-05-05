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

function playReminderBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 1
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  } catch {
    // Some browsers block audio until user interaction.
  }
}

export function showMealReminderNotification() {
  playReminderBeep();

  window.alert(
    "InsuTrack meal reminder\n\nPersonal routine reminder only. Follow your clinician's instructions."
  );

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

  if (Number.isNaN(remindAtTime)) {
    return null;
  }

  const delay = remindAtTime - Date.now();

  if (delay <= 0) {
    showMealReminderNotification();
    return null;
  }

  const timeoutId = window.setTimeout(() => {
    showMealReminderNotification();
  }, delay);

  return timeoutId;
}