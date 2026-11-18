export type Locale = "en" | "es";

export type Copy = {
  skip: string;
  navHelp: string;
  navProgress: string;
  navSaved: string;
  navAccess: string;
  notNamed: string;
  homeKicker: string;
  homeTitle: string;
  homeLead: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchButton: string;
  continueEyebrow: string;
  continueAction: string;
  guidesTitle: string;
  emptyTitle: string;
  emptyBody: string;
  demoBadge: string;
  reviewedBadge: string;
  staleBadge: string;
  unverifiedBadge: string;
  draftBadge: string;
  englishOnly: string;
  sampleSpanish: string;
  sourceLabel: string;
  reviewedOn: string;
  reviewDue: string;
  openGuide: string;
  stepsWord: string;
  startGuide: string;
  stepOf: string;
  why: string;
  exampleLabel: string;
  cautionLabel: string;
  glossarySummary: string;
  noGlossary: string;
  readAloud: string;
  readAloudStop: string;
  readAloudNote: string;
  readAloudUnsupported: string;
  readAloudWorking: string;
  didThis: string;
  undoStep: string;
  markedDone: string;
  back: string;
  next: string;
  finish: string;
  saving: string;
  networkError: string;
  saveGuide: string;
  savedGuide: string;
  removeSaved: string;
  copyLink: string;
  copied: string;
  copyFailed: string;
  doneTitle: string;
  doneBody: string;
  notDoneTitle: string;
  notDoneBody: string;
  clarityLegend: string;
  clarity1: string;
  clarity2: string;
  clarity3: string;
  clarity4: string;
  clarity5: string;
  confusing: string;
  noteLabel: string;
  sendFeedback: string;
  skipFeedback: string;
  progressTitle: string;
  progressLead: string;
  progressEmpty: string;
  savedTitle: string;
  savedEmpty: string;
  resume: string;
  finished: string;
  inProgress: string;
  yourMetric: string;
  localMetric: string;
  noMetric: string;
  metricNote: string;
  accessTitle: string;
  accessLead: string;
  textSize: string;
  textDefault: string;
  textLarger: string;
  textLargest: string;
  contrast: string;
  contrastStandard: string;
  contrastHigh: string;
  simpler: string;
  simplerHint: string;
  motion: string;
  motionHint: string;
  saveSettings: string;
  keyboardTitle: string;
  languageLabel: string;
  english: string;
  spanish: string;
  limitsTitle: string;
  limitsLead: string;
  llmTitle: string;
  llmBody: string;
  editorTitle: string;
  editorLead: string;
  editorSandbox: string;
  editorConfigured: string;
  editorCodeLabel: string;
  editorUnlock: string;
  saveDraft: string;
  markReviewed: string;
  reviewCheck: string;
  newGuide: string;
  createGuide: string;
  topic: string;
  topicAccounts: string;
  topicSafety: string;
  topicDevices: string;
  allTopics: string;
  guideTitle: string;
  summary: string;
  simplerSummary: string;
  sourceUrl: string;
  sourceTitle: string;
  accountTitle: string;
  accountLead: string;
  nameLabel: string;
  saveName: string;
  exportData: string;
  exportNote: string;
  deleteData: string;
  deleteHint: string;
  deleteConfirmLabel: string;
  noAccount: string;
  footerNote: string;
  footerLimits: string;
  footerEditor: string;
  footerAccount: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
  fallbackBanner: string;
  simplerOn: string;
  simplerMissing: string;
  staleDetail: string;
  welcomeBack: string;
  firstVisit: string;
  resultsFor: string;
  clearSearch: string;
  backToGuides: string;
  opensSource: string;
  feedbackTitle: string;
  editorFeedback: string;
  noFeedback: string;
  someoneWrote: string;
  draftHidden: string;
  workingCopy: string;
  publicCopy: string;
  addStep: string;
  removeStep: string;
  stepHeading: string;
  stepExplanation: string;
  stepSimpler: string;
  stepExample: string;
  stepCaution: string;
  localeVersion: string;
  savedOnServer: string;
  tryAgain: string;
  errorTitle: string;
  errorBody: string;
  errorBodyEs: string;
};

