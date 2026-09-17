import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { mr } from "./translations/mr";
import { or } from "./translations/or";
import { bn } from "./translations/bn";

export type Language = "en" | "hi" | "mr" | "or" | "bn";

const translations: Record<Language, any> = { en, hi, mr, or, bn };

const DEV = import.meta.env.DEV;

// Recursive type to generate dot notation paths for keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeys = NestedKeyOf<typeof en> | (string & {});

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang) => {
        if (DEV) console.log("[SahiRate i18n] Language changed:", lang);
        set({ language: lang });
      },
    }),
    {
      name: "sahirate-language",
    }
  )
);

/**
 * Resolve a dot-notation key against a translations dict.
 * Returns undefined if not found or if the result is not a string/array.
 */
function resolve(dict: any, keys: string[]): string | string[] | undefined {
  let current: any = dict;
  for (const k of keys) {
    if (current == null || typeof current !== "object" || !(k in current)) {
      return undefined;
    }
    current = current[k];
  }
  if (typeof current === "string" || Array.isArray(current)) return current;
  return undefined;
}

/**
 * Translate a dot-notation key to the given language.
 * Falls back: selected language → English → key string (never silently returns raw key without warning).
 */
export function translate(
  language: Language,
  key: TranslationKeys,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");

  // 1. Try selected language
  let result = resolve(translations[language], keys);

  // 2. Fallback to English
  if (result === undefined) {
    result = resolve(en, keys);
    if (result !== undefined && language !== "en" && DEV) {
      console.warn(`[SahiRate i18n] Missing key in "${language}", fell back to English: "${key}"`);
    }
  }

  // 3. Absolute fallback: key itself (but warn in dev — raw key should never reach users)
  if (result === undefined) {
    if (DEV) {
      console.error(`[SahiRate i18n] Key not found in any language: "${key}"`);
    }
    // Return a human-readable default instead of the raw key
    // Convert "collector.home.ready_to_collect" → "ready to collect"
    const humanFallback = keys[keys.length - 1].replace(/_/g, " ");
    return humanFallback;
  }

  // Arrays are returned as-is (e.g. safety rules)
  if (Array.isArray(result)) return result as unknown as string;

  // Substitute {{param}} placeholders
  if (params && typeof result === "string") {
    return result.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`));
  }

  return result as string;
}

/**
 * React hook for translations. Subscribe to language so components
 * re-render on language change. t is a stable function bound to current language.
 */
export function useTranslation() {
  // Subscribe to language — this is the trigger for re-renders.
  const language = useI18nStore((state) => state.language);

  // t is created inline per render so it captures the current language directly.
  // This is intentional: the closure captures `language` from the render scope.
  function t<T = string>(key: TranslationKeys, params?: Record<string, string | number>): T {
    return translate(language, key, params) as unknown as T;
  }

  return { t, language };
}
