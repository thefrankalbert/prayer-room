/**
 * Download Bible data from getBible v2 API
 * Usage: node scripts/fetch-bible.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TRANSLATIONS = ['ls1910', 'kjv'];
const BASE_URL = 'https://api.getbible.net/v2';

const BOOK_MAP = {
  1: 'genesis', 2: 'exodus', 3: 'leviticus', 4: 'numbers', 5: 'deuteronomy',
  6: 'joshua', 7: 'judges', 8: 'ruth', 9: '1samuel', 10: '2samuel',
  11: '1kings', 12: '2kings', 13: '1chronicles', 14: '2chronicles',
  15: 'ezra', 16: 'nehemiah', 17: 'esther', 18: 'job', 19: 'psalms',
  20: 'proverbs', 21: 'ecclesiastes', 22: 'songofsolomon', 23: 'isaiah',
  24: 'jeremiah', 25: 'lamentations', 26: 'ezekiel', 27: 'daniel',
  28: 'hosea', 29: 'joel', 30: 'amos', 31: 'obadiah', 32: 'jonah',
  33: 'micah', 34: 'nahum', 35: 'habakkuk', 36: 'zephaniah', 37: 'haggai',
  38: 'zechariah', 39: 'malachi',
  40: 'matthew', 41: 'mark', 42: 'luke', 43: 'john', 44: 'acts',
  45: 'romans', 46: '1corinthians', 47: '2corinthians', 48: 'galatians',
  49: 'ephesians', 50: 'philippians', 51: 'colossians',
  52: '1thessalonians', 53: '2thessalonians', 54: '1timothy', 55: '2timothy',
  56: 'titus', 57: 'philemon', 58: 'hebrews', 59: 'james',
  60: '1peter', 61: '2peter', 62: '1john', 63: '2john', 64: '3john',
  65: 'jude', 66: 'revelation',
};

async function fetchTranslation(translationKey) {
  const outDir = join(__dirname, '..', 'assets', 'bible', translationKey);
  mkdirSync(outDir, { recursive: true });

  console.log(`Fetching ${translationKey}...`);

  for (const [bookNum, bookId] of Object.entries(BOOK_MAP)) {
    const url = `${BASE_URL}/${translationKey}/${bookNum}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  Failed ${bookId}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const bookData = {};

      if (data.chapters) {
        for (const chapter of data.chapters) {
          const chapterNum = String(chapter.chapter);
          bookData[chapterNum] = {};
          if (chapter.verses) {
            for (const verse of chapter.verses) {
              bookData[chapterNum][String(verse.verse)] = verse.text;
            }
          }
        }
      }

      const outFile = join(outDir, `${bookId}.json`);
      writeFileSync(outFile, JSON.stringify(bookData));
      console.log(`  ${bookId} (${Object.keys(bookData).length} ch)`);

      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      console.error(`  Error ${bookId}:`, err.message);
    }
  }

  console.log(`Done: ${translationKey}`);
}

async function main() {
  for (const translation of TRANSLATIONS) {
    await fetchTranslation(translation);
  }
  console.log('All done!');
}

main().catch(console.error);
