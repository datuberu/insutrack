/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    language: "Language",
    english: "English",
    indonesian: "Indonesian",

    appName: "InsuTrack",

    // Auth shared
    username: "Username",
    password: "Password",
    email: "Email address",
    login: "Login",
    loggingIn: "Logging in...",
    logout: "Logout",
    loginFailed: "Login failed. Please check your username and password.",
    registerTitle: "Create your account",
    registerSubtitle:
      "Start logging completed injections and reviewing recent records with a safety-first workflow.",
    createAccount: "Create account",
    creatingAccount: "Creating account...",
    registrationFailed:
      "Registration failed. Try another username or check your input.",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "No account yet?",
    createOne: "Create one",
    chooseUsername: "Choose username",
    enterUsername: "Enter username",
    enterEmail: "Enter email address",
    createPassword: "Create password",
    enterPassword: "Enter password",
    passwordHelp: "Use a password you can remember. Keep your login private.",
    accountCreated: "Account created successfully.",
    loginAfterRegister:
      "Please log in with your username and password to continue.",

    // Login page
    loginTitle: "Welcome back",
    loginSubtitle: "Login to access your dashboard and injection history.",
    loginHeroTitle: "Safety-first insulin logging and routine checking.",
    loginHeroSubtitle:
      "InsuTrack helps keep manual insulin routines clearer for users and caregivers.",
    preInjectionCheckShort:
      "Check recent logs before recording another completed injection.",

    // Register page
    safetyFirstWorkflow: "Safety-first workflow",
    registerHeroTitle: "Built for clear manual insulin record keeping.",
    registerHeroSubtitle:
      "InsuTrack helps users and caregivers review recent injection records before saving another completed log.",
    registerAndLogin: "Register and login",
    registerAndLoginText:
      "Each user can access their own protected dashboard and saved injection logs.",
    checkBeforeLogging: "Check before logging",
    checkBeforeLoggingText:
      "Pre-injection check helps review whether a similar insulin type was logged recently.",
    recordOnlyCompleted: "Record only completed injections",
    recordOnlyCompletedText:
      "The app supports logging and routine checks, not medical dose decisions.",

    // Safety
    safetyNote: "Safety note",
    safetyNoteText:
      "InsuTrack is a logging and routine-check tool only. Follow your clinician's instructions.",
    fullSafetyNoteText:
      "InsuTrack is a logging and routine-check tool only. It does not decide whether you should inject, calculate doses, or provide medical advice. Follow your clinician's instructions.",
    appDoesNotCalculate:
      "This app does not calculate doses or provide medical advice.",

    // Dashboard
    dashboard: "Dashboard",
    dashboardTitle: "Injection safety dashboard",
    dashboardSubtitle:
      "Choose the next step in your insulin logging workflow. Use pre-injection check before injecting, log only completed injections, and review detailed records in history.",
    beforeInjection: "Before injection",
    afterInjection: "After injection",
    reviewRecords: "Review records",
    preInjectionCheck: "Pre-injection check",
    dashboardPreCheckDescription:
      "Run a guided check to see whether a similar insulin type was logged recently.",
    dashboardLogDescription:
      "Record an injection only after it has actually been completed.",
    dashboardHistoryDescription:
      "View, edit, or delete saved injection logs and review close injection-time warning details.",
    runCheck: "Run check",
    logInjection: "Log injection",
    logCompletedInjection: "Log completed injection",
    history: "History",
    viewHistory: "View history",
    aboutToInject: "About to inject?",
    aboutToInjectText: "Start with pre-injection check.",
    alreadyCompleted: "Already completed?",
    alreadyCompletedText:
      "Use the log page only after the injection has actually happened.",
    needDetails: "Need details?",
    needDetailsText:
      "Use history for the full timeline, edits, close injection-time flags, and saved reasons.",
    checkingActiveReminders: "Checking active reminders...",
    dashboardNotice: "Dashboard notice",
    dashboardLoadError:
      "Could not load reminder data. Please login again if your session expired.",
    goToLogin: "Go to login",
    routineReminder: "Routine reminder",
    upcomingMealReminder: "Upcoming meal reminder",
    reminderTime: "Reminder time",
    mealReminder: "Meal reminder",
    routineReminderOnly:
      "Personal routine reminder only. Follow your clinician's instructions.",

    // Edit injection page
    backToHistory: "Back to history",
    editInjectionTitle: "Edit injection log",
    editInjectionSubtitle:
      "Update a previously recorded insulin log. Keep the history accurate so future pre-injection checks and reviews are easier to understand.",
    currentRecord: "Current record",
    logId: "Log ID",
    reviewDetails: "Review details",
    reviewDetailsText:
      "Check the insulin type, dose, time, and recorder name.",
    correctMistakes: "Correct mistakes",
    correctMistakesText:
      "Update only the information that was entered incorrectly.",
    saveCarefully: "Save carefully",
    saveCarefullyText:
      "Edited logs may affect what you see in history and future safety checks.",
    editError: "Edit error",
    editLoadError: "Could not load this injection log.",
    editSaveError:
      "Could not update the injection log. Please check your input.",
    loadingInjectionLog: "Loading injection log...",
    originalSavedLog: "Original saved log",
    beforeEditing: "Before editing",
    injectionTimeTooClose: "Injection time too close",
    insulinType: "Insulin type",
    dose: "Dose",
    doseUnits: "Dose units",
    units: "units",
    injectedAt: "Injected at",
    injectionTime: "Injection time",
    recordedBy: "Recorded by",
    unknownRecorder: "Unknown recorder",
    closeInjectionTimeWarningDetails:
      "Close injection-time warning details",
    savedWithCloseTimeWarning:
      "This log was saved even though the injection time was too close",
    closeTimeReasonExplanation:
      "The reason field is shown because this specific record had a close injection-time warning when it was saved.",
    savedReason: "Saved reason",
    editDetails: "Edit details",
    injectionLogForm: "Injection log form",
    doseExample: "Example: 8",
    recordedByExample: "Example: Datu",
    notes: "Notes",
    optionalNotes: "Optional notes",
    reasonCloseTimeWarningLogWasSaved:
      "Reason this close injection-time warning log was saved",
    overrideReasonExample:
      "Example: I checked the previous log and this was a separate completed injection.",
    closeTimeReasonRequired:
      "Required because this saved record was marked as having an injection time too close to a previous log.",
    savingChanges: "Saving changes...",
    saveChanges: "Save changes",
    cancel: "Cancel",

    // History page
    backToDashboard: "Back to dashboard",
    loadingInjectionHistory: "Loading injection history...",
    historyError: "History error",
    historyLoadError: "Could not load injection history. Please login again.",
    noInjectionLogsYet: "No injection logs yet",
    noInjectionLogsYetText:
        "After you record a completed injection, it will appear here for review, editing, or deletion.",
    checkBeforeNextLog: "Check before next log",
    injectionHistory: "Injection history",
    injectionHistorySubtitle:
        "Review, edit, or delete previously recorded insulin logs. Use this page as a reference before logging another completed injection.",
    savedRecords: "Saved records",
    totalInjectionLogs: "Total injection logs in this account.",
    reviewTimeline: "Review timeline",
    reviewTimelineText:
        "Check dose, time, recorder name, and notes from saved logs.",
    keepRecordsClean: "Keep records clean",
    keepRecordsCleanText: "Edit incorrect details or delete accidental entries.",
    watchCloseTimeFlags: "Watch close-time flags",
    watchCloseTimeFlagsText:
        "Logs with close injection-time warnings include their saved reason when available.",
    savedHistory: "Saved history",
    completedInjectionLogs: "Completed injection logs",
    status: "Status",
    savedWithCloseInjectionTimeWarning:
        "Saved with close injection-time warning",
    savedWithoutCloseInjectionTimeWarning:
        "Saved without close injection-time warning",
    closeInjectionTimeFlagExplanation:
        "This log was flagged because the injection time was too close to a previous log. Review the injection details carefully when using this record as a reference.",
    editLog: "Edit log",
    delete: "Delete",
    deleting: "Deleting...",
    deleteInjectionLogConfirm: "Delete this injection log?",
    deleteInjectionLogError: "Could not delete this injection log.",

    // Log injection page
    logCompletedInjectionTitle: "Log completed injection",
    logCompletedInjectionSubtitle:
        "Record an injection only after it has actually been completed. The app checks recent logs first and asks for a reason if the injection time is too close to a previous log.",
    checkRecentLogs: "Check recent logs",
    checkRecentLogsText:
        "InsuTrack checks whether a similar insulin type was logged recently.",
    saveCompletedLog: "Save completed log",
    saveCompletedLogText: "Add dose, time, recorder name, and optional notes.",
    reviewWarnings: "Review warnings",
    reviewWarningsText:
        "If the injection time is too close, provide a reason before saving.",
    couldNotSaveLog: "Could not save log",
    saveInjectionLogError:
        "Could not save the injection log. Please check your input.",
    saved: "Saved",
    injectionLogSaved: "Injection log saved",
    savedWithCloseTimeWarningNotice:
        "This log was saved even though the injection time was too close to a previous log. The reason is saved in history.",
    goToDashboard: "Go to dashboard",
    setMealReminder: "Set meal reminder?",
    setMealReminderText:
        "This reminder is only for your personal routine. It is separate from the close-time safety check.",
    reminderTiming: "Reminder timing",
    minutes: "minutes",
    custom: "Custom",
    customMinutes: "Custom minutes",
    enterMinutes: "Enter minutes",
    savingReminder: "Saving reminder...",
    saveReminder: "Save reminder",
    skipReminder: "Skip reminder",
    mealReminderSaved: "Meal reminder saved",
    mealReminderSavedFor: "Meal reminder saved for",
    reminderOffsetError: "Reminder offset must be between 1 and 180 minutes.",
    saveMealReminderError: "Could not save meal reminder. Please try again.",
    caution: "Caution",
    injectionTimeTooCloseToRecentLog:
        "Injection time is too close to a recent log",
    closeTimeWarningDescription:
        "A recent matching insulin log already exists, so this injection time is close to a previous log. Review the last log carefully before saving another one.",
    lastMatchingLog: "Last matching log",
    reviewCarefully: "Review carefully",
    timeSinceLastLog: "Time since last log",
    enterReasonIfAlreadyCompleted:
        "If this injection was actually completed and you still need to save the log, enter a reason below.",
    injectionDetails: "Injection details",
    completedInjectionLog: "Completed injection log",
    recordedByExampleSelf: "Example: John (self)",
    reason: "Reason",
    reasonRequiredCloseTime:
        "Required because the injection time is too close to a previous log.",
    closeTimeReasonRequiredBeforeSaving:
        "Please provide a reason before saving this log because the injection time is too close to a previous log.",
    checking: "Checking...",
    saving: "Saving...",
    saveWithReason: "Save with reason",
    checkAndSaveInjectionLog: "Check and save injection log",
    logSafetyNoteText:
        "InsuTrack is a logging and routine-check tool only. It does not calculate doses or provide medical advice. Follow your clinician's instructions.",
    
    // Pre-injection check page
    preCheckSubtitle:
        "Review recent logs before recording another completed injection. This helps you check whether a similar insulin type was logged recently.",
    chooseInsulin: "Choose insulin",
    chooseInsulinText: "Select rapid-acting or long-acting insulin.",
    runCheckStepText: "InsuTrack checks your recent saved logs.",
    reviewResult: "Review result",
    reviewResultText:
        "Safe means no matching recent log was found. Caution means review carefully.",
    whichInsulinCheck: "Which insulin type do you want to check?",
    selected: "Selected",
    preCheckFailed: "Check failed",
    preCheckFailedText:
        "Could not run pre-injection check. Please login again or try later.",
    safeCheckResult: "Safe check result",
    noRecentMatchingLogFound: "No recent matching log found",
    safeCheckMessage:
        "No recent matching injection was found in the safety-check time window.",
    safeCheckDescriptionStart:
        "InsuTrack did not find a recent saved log for",
    safeCheckDescriptionEnd:
        "inside the safety-check time window. This is not medical advice.",
    continueToLogCompletedInjection: "Continue to log completed injection",
    preCheckCautionAdvice:
        "Review your actual routine carefully before continuing. InsuTrack does not decide whether you should inject. If you already completed another injection and need to save it, the log page will require a reason because the injection time is close to a previous log.",
    continueIfAlreadyCompleted: "Continue if already completed",
    reviewHistory: "Review history",
    runCheckPromptStart:
        "Run the check to see whether there is a recent matching log for",
    
    // Meal reminder alarm
    insutrackReminder: "InsuTrack reminder",
    mealTime: "Meal time",
    mealReminderAlarmDescription:
        "This is your personal routine reminder after a rapid-acting insulin log.",
    mealReminderAlarmSafetyText:
        "InsuTrack does not calculate doses, decide meal timing, or provide medical advice.",
    iUnderstand: "I understand",
    },

  id: {
    language: "Bahasa",
    english: "Inggris",
    indonesian: "Indonesia",

    appName: "InsuTrack",

    // Auth shared
    username: "Nama pengguna",
    password: "Kata sandi",
    email: "Alamat email",
    login: "Masuk",
    loggingIn: "Sedang masuk...",
    logout: "Keluar",
    loginFailed: "Gagal masuk. Periksa nama pengguna dan kata sandi Anda.",
    registerTitle: "Buat akun",
    registerSubtitle:
      "Mulai mencatat suntikan yang sudah dilakukan dan meninjau riwayat dengan alur yang mengutamakan keselamatan.",
    createAccount: "Buat akun",
    creatingAccount: "Sedang membuat akun...",
    registrationFailed:
      "Registrasi gagal. Coba nama pengguna lain atau periksa input Anda.",
    alreadyHaveAccount: "Sudah punya akun?",
    noAccount: "Belum punya akun?",
    createOne: "Buat akun",
    chooseUsername: "Pilih nama pengguna",
    enterUsername: "Masukkan nama pengguna",
    enterEmail: "Masukkan alamat email",
    createPassword: "Buat kata sandi",
    enterPassword: "Masukkan kata sandi",
    passwordHelp:
      "Gunakan kata sandi yang mudah Anda ingat. Jaga kerahasiaan login Anda.",
    accountCreated: "Akun berhasil dibuat.",
    loginAfterRegister:
      "Silakan masuk dengan nama pengguna dan kata sandi Anda untuk melanjutkan.",

    // Login page
    loginTitle: "Selamat datang kembali",
    loginSubtitle: "Masuk untuk mengakses dashboard dan riwayat suntikan.",
    loginHeroTitle:
      "Pencatatan insulin dan pengecekan rutinitas yang mengutamakan keselamatan.",
    loginHeroSubtitle:
      "InsuTrack membantu membuat rutinitas insulin manual lebih jelas bagi pengguna dan caregiver.",
    preInjectionCheckShort:
      "Periksa riwayat terbaru sebelum mencatat suntikan yang sudah dilakukan.",

    // Register page
    safetyFirstWorkflow: "Alur yang mengutamakan keselamatan",
    registerHeroTitle: "Dibuat untuk pencatatan insulin manual yang jelas.",
    registerHeroSubtitle:
      "InsuTrack membantu pengguna dan caregiver meninjau catatan suntikan terbaru sebelum menyimpan catatan suntikan berikutnya.",
    registerAndLogin: "Daftar dan masuk",
    registerAndLoginText:
      "Setiap pengguna dapat mengakses dashboard terlindungi dan riwayat suntikan miliknya sendiri.",
    checkBeforeLogging: "Periksa sebelum mencatat",
    checkBeforeLoggingText:
      "Pengecekan sebelum suntik membantu meninjau apakah jenis insulin yang sama sudah dicatat baru-baru ini.",
    recordOnlyCompleted: "Catat hanya suntikan yang sudah dilakukan",
    recordOnlyCompletedText:
      "Aplikasi ini mendukung pencatatan dan pengecekan rutinitas, bukan keputusan dosis medis.",

    // Safety
    safetyNote: "Catatan keselamatan",
    safetyNoteText:
      "InsuTrack hanya merupakan alat pencatatan dan pengecekan rutinitas. Ikuti instruksi tenaga kesehatan Anda.",
    fullSafetyNoteText:
      "InsuTrack hanya merupakan alat pencatatan dan pengecekan rutinitas. Aplikasi ini tidak menentukan apakah Anda harus menyuntik, menghitung dosis, atau memberikan saran medis. Ikuti instruksi tenaga kesehatan Anda.",
    appDoesNotCalculate:
      "Aplikasi ini tidak menghitung dosis atau memberikan saran medis.",

    // Dashboard
    dashboard: "Dashboard",
    dashboardTitle: "Dashboard keselamatan suntikan",
    dashboardSubtitle:
      "Pilih langkah berikutnya dalam alur pencatatan insulin. Gunakan pengecekan sebelum suntik, catat hanya suntikan yang sudah dilakukan, dan tinjau riwayat secara detail.",
    beforeInjection: "Sebelum suntik",
    afterInjection: "Setelah suntik",
    reviewRecords: "Tinjau catatan",
    preInjectionCheck: "Pengecekan sebelum suntik",
    dashboardPreCheckDescription:
      "Jalankan pengecekan terpandu untuk melihat apakah jenis insulin yang sama sudah dicatat baru-baru ini.",
    dashboardLogDescription:
      "Catat suntikan hanya setelah suntikan benar-benar sudah dilakukan.",
    dashboardHistoryDescription:
      "Lihat, ubah, atau hapus riwayat suntikan dan tinjau peringatan waktu suntik yang terlalu dekat.",
    runCheck: "Jalankan pengecekan",
    logInjection: "Catat suntikan",
    logCompletedInjection: "Catat suntikan selesai",
    history: "Riwayat",
    viewHistory: "Lihat riwayat",
    aboutToInject: "Akan menyuntik?",
    aboutToInjectText: "Mulai dengan pengecekan sebelum suntik.",
    alreadyCompleted: "Sudah selesai?",
    alreadyCompletedText:
      "Gunakan halaman catat suntikan hanya setelah suntikan benar-benar terjadi.",
    needDetails: "Butuh detail?",
    needDetailsText:
      "Gunakan riwayat untuk melihat timeline lengkap, perubahan, tanda waktu suntik yang terlalu dekat, dan alasan yang tersimpan.",
    checkingActiveReminders: "Memeriksa pengingat aktif...",
    dashboardNotice: "Pemberitahuan dashboard",
    dashboardLoadError:
      "Tidak dapat memuat data pengingat. Silakan masuk kembali jika sesi Anda sudah berakhir.",
    goToLogin: "Ke halaman masuk",
    routineReminder: "Pengingat rutinitas",
    upcomingMealReminder: "Pengingat makan berikutnya",
    reminderTime: "Waktu pengingat",
    mealReminder: "Pengingat makan",
    routineReminderOnly:
      "Pengingat ini hanya untuk rutinitas pribadi. Ikuti instruksi tenaga kesehatan Anda.",

    // Edit injection page
    backToHistory: "Kembali ke riwayat",
    editInjectionTitle: "Ubah catatan suntikan",
    editInjectionSubtitle:
      "Perbarui catatan suntikan insulin yang sudah tersimpan. Jaga riwayat tetap akurat agar pengecekan sebelum suntik dan peninjauan berikutnya lebih mudah dipahami.",
    currentRecord: "Catatan saat ini",
    logId: "ID catatan",
    reviewDetails: "Tinjau detail",
    reviewDetailsText:
      "Periksa jenis insulin, dosis, waktu, dan nama pencatat.",
    correctMistakes: "Perbaiki kesalahan",
    correctMistakesText:
      "Perbarui hanya informasi yang sebelumnya dimasukkan secara keliru.",
    saveCarefully: "Simpan dengan hati-hati",
    saveCarefullyText:
      "Catatan yang diubah dapat memengaruhi riwayat dan pengecekan keselamatan berikutnya.",
    editError: "Kesalahan pengubahan",
    editLoadError: "Tidak dapat memuat catatan suntikan ini.",
    editSaveError:
      "Tidak dapat memperbarui catatan suntikan. Periksa kembali input Anda.",
    loadingInjectionLog: "Memuat catatan suntikan...",
    originalSavedLog: "Catatan asli yang tersimpan",
    beforeEditing: "Sebelum diubah",
    injectionTimeTooClose: "Waktu suntik terlalu dekat",
    insulinType: "Jenis insulin",
    dose: "Dosis",
    doseUnits: "Dosis unit",
    units: "unit",
    injectedAt: "Disuntik pada",
    injectionTime: "Waktu suntik",
    recordedBy: "Dicatat oleh",
    unknownRecorder: "Pencatat tidak diketahui",
    closeInjectionTimeWarningDetails:
      "Detail peringatan waktu suntik terlalu dekat",
    savedWithCloseTimeWarning:
      "Catatan ini disimpan meskipun waktu suntiknya terlalu dekat",
    closeTimeReasonExplanation:
      "Kolom alasan ditampilkan karena catatan ini memiliki peringatan waktu suntik terlalu dekat saat disimpan.",
    savedReason: "Alasan tersimpan",
    editDetails: "Ubah detail",
    injectionLogForm: "Form catatan suntikan",
    doseExample: "Contoh: 8",
    recordedByExample: "Contoh: Datu",
    notes: "Catatan",
    optionalNotes: "Catatan opsional",
    reasonCloseTimeWarningLogWasSaved:
      "Alasan catatan dengan peringatan waktu suntik terlalu dekat ini disimpan",
    overrideReasonExample:
      "Contoh: Saya sudah memeriksa catatan sebelumnya dan ini adalah suntikan terpisah yang sudah dilakukan.",
    closeTimeReasonRequired:
      "Wajib diisi karena catatan ini ditandai memiliki waktu suntik yang terlalu dekat dengan catatan sebelumnya.",
    savingChanges: "Menyimpan perubahan...",
    saveChanges: "Simpan perubahan",
    cancel: "Batal",

    // History page
    backToDashboard: "Kembali ke dashboard",
    loadingInjectionHistory: "Memuat riwayat suntikan...",
    historyError: "Kesalahan riwayat",
    historyLoadError: "Tidak dapat memuat riwayat suntikan. Silakan masuk kembali.",
    noInjectionLogsYet: "Belum ada catatan suntikan",
    noInjectionLogsYetText:
        "Setelah Anda mencatat suntikan yang sudah dilakukan, catatan tersebut akan muncul di sini untuk ditinjau, diubah, atau dihapus.",
    checkBeforeNextLog: "Periksa sebelum catatan berikutnya",
    injectionHistory: "Riwayat suntikan",
    injectionHistorySubtitle:
        "Tinjau, ubah, atau hapus catatan suntikan insulin yang sudah tersimpan. Gunakan halaman ini sebagai referensi sebelum mencatat suntikan berikutnya.",
    savedRecords: "Catatan tersimpan",
    totalInjectionLogs: "Total catatan suntikan di akun ini.",
    reviewTimeline: "Tinjau timeline",
    reviewTimelineText:
        "Periksa dosis, waktu, nama pencatat, dan catatan dari riwayat yang tersimpan.",
    keepRecordsClean: "Jaga catatan tetap rapi",
    keepRecordsCleanText:
        "Ubah detail yang salah atau hapus catatan yang tidak sengaja dibuat.",
    watchCloseTimeFlags: "Perhatikan tanda waktu terlalu dekat",
    watchCloseTimeFlagsText:
        "Catatan dengan peringatan waktu suntik terlalu dekat menyertakan alasan yang tersimpan jika tersedia.",
    savedHistory: "Riwayat tersimpan",
    completedInjectionLogs: "Catatan suntikan selesai",
    status: "Status",
    savedWithCloseInjectionTimeWarning:
        "Disimpan dengan peringatan waktu suntik terlalu dekat",
    savedWithoutCloseInjectionTimeWarning:
        "Disimpan tanpa peringatan waktu suntik terlalu dekat",
    closeInjectionTimeFlagExplanation:
        "Catatan ini ditandai karena waktu suntiknya terlalu dekat dengan catatan sebelumnya. Tinjau detail suntikan dengan hati-hati saat menggunakan catatan ini sebagai referensi.",
    editLog: "Ubah catatan",
    delete: "Hapus",
    deleting: "Menghapus...",
    deleteInjectionLogConfirm: "Hapus catatan suntikan ini?",
    deleteInjectionLogError: "Tidak dapat menghapus catatan suntikan ini.",

    // Log injection page
    logCompletedInjectionTitle: "Catat suntikan selesai",
    logCompletedInjectionSubtitle:
        "Catat suntikan hanya setelah suntikan benar-benar sudah dilakukan. Aplikasi akan memeriksa catatan terbaru terlebih dahulu dan meminta alasan jika waktu suntik terlalu dekat dengan catatan sebelumnya.",
    checkRecentLogs: "Periksa catatan terbaru",
    checkRecentLogsText:
        "InsuTrack memeriksa apakah jenis insulin yang sama sudah dicatat baru-baru ini.",
    saveCompletedLog: "Simpan catatan selesai",
    saveCompletedLogText:
        "Tambahkan dosis, waktu, nama pencatat, dan catatan opsional.",
    reviewWarnings: "Tinjau peringatan",
    reviewWarningsText:
        "Jika waktu suntik terlalu dekat, berikan alasan sebelum menyimpan.",
    couldNotSaveLog: "Tidak dapat menyimpan catatan",
    saveInjectionLogError:
        "Tidak dapat menyimpan catatan suntikan. Periksa kembali input Anda.",
    saved: "Tersimpan",
    injectionLogSaved: "Catatan suntikan tersimpan",
    savedWithCloseTimeWarningNotice:
        "Catatan ini disimpan meskipun waktu suntiknya terlalu dekat dengan catatan sebelumnya. Alasannya tersimpan di riwayat.",
    goToDashboard: "Ke dashboard",
    setMealReminder: "Atur pengingat makan?",
    setMealReminderText:
        "Pengingat ini hanya untuk rutinitas pribadi Anda. Pengingat ini terpisah dari pengecekan keselamatan waktu suntik.",
    reminderTiming: "Waktu pengingat",
    minutes: "menit",
    custom: "Kustom",
    customMinutes: "Menit kustom",
    enterMinutes: "Masukkan menit",
    savingReminder: "Menyimpan pengingat...",
    saveReminder: "Simpan pengingat",
    skipReminder: "Lewati pengingat",
    mealReminderSaved: "Pengingat makan tersimpan",
    mealReminderSavedFor: "Pengingat makan disimpan untuk",
    reminderOffsetError: "Jarak pengingat harus antara 1 sampai 180 menit.",
    saveMealReminderError: "Tidak dapat menyimpan pengingat makan. Coba lagi.",
    caution: "Perhatian",
    injectionTimeTooCloseToRecentLog:
        "Waktu suntik terlalu dekat dengan catatan terbaru",
    closeTimeWarningDescription:
        "Catatan insulin dengan jenis yang sama sudah ada baru-baru ini, sehingga waktu suntik ini dekat dengan catatan sebelumnya. Tinjau catatan terakhir dengan hati-hati sebelum menyimpan catatan baru.",
    lastMatchingLog: "Catatan terakhir yang sesuai",
    reviewCarefully: "Tinjau dengan hati-hati",
    timeSinceLastLog: "Waktu sejak catatan terakhir",
    enterReasonIfAlreadyCompleted:
        "Jika suntikan ini memang sudah dilakukan dan Anda tetap perlu menyimpan catatannya, masukkan alasan di bawah.",
    injectionDetails: "Detail suntikan",
    completedInjectionLog: "Catatan suntikan selesai",
    recordedByExampleSelf: "Contoh: John (sendiri)",
    reason: "Alasan",
    reasonRequiredCloseTime:
        "Wajib diisi karena waktu suntik terlalu dekat dengan catatan sebelumnya.",
    closeTimeReasonRequiredBeforeSaving:
        "Berikan alasan sebelum menyimpan catatan ini karena waktu suntik terlalu dekat dengan catatan sebelumnya.",
    checking: "Memeriksa...",
    saving: "Menyimpan...",
    saveWithReason: "Simpan dengan alasan",
    checkAndSaveInjectionLog: "Periksa dan simpan catatan suntikan",
    logSafetyNoteText:
        "InsuTrack hanya merupakan alat pencatatan dan pengecekan rutinitas. Aplikasi ini tidak menghitung dosis atau memberikan saran medis. Ikuti instruksi tenaga kesehatan Anda.",
    // Pre-injection check page
    // Indonesian
    preCheckSubtitle:
        "Tinjau catatan terbaru sebelum mencatat suntikan berikutnya. Ini membantu Anda memeriksa apakah jenis insulin yang sama sudah dicatat baru-baru ini.",
    chooseInsulin: "Pilih insulin",
    chooseInsulinText: "Pilih insulin kerja cepat atau insulin kerja panjang.",
    runCheckStepText: "InsuTrack memeriksa catatan terbaru yang tersimpan.",
    reviewResult: "Tinjau hasil",
    reviewResultText:
        "Aman berarti tidak ada catatan terbaru yang sesuai. Perhatian berarti perlu ditinjau dengan hati-hati.",
    whichInsulinCheck: "Jenis insulin mana yang ingin Anda periksa?",
    selected: "Dipilih",
    preCheckFailed: "Pengecekan gagal",
    preCheckFailedText:
        "Tidak dapat menjalankan pengecekan sebelum suntik. Silakan masuk kembali atau coba lagi nanti.",
    safeCheckResult: "Hasil pengecekan aman",
    noRecentMatchingLogFound: "Tidak ada catatan terbaru yang sesuai",
    safeCheckMessage:
        "Tidak ada catatan suntikan terbaru yang sesuai dalam rentang waktu pengecekan keselamatan.",
    safeCheckDescriptionStart:
        "InsuTrack tidak menemukan catatan terbaru yang tersimpan untuk",
    safeCheckDescriptionEnd:
        "dalam rentang waktu pengecekan keselamatan. Ini bukan saran medis.",
    continueToLogCompletedInjection: "Lanjut catat suntikan selesai",
    preCheckCautionAdvice:
        "Tinjau rutinitas Anda dengan hati-hati sebelum melanjutkan. InsuTrack tidak menentukan apakah Anda harus menyuntik. Jika Anda sudah melakukan suntikan lain dan perlu menyimpannya, halaman catat suntikan akan meminta alasan karena waktu suntik dekat dengan catatan sebelumnya.",
    continueIfAlreadyCompleted: "Lanjut jika sudah dilakukan",
    reviewHistory: "Tinjau riwayat",
    runCheckPromptStart:
        "Jalankan pengecekan untuk melihat apakah ada catatan terbaru yang sesuai untuk",
    
    // Meal reminder alarm
    insutrackReminder: "Pengingat InsuTrack",
    mealTime: "Waktu makan",
    mealReminderAlarmDescription:
        "Ini adalah pengingat rutinitas pribadi setelah catatan insulin kerja cepat.",
    mealReminderAlarmSafetyText:
        "InsuTrack tidak menghitung dosis, menentukan waktu makan, atau memberikan saran medis.",
    iUnderstand: "Saya mengerti",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("insutrack_language") || "en";
  });

  function setLanguage(nextLanguage) {
    setLanguageState(nextLanguage);
    localStorage.setItem("insutrack_language", nextLanguage);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language] || translations.en,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}