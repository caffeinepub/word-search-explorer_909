// i18n translation system (UI strings only)
//
// Adding a new language:
// 1. Create a new file (e.g., src/locales/es.ts) matching the shape of en.ts
// 2. Add the language code to the Language type in src/stores/settingsStore.ts
// 3. Add an entry in LANGUAGES in settingsStore.ts
// 4. Import and add it to the `translations` record below
// 5. Add word lists for the language in src/utils/wordLists/ (see that file for details)

import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { useSettingsStore, type Language } from "../stores/settingsStore";

// Convert literal string types to string while preserving structure
type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

type TranslationSchema = DeepStringify<typeof en>;

const translations: Record<Language, TranslationSchema> = {
  en,
  es,
  fr,
  de,
  pt,
};

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

function getNestedValue(obj: TranslationObject, path: string): string {
  const keys = path.split(".");
  let current: TranslationObject | string = obj;
  for (const key of keys) {
    if (typeof current === "string") return path;
    current = current[key];
    if (current === undefined) return path;
  }
  return typeof current === "string" ? current : path;
}

function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    String(values[key] ?? `{{${key}}}`),
  );
}

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const dict = translations[language];

  const t = (key: string, values?: Record<string, string | number>): string => {
    const raw = getNestedValue(dict as unknown as TranslationObject, key);
    return interpolate(raw, values);
  };

  return { t, language };
}