const en: Copy = {
  skip: "Skip to content",
  navHelp: "Help",
  navProgress: "Progress",
  navSaved: "Saved",
  navAccess: "Access",
  notNamed: "Not named yet",
  homeKicker: "The internet, in plain language",
  homeTitle: "What do you need help with?",
  homeLead:
    "Lumen walks you through a few everyday internet tasks, one step at a time. It does not fill in forms, and it does not sign in for you.",
  searchLabel: "Explain this",
  searchPlaceholder: "For example, a strange email",
  searchButton: "Show guides",
  continueEyebrow: "Pick up where you stopped",
  continueAction: "Continue",
  guidesTitle: "Demo guides on this server",
  emptyTitle: "No guide matches those words",
  emptyBody: "Lumen only searches the guides stored on this server. It does not search the whole internet.",
  demoBadge: "Demo guide",
  reviewedBadge: "Reviewed",
  staleBadge: "Review date has passed",
  unverifiedBadge: "Not verified",
  draftBadge: "Draft",
  englishOnly: "English only",
  sampleSpanish: "Sample Spanish",
  sourceLabel: "Source",
  reviewedOn: "Reviewed",
  reviewDue: "Review due",
  openGuide: "Open guide",
  stepsWord: "steps",
  startGuide: "Start this guide",
  stepOf: "Step {current} of {total}",
  why: "Why this step",
  exampleLabel: "Example",
  cautionLabel: "Be careful",
  glossarySummary: "Words on this step",
  noGlossary: "This step has no extra word list.",
  readAloud: "Read this step aloud",
  readAloudStop: "Stop reading",
  readAloudNote: "Read aloud uses this device's voice. Lumen does not send the words to a speech service.",
  readAloudUnsupported: "This browser has no read-aloud voice. The words stay on the screen.",
  readAloudWorking: "Reading on this device.",
  didThis: "I did this step",
  undoStep: "Mark as not done",
  markedDone: "You marked this step done. It stays done after a refresh.",
  back: "Back",
  next: "Next",
  finish: "Finish and save",
  saving: "Saving on this server…",
  networkError: "Lumen could not reach this server. Your last saved step is still stored. Try again.",
  saveGuide: "Save this guide",
  savedGuide: "Saved on this server",
  removeSaved: "Remove from saved",
  copyLink: "Copy link",
  copied: "Link copied. It does not include your progress.",
  copyFailed: "Copy failed. Select the address and copy it yourself.",
  doneTitle: "You finished the steps",
  doneBody: "Lumen did not do the task for you. You did. If a screen on another site looked different, use the source link.",
  notDoneTitle: "This guide is not finished",
  notDoneBody: "Finish the steps first. Lumen will not mark it complete until you do.",
  clarityLegend: "How clear was this guide?",
  clarity1: "1 Hard to follow",
  clarity2: "2 Mostly hard",
  clarity3: "3 Mixed",
  clarity4: "4 Mostly clear",
  clarity5: "5 Clear",
  confusing: "This was confusing",
  noteLabel: "What was confusing? Optional. Do not include passwords or form answers.",
  sendFeedback: "Send note",
  skipFeedback: "Skip this note",
  progressTitle: "My progress",
  progressLead: "Lumen keeps your place on this server for this browser. Another browser starts fresh until you use the same session.",
  progressEmpty: "You have not started a guide in this browser.",
  savedTitle: "Saved guides",
  savedEmpty: "You have not saved a guide yet. Saving keeps a shortcut. It does not share the guide.",
  resume: "Resume",
  finished: "Finished",
  inProgress: "In progress",
  yourMetric: "Your guides",
  localMetric: "Everyone in this database",
  noMetric: "No one has started a guide in this database yet, so there is no completion percent.",
  metricNote: "These counts are rows in this database. They are not a published statistic and not a pilot result.",
  accessTitle: "Accessibility",
  accessLead: "These settings are saved on this server for this browser. They change text size, contrast, simpler wording, and motion.",
  textSize: "Text size",
  textDefault: "Default",
  textLarger: "Larger",
  textLargest: "Largest",
  contrast: "Contrast",
  contrastStandard: "Standard",
  contrastHigh: "Higher contrast",
  simpler: "Simpler language",
  simplerHint: "When a step has a shorter wording, Lumen shows that. If it does not, Lumen says so and keeps the standard wording.",
  motion: "Reduce motion",
  motionHint: "Turns off the short color transitions in Lumen. Your device setting is also respected.",
  saveSettings: "Save settings",
  keyboardTitle: "Keyboard",
  languageLabel: "Language",
  english: "English",
  spanish: "Español",
  limitsTitle: "What Lumen cannot do",
  limitsLead: "Lumen explains a few tasks. It does not act on other websites for you.",
  llmTitle: "Ask for another wording",
  llmBody: "Turned off. Lumen has no language-model connection, and a key would not turn one on. Use Simpler language, which is text written into the guide.",
  editorTitle: "Editor desk",
  editorLead: "Drafts stay off the public list until you mark them reviewed. Saving a draft does not label it reviewed.",
  editorSandbox: "Sandbox desk. LUMEN_EDITOR_CODE is not set, so the local code is local-desk. Do not use that code on a shared server.",
  editorConfigured: "An editor code is set in the server environment. Lumen will not show it.",
  editorCodeLabel: "Desk code",
  editorUnlock: "Unlock editor desk",
  saveDraft: "Save draft",
  markReviewed: "Mark reviewed",
  reviewCheck: "I looked at the source page and these steps match it today. This is not a legal or medical review.",
  newGuide: "New draft guide",
  createGuide: "Create draft",
  topic: "Topic",
  topicAccounts: "Accounts",
  topicSafety: "Safety",
  topicDevices: "Devices",
  allTopics: "All topics",
  guideTitle: "Title",
  summary: "Summary",
  simplerSummary: "Shorter summary",
  sourceUrl: "Source link (https)",
  sourceTitle: "Source name",
  accountTitle: "Your data on this server",
  accountLead: "Lumen stores a display name, settings, guide progress, and notes you choose to send. It does not store passwords or form answers.",
  nameLabel: "What should this browser call you?",
  saveName: "Save name",
  exportData: "Download my data",
  exportNote: "The file is JSON for this browser's session. It has no session token.",
  deleteData: "Delete my data",
  deleteHint: "This removes your name, progress, saved guides, and notes from this server. Demo guides stay.",
  deleteConfirmLabel: "Type DELETE to confirm",
  noAccount: "This browser has no saved session yet. Start a guide or save a setting and Lumen will keep a session here.",
  footerNote: "Demo guides are labeled. Lumen is not a government office.",
  footerLimits: "What Lumen cannot do",
  footerEditor: "Editor desk",
  footerAccount: "Your data",
  notFoundTitle: "That page is not in Lumen",
  notFoundBody: "The address does not match a guide or a screen. Nothing was submitted.",
  backHome: "Back to Help",
  fallbackBanner: "This guide is not ready in the language you chose. The steps below stay in the language that was reviewed. The buttons stay in your language.",
  simplerOn: "Simpler wording is on.",
  simplerMissing: "Simpler wording is on, but this step has no shorter text. Showing the standard wording.",
  staleDetail: "The review date on this copy of Lumen has passed. The steps may be out of date. Check the source page before you follow them.",
  welcomeBack: "Welcome back.",
  firstVisit: "You can start without an account. Lumen saves a session in this browser when you begin.",
  resultsFor: "Guides that match",
  clearSearch: "Clear search",
  backToGuides: "All guides",
  opensSource: "Opens the source website in a new tab.",
  feedbackTitle: "Tell Lumen this was confusing",
  editorFeedback: "Notes people sent",
  noFeedback: "No notes yet.",
  someoneWrote: "Someone on this server wrote",
  draftHidden: "This draft is not on the public list.",
  workingCopy: "Working copy",
  publicCopy: "The public page still shows the last reviewed version until you mark this copy reviewed.",
  addStep: "Add a step",
  removeStep: "Remove last step",
  stepHeading: "Step heading",
  stepExplanation: "Explanation",
  stepSimpler: "Simpler wording",
  stepExample: "Example",
  stepCaution: "Caution",
  localeVersion: "Language of this copy",
  savedOnServer: "Saved on this server.",
  tryAgain: "Try again",
  errorTitle: "This screen did not finish loading",
  errorBody: "Lumen did not mark a step done. Anything already saved is still on this server.",
  errorBodyEs: "Lumen no marcó un paso. Lo que ya estaba guardado sigue en este servidor.",
};

