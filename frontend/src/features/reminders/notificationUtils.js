let reminderAudioContext = null;
const scheduledReminderIds = new Map();
let isReminderShowing = false;

export async function unlockReminderSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return false;
    }

    if (!reminderAudioContext) {
      reminderAudioContext = new AudioContext();
    }

    if (reminderAudioContext.state === "suspended") {
      await reminderAudioContext.resume();
    }

    // Tiny silent tone during the Save reminder click.
    // This helps unlock browser audio before the timer finishes.
    const oscillator = reminderAudioContext.createOscillator();
    const gainNode = reminderAudioContext.createGain();

    gainNode.gain.setValueAtTime(0.0001, reminderAudioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(reminderAudioContext.destination);

    oscillator.start();
    oscillator.stop(reminderAudioContext.currentTime + 0.05);

    return reminderAudioContext.state === "running";
  } catch {
    return false;
  }
}

function playTone(frequency, startTime, duration, volume = 0.35) {
  if (!reminderAudioContext) return;

  const oscillator = reminderAudioContext.createOscillator();
  const gainNode = reminderAudioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(reminderAudioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export async function playReminderBeep() {
  try {
    if (!reminderAudioContext) {
      await unlockReminderSound();
    }

    if (!reminderAudioContext) {
      return false;
    }

    if (reminderAudioContext.state === "suspended") {
      await reminderAudioContext.resume();
    }

    const now = reminderAudioContext.currentTime;

    playTone(880, now, 0.6, 0.35);
    playTone(660, now + 0.7, 0.6, 0.35);
    playTone(880, now + 1.4, 0.6, 0.35);
    playTone(660, now + 2.1, 0.6, 0.35);

    return true;
  } catch {
    return false;
  }
}

export async function triggerMealReminderAlarm(onAlarm) {
  if (isReminderShowing) {
    return false;
  }

  isReminderShowing = true;

  await playReminderBeep();

  if (typeof onAlarm === "function") {
    onAlarm();
  }

  // fallback event for any page that wants to listen
  window.dispatchEvent(new CustomEvent("insutrack-meal-time"));

  return true;
}

export function finishMealReminderAlarm() {
  isReminderShowing = false;
}

export function scheduleMealReminderNotification(reminder, onAlarm) {
  if (!reminder?.remind_at) {
    return null;
  }

  const remindAtTime = new Date(reminder.remind_at).getTime();

  if (Number.isNaN(remindAtTime)) {
    return null;
  }

  const reminderKey = reminder.id
    ? String(reminder.id)
    : String(reminder.remind_at);

  if (scheduledReminderIds.has(reminderKey)) {
    return scheduledReminderIds.get(reminderKey);
  }

  const delay = remindAtTime - Date.now();

  if (delay <= 0) {
    triggerMealReminderAlarm(onAlarm);
    return null;
  }

  const timeoutId = window.setTimeout(() => {
    triggerMealReminderAlarm(onAlarm);
    scheduledReminderIds.delete(reminderKey);
  }, delay);

  scheduledReminderIds.set(reminderKey, timeoutId);

  return timeoutId;
}

export function clearScheduledMealReminder(reminder) {
  if (!reminder) return;

  const reminderKey = reminder.id
    ? String(reminder.id)
    : String(reminder.remind_at);

  const timeoutId = scheduledReminderIds.get(reminderKey);

  if (timeoutId) {
    window.clearTimeout(timeoutId);
    scheduledReminderIds.delete(reminderKey);
  }
}