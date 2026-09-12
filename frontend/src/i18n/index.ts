import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { mr } from "./translations/mr";

export type Language = "en" | "hi" | "mr";

const translations: Record<Language, typeof en> = { en, hi, mr };

// Recursive type to generate dot notation paths for keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeys = NestedKeyOf<typeof en>;

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T = string>(key: TranslationKeys, params?: Record<string, string | number>) => T;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      t: <T = string>(key: TranslationKeys, params?: Record<string, string | number>): T => {
        const keys = key.split(".");
        const lang = get().language;

        // Try selected language
        let current: any = translations[lang];
        for (const k of keys) {
          if (current?.[k] === undefined) {
            current = undefined;
            break;
          }
          current = current[k];
        }

        let result = typeof current === "string" || Array.isArray(current) ? current : undefined;

        // Fallback to English
        if (result === undefined) {
          let fallback: any = en;
          for (const k of keys) {
            if (fallback?.[k] === undefined) {
              fallback = undefined;
              break;
            }
            fallback = fallback[k];
          }
          result = typeof fallback === "string" || Array.isArray(fallback) ? fallback : key;
        }

        if (params && typeof result === "string") {
          return result.replace(/{{(\w+)}}/g, (_, k) => String(params[k] ?? `{{${k}}}`)) as unknown as T;
        }

        return result as unknown as T;
      },
    }),
    {
      name: "sahirate-language",
      partialize: (state) => ({ language: state.language }),
    }
  )
);