const es: Copy = {
  skip: "Saltar al contenido",
  navHelp: "Ayuda",
  navProgress: "Progreso",
  navSaved: "Guardadas",
  navAccess: "Acceso",
  notNamed: "Sin nombre",
  homeKicker: "Internet, en lenguaje claro",
  homeTitle: "¿Con qué necesita ayuda?",
  homeLead:
    "Lumen le explica algunas tareas cotidianas de internet, un paso a la vez. No rellena formularios y no inicia sesión por usted.",
  searchLabel: "Explique esto",
  searchPlaceholder: "Por ejemplo, un correo extraño",
  searchButton: "Ver guías",
  continueEyebrow: "Siga donde lo dejó",
  continueAction: "Continuar",
  guidesTitle: "Guías de demostración en este servidor",
  emptyTitle: "Ninguna guía coincide con esas palabras",
  emptyBody: "Lumen solo busca las guías guardadas en este servidor. No busca en todo internet.",
  demoBadge: "Guía de demostración",
  reviewedBadge: "Revisada",
  staleBadge: "La fecha de revisión ya pasó",
  unverifiedBadge: "Sin verificar",
  draftBadge: "Borrador",
  englishOnly: "Solo en inglés",
  sampleSpanish: "Español de muestra",
  sourceLabel: "Fuente",
  reviewedOn: "Revisada",
  reviewDue: "Revisión vence",
  openGuide: "Abrir guía",
  stepsWord: "pasos",
  startGuide: "Empezar esta guía",
  stepOf: "Paso {current} de {total}",
  why: "Por qué este paso",
  exampleLabel: "Ejemplo",
  cautionLabel: "Cuidado",
  glossarySummary: "Palabras de este paso",
  noGlossary: "Este paso no tiene una lista extra de palabras.",
  readAloud: "Leer este paso en voz alta",
  readAloudStop: "Detener la lectura",
  readAloudNote: "La lectura usa la voz de este aparato. Lumen no envía el texto a un servicio de voz.",
  readAloudUnsupported: "Este navegador no tiene voz de lectura. El texto sigue en la pantalla.",
  readAloudWorking: "Leyendo en este aparato.",
  didThis: "Ya hice este paso",
  undoStep: "Marcar como no hecho",
  markedDone: "Marcó este paso como hecho. Sigue hecho después de actualizar.",
  back: "Atrás",
  next: "Siguiente",
  finish: "Terminar y guardar",
  saving: "Guardando en este servidor…",
  networkError: "Lumen no pudo llegar a este servidor. El último paso guardado sigue almacenado. Inténtelo de nuevo.",
  saveGuide: "Guardar esta guía",
  savedGuide: "Guardada en este servidor",
  removeSaved: "Quitar de guardadas",
  copyLink: "Copiar enlace",
  copied: "Enlace copiado. No incluye su progreso.",
  copyFailed: "No se pudo copiar. Seleccione la dirección y cópiela usted.",
  doneTitle: "Terminó los pasos",
  doneBody: "Lumen no hizo la tarea por usted. Si una pantalla se ve distinta, use el enlace de la fuente.",
  notDoneTitle: "Esta guía no está terminada",
  notDoneBody: "Termine los pasos primero. Lumen no la marca completa hasta entonces.",
  clarityLegend: "¿Qué tan clara fue esta guía?",
  clarity1: "1 Difícil de seguir",
  clarity2: "2 Casi difícil",
  clarity3: "3 Regular",
  clarity4: "4 Casi clara",
  clarity5: "5 Clara",
  confusing: "Esto fue confuso",
  noteLabel: "¿Qué fue confuso? Opcional. No incluya contraseñas ni respuestas de formularios.",
  sendFeedback: "Enviar nota",
  skipFeedback: "Omitir esta nota",
  progressTitle: "Mi progreso",
  progressLead: "Lumen guarda su lugar en este servidor para este navegador. Otro navegador empieza de nuevo.",
  progressEmpty: "No ha empezado una guía en este navegador.",
  savedTitle: "Guías guardadas",
  savedEmpty: "Todavía no guarda una guía. Guardar crea un atajo. No comparte la guía.",
  resume: "Seguir",
  finished: "Terminada",
  inProgress: "En curso",
  yourMetric: "Sus guías",
  localMetric: "Todas las personas en esta base",
  noMetric: "Nadie ha empezado una guía en esta base, así que no hay un porcentaje.",
  metricNote: "Estas cifras son filas de esta base. No son una estadística publicada ni un resultado de prueba piloto.",
  accessTitle: "Accesibilidad",
  accessLead: "Estos ajustes se guardan en este servidor para este navegador. Cambian el tamaño del texto, el contraste, el lenguaje simple y el movimiento.",
  textSize: "Tamaño del texto",
  textDefault: "Normal",
  textLarger: "Más grande",
  textLargest: "El más grande",
  contrast: "Contraste",
  contrastStandard: "Estándar",
  contrastHigh: "Más contraste",
  simpler: "Lenguaje más simple",
  simplerHint: "Si un paso tiene un texto más corto, Lumen lo muestra. Si no lo tiene, Lumen lo dice y deja el texto normal.",
  motion: "Reducir movimiento",
  motionHint: "Apaga las transiciones cortas de color. También se respeta el ajuste del aparato.",
  saveSettings: "Guardar ajustes",
  keyboardTitle: "Teclado",
  languageLabel: "Idioma",
  english: "English",
  spanish: "Español",
  limitsTitle: "Lo que Lumen no puede hacer",
  limitsLead: "Lumen explica algunas tareas. No actúa en otros sitios por usted.",
  llmTitle: "Pedir otra redacción",
  llmBody: "Apagado. Lumen no tiene conexión con un modelo de lenguaje, y una clave no la encendería. Use el lenguaje más simple, que es texto escrito en la guía.",
  editorTitle: "Mesa de edición",
  editorLead: "Los borradores no aparecen en la lista pública hasta que los marque como revisados. Guardar un borrador no lo marca como revisado.",
  editorSandbox: "Mesa de prueba. LUMEN_EDITOR_CODE no está definido, así que el código local es local-desk. No use ese código en un servidor compartido.",
  editorConfigured: "Hay un código de editor en el entorno del servidor. Lumen no lo muestra.",
  editorCodeLabel: "Código de la mesa",
  editorUnlock: "Abrir la mesa de edición",
  saveDraft: "Guardar borrador",
  markReviewed: "Marcar como revisada",
  reviewCheck: "Miré la página de origen y estos pasos coinciden hoy. Esto no es una revisión legal ni médica.",
  newGuide: "Nueva guía en borrador",
  createGuide: "Crear borrador",
  topic: "Tema",
  topicAccounts: "Cuentas",
  topicSafety: "Seguridad",
  topicDevices: "Aparatos",
  allTopics: "Todos los temas",
  guideTitle: "Título",
  summary: "Resumen",
  simplerSummary: "Resumen más corto",
  sourceUrl: "Enlace de la fuente (https)",
  sourceTitle: "Nombre de la fuente",
  accountTitle: "Sus datos en este servidor",
  accountLead: "Lumen guarda un nombre, ajustes, progreso y las notas que usted envía. No guarda contraseñas ni respuestas de formularios.",
  nameLabel: "¿Cómo debe llamarle este navegador?",
  saveName: "Guardar nombre",
  exportData: "Descargar mis datos",
  exportNote: "El archivo es JSON de la sesión de este navegador. No incluye el token de sesión.",
  deleteData: "Borrar mis datos",
  deleteHint: "Esto quita su nombre, progreso, guías guardadas y notas de este servidor. Las guías de demostración se quedan.",
  deleteConfirmLabel: "Escriba DELETE para confirmar",
  noAccount: "Este navegador aún no tiene una sesión. Empiece una guía o guarde un ajuste y Lumen creará una sesión aquí.",
  footerNote: "Las guías de demostración están marcadas. Lumen no es una oficina del gobierno.",
  footerLimits: "Lo que Lumen no puede hacer",
  footerEditor: "Mesa de edición",
  footerAccount: "Sus datos",
  notFoundTitle: "Esa página no está en Lumen",
  notFoundBody: "La dirección no coincide con una guía ni con una pantalla. No se envió nada.",
  backHome: "Volver a Ayuda",
  fallbackBanner: "Esta guía no está lista en el idioma que eligió. Los pasos de abajo siguen en el idioma revisado. Los botones siguen en su idioma.",
  simplerOn: "El lenguaje más simple está activado.",
  simplerMissing: "El lenguaje más simple está activado, pero este paso no tiene un texto más corto. Se muestra el texto normal.",
  staleDetail: "La fecha de revisión en esta copia de Lumen ya pasó. Los pasos pueden estar desactualizados. Mire la página de origen antes de seguirlos.",
  welcomeBack: "Bienvenido de nuevo.",
  firstVisit: "Puede empezar sin una cuenta. Lumen guarda una sesión en este navegador cuando usted comienza.",
  resultsFor: "Guías que coinciden",
  clearSearch: "Borrar búsqueda",
  backToGuides: "Todas las guías",
  opensSource: "Abre el sitio de la fuente en una pestaña nueva.",
  feedbackTitle: "Dígale a Lumen que esto fue confuso",
  editorFeedback: "Notas que enviaron las personas",
  noFeedback: "Todavía no hay notas.",
  someoneWrote: "Alguien en este servidor escribió",
  draftHidden: "Este borrador no está en la lista pública.",
  workingCopy: "Copia de trabajo",
  publicCopy: "La página pública sigue mostrando la última versión revisada hasta que marque esta copia como revisada.",
  addStep: "Añadir un paso",
  removeStep: "Quitar el último paso",
  stepHeading: "Título del paso",
  stepExplanation: "Explicación",
  stepSimpler: "Texto más simple",
  stepExample: "Ejemplo",
  stepCaution: "Cuidado",
  localeVersion: "Idioma de esta copia",
  savedOnServer: "Guardado en este servidor.",
  tryAgain: "Intentar de nuevo",
  errorTitle: "Esta pantalla no terminó de cargar",
  errorBody: "Lumen no marcó un paso como hecho. Lo que ya estaba guardado sigue en este servidor.",
  errorBodyEs: "Lumen no marcó un paso. Lo que ya estaba guardado sigue en este servidor.",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "es";
}

