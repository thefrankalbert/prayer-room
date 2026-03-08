import fr from './fr.json';
import en from './en.json';

export type Language = 'fr' | 'en';

const translations: Record<Language, Record<string, string>> = { fr, en };

export function translate(language: Language, key: string, params?: Record<string, string | number>): string {
  let text = translations[language][key] ?? translations['en'][key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
