import { ArabicLetterInfo, Tile } from '../types/game';

export const ARABIC_LETTERS: Record<string, ArabicLetterInfo> = {
  'ا': { letter: 'ا', normalized: 'ا', name: 'Alif', transliteration: 'ā', points: 1, frequency: 8 },
  'ل': { letter: 'ل', normalized: 'ل', name: 'Lam', transliteration: 'l', points: 1, frequency: 6 },
  'م': { letter: 'م', normalized: 'م', name: 'Meem', transliteration: 'm', points: 2, frequency: 5 },
  'ن': { letter: 'ن', normalized: 'ن', name: 'Noon', transliteration: 'n', points: 2, frequency: 5 },
  'ر': { letter: 'ر', normalized: 'ر', name: 'Raa', transliteration: 'r', points: 2, frequency: 4 },
  'و': { letter: 'و', normalized: 'و', name: 'Waw', transliteration: 'w/ū', points: 2, frequency: 4 },
  'ي': { letter: 'ي', normalized: 'ي', name: 'Yaa', transliteration: 'y/ī', points: 2, frequency: 4 },
  'ت': { letter: 'ت', normalized: 'ت', name: 'Taa', transliteration: 't', points: 2, frequency: 4 },
  'ب': { letter: 'ب', normalized: 'ب', name: 'Baa', transliteration: 'b', points: 2, frequency: 4 },
  'د': { letter: 'د', normalized: 'د', name: 'Daal', transliteration: 'd', points: 2, frequency: 3 },
  'ع': { letter: 'ع', normalized: 'ع', name: 'Ain', transliteration: '‘', points: 3, frequency: 3 },
  'س': { letter: 'س', normalized: 'س', name: 'Seen', transliteration: 's', points: 3, frequency: 3 },
  'ف': { letter: 'ف', normalized: 'ف', name: 'Faa', transliteration: 'f', points: 3, frequency: 3 },
  'ك': { letter: 'ك', normalized: 'ك', name: 'Kaaf', transliteration: 'k', points: 3, frequency: 3 },
  'ح': { letter: 'ح', normalized: 'ح', name: 'Haa', transliteration: 'ḥ', points: 3, frequency: 3 },
  'ج': { letter: 'ج', normalized: 'ج', name: 'Jeem', transliteration: 'j', points: 4, frequency: 2 },
  'ه': { letter: 'ه', normalized: 'ه', name: 'Haa', transliteration: 'h', points: 4, frequency: 3 },
  'ق': { letter: 'ق', normalized: 'ق', name: 'Qaaf', transliteration: 'q', points: 4, frequency: 2 },
  'ش': { letter: 'ش', normalized: 'ش', name: 'Sheen', transliteration: 'sh', points: 4, frequency: 2 },
  'ص': { letter: 'ص', normalized: 'ص', name: 'Saad', transliteration: 'ṣ', points: 4, frequency: 2 },
  'ط': { letter: 'ط', normalized: 'ط', name: 'Taa', transliteration: 'ṭ', points: 4, frequency: 2 },
  'خ': { letter: 'خ', normalized: 'خ', name: 'Khaa', transliteration: 'kh', points: 5, frequency: 2 },
  'ذ': { letter: 'ذ', normalized: 'ذ', name: 'Dhaal', transliteration: 'dh', points: 5, frequency: 2 },
  'ث': { letter: 'ث', normalized: 'ث', name: 'Thaa', transliteration: 'th', points: 5, frequency: 1 },
  'ز': { letter: 'ز', normalized: 'ز', name: 'Zayn', transliteration: 'z', points: 5, frequency: 2 },
  'ض': { letter: 'ض', normalized: 'ض', name: 'Daad', transliteration: 'ḍ', points: 8, frequency: 1 },
  'ظ': { letter: 'ظ', normalized: 'ظ', name: 'Dhaa', transliteration: 'ẓ', points: 8, frequency: 1 },
  'غ': { letter: 'غ', normalized: 'غ', name: 'Ghayn', transliteration: 'gh', points: 8, frequency: 1 },
  'ة': { letter: 'ة', normalized: 'ة', name: 'Taa Marbuta', transliteration: 'ah/at', points: 3, frequency: 3 },
};

/**
 * Creates a freshly shuffled tile bag according to letter frequency distribution
 */
export function generateTileBag(): Tile[] {
  const bag: Tile[] = [];
  let idCounter = 1;

  for (const letterKey of Object.keys(ARABIC_LETTERS)) {
    const info = ARABIC_LETTERS[letterKey];
    for (let i = 0; i < info.frequency; i++) {
      bag.push({
        id: `tile-${idCounter++}-${info.letter}`,
        letter: info.letter,
        points: info.points,
        normalized: info.normalized,
      });
    }
  }

  // Shuffle using Fisher-Yates
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  return bag;
}

/**
 * Normalizes an Arabic string for matching:
 * - Removes diacritics / tashkeel
 * - Normalizes Alif variations (أ, إ, آ, ٱ -> ا)
 * - Normalizes Alif Maqsura (ى -> ي)
 * - Removes Tatweel (ـ)
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Arabic diacritics
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Replace Alif variants with simple Alif
    .replace(/[أإآٱ]/g, 'ا')
    // Replace Alif Maqsura with Yaa
    .replace(/ى/g, 'ي')
    // Replace Tatweel
    .replace(/ـ/g, '')
    // Trim whitespace
    .trim();
}