export function t(locale: string | null | undefined): Copy {
  return locale === "es" ? es : en;
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function errorText(locale: string, code: string | undefined) {
  const copy = t(locale);
  const table: Record<string, string> = {
    origin: locale === "es" ? "Abra Lumen en este navegador e inténtelo de nuevo." : "Open Lumen in this browser and try again.",
    not_found: locale === "es" ? "Eso no está en esta cuenta." : "That item is not on this account.",
    forbidden: locale === "es" ? "Esta acción no está disponible para este navegador." : "This action is not available for this browser.",
    invalid: locale === "es" ? "Revise los campos e inténtelo de nuevo." : "Check the fields and try again.",
    rate: locale === "es" ? "Demasiados intentos. Espere un poco y vuelva a probar." : "Too many tries. Wait a little, then try again.",
    code: locale === "es" ? "Ese código de la mesa no coincide." : "That desk code does not match.",
    review: locale === "es" ? "Este borrador todavía no se puede marcar como revisado." : "This draft cannot be marked reviewed yet.",
    short_name: locale === "es" ? "Use de 2 a 40 letras, no un correo." : "Use 2 to 40 letters, not an email address.",
    rating: locale === "es" ? "Elija una claridad del 1 al 5, o déjela en blanco." : "Choose a clarity rating from 1 to 5, or leave it blank.",
    url: locale === "es" ? "La fuente debe ser un enlace https." : "The source must be an https link.",
    generic: locale === "es" ? "Lumen no pudo completar eso." : "Lumen could not finish that.",
  };
  if (!code) return null;
  return table[code] ?? copy.errorBody;
}

export function noticeText(locale: string, code: string | undefined) {
  if (!code) return null;
  const esLocale = locale === "es";
  const table: Record<string, string> = {
    saved: esLocale ? "Guardado en este servidor." : "Saved on this server.",
    feedback: esLocale ? "Nota guardada en este servidor." : "Note saved on this server.",
    name: esLocale ? "Nombre guardado en este servidor." : "Name saved on this server.",
    unlocked: esLocale ? "Mesa de edición abierta en este navegador." : "Editor desk unlocked for this browser.",
    reviewed: esLocale ? "Marcada como revisada. Ya puede aparecer en la lista pública." : "Marked reviewed. It can appear on the public list.",
    draft: esLocale ? "Borrador guardado. Sigue fuera de la lista pública hasta la revisión." : "Draft saved. It stays off the public list until review.",
    deleted: esLocale ? "Datos de este navegador borrados de este servidor." : "This browser's data was deleted from this server.",
    settings: esLocale ? "Ajustes guardados en este servidor." : "Settings saved on this server.",
  };
  return table[code] ?? null;
}

export function topicLabel(locale: string, topic: string) {
  const copy = t(locale);
  if (topic === "accounts") return copy.topicAccounts;
  if (topic === "safety") return copy.topicSafety;
  if (topic === "devices") return copy.topicDevices;
  return topic;
}

export const keyboardHelp = {
  en: [
    { keys: "Tab", meaning: "Move to the next link or button." },
    { keys: "Shift + Tab", meaning: "Move to the previous link or button." },
    { keys: "Enter", meaning: "Activate the button that has focus." },
    { keys: "Space", meaning: "Activate a button or check a box." },
  ],
  es: [
    { keys: "Tab", meaning: "Ir al siguiente enlace o botón." },
    { keys: "Shift + Tab", meaning: "Ir al enlace o botón anterior." },
    { keys: "Enter", meaning: "Activar el botón que tiene el foco." },
    { keys: "Espacio", meaning: "Activar un botón o marcar una casilla." },
  ],
} as const;

export const limitItems = {
  en: [
    { title: "No form submission", body: "Lumen will not fill in, sign, or send a benefits, immigration, legal, medical, or financial form." },
    { title: "No passwords", body: "Do not type a password here. There is no field for one, and none is stored." },
    { title: "No inbox and no screen overlay", body: "Lumen cannot see your email, your bank, or the page behind this one." },
    { title: "No language model", body: "Rewrites from an outside model are off. Simpler wording is text stored with the guide." },
    { title: "Demo guides", body: "The three public guides are demo content with a source link and a review date. A past review date is labeled." },
    { title: "Sample Spanish", body: "Spanish in this demo is not a certified translation and it is not published by CISA." },
  ],
  es: [
    { title: "No envía formularios", body: "Lumen no rellena, no firma y no envía un formulario de beneficios, inmigración, legal, médico o financiero." },
    { title: "No pide contraseñas", body: "No escriba una contraseña aquí. No hay un campo para eso y no se guarda." },
    { title: "No ve su correo ni su pantalla", body: "Lumen no puede ver su correo, su banco ni la página que está detrás de esta." },
    { title: "No hay modelo de lenguaje", body: "Las redacciones de un modelo externo están apagadas. El texto simple está guardado en la guía." },
    { title: "Guías de demostración", body: "Las tres guías públicas son contenido de demostración, con fuente y fecha de revisión. Una fecha vencida se marca." },
    { title: "Español de muestra", body: "El español de esta demostración no es una traducción certificada y no lo publica CISA." },
  ],
} as const;
