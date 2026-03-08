export interface BibleTranslation {
  key: string;
  name: string;
  language: 'fr' | 'en';
  bundled: boolean;
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { key: 'ls1910', name: 'Louis Segond 1910', language: 'fr', bundled: true },
  { key: 'kjv', name: 'King James Version', language: 'en', bundled: true },
  { key: 'darby_fr', name: 'Darby', language: 'fr', bundled: false },
  { key: 'martin', name: 'Martin 1744', language: 'fr', bundled: false },
  { key: 'asv', name: 'American Standard Version', language: 'en', bundled: false },
];
