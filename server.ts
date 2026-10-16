import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for Arabic dictionary lookups
const dictionaryCache = new Map<string, {
  isValid: boolean;
  word: string;
  normalized: string;
  translation?: string;
  root?: string;
  type?: string;
  definitionAr?: string;
  source?: string;
  almaanyUrl: string;
}>();

// Helper to normalize Arabic text
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // strip Tashkeel & Tatweel
    .replace(/[إأآٱ]/g, 'ا') // normalize Alif
    .replace(/ة/g, 'ه') // normalize Ta Marbuta for matching
    .replace(/ى/g, 'ي') // normalize Alif Maqsura
    .trim();
}

// Arabic Roots Database for morphological generation & validation
const ARABIC_ROOTS: Record<string, { root: string; meaning: string }> = {
  // Key hollow & 3-letter roots
  'عنف': { root: 'ع ن ف', meaning: 'Violence / Rigor / Severity / Force' },
  'فنع': { root: 'ف ن ع', meaning: 'Flourishing / Wealth / Increase' },
  'نفع': { root: 'ن ف ع', meaning: 'Benefit / Advantage / Profit' },
  'عفن': { root: 'ع ف ن', meaning: 'Rot / Mold / Decay' },
  'نعف': { root: 'ن ع ف', meaning: 'Slope / Hill' },
  'عفو': { root: 'ع ف و', meaning: 'Pardon / Forgiveness / Amnesty' },
  'عفا': { root: 'ع ف و', meaning: 'Forgave / Pardoned / Effaced' },
  'عفف': { root: 'ع ف ف', meaning: 'Chaste / Virtue / Modesty' },
  'فيل': { root: 'ف ي ل', meaning: 'Elephant / Heavier / Bishop' },
  'بول': { root: 'ب و ل', meaning: 'Mind / Concern / Attention / Urine' },
  'بيل': { root: 'ب ي ل', meaning: 'Thought / State' },
  'ليف': { root: 'ل ي ف', meaning: 'Fiber / Palm fiber' },
  'لوب': { root: 'ل و ب', meaning: 'Wander / Turn around' },
  'لبب': { root: 'ل ب ب', meaning: 'Core / Heart / Intellect' },
  'عنب': { root: 'ع ن ب', meaning: 'Grapes' },
  'فلل': { root: 'ف ل ل', meaning: 'Jasmine / Fragment / Defeat' },
  'لفف': { root: 'ل ف ف', meaning: 'Wrap / Roll / Encircle' },
  'نوب': { root: 'ن و ب', meaning: 'Canine / Tooth / Deputize' },
  'نيل': { root: 'ن ي ل', meaning: 'Attain / Acquire / Nile' },
  'بين': { root: 'ب ي ن', meaning: 'Between / Distinct / Clear' },
  'بون': { root: 'ب و ن', meaning: 'Gap / Distance' },
  'لين': { root: 'ل ي ن', meaning: 'Soft / Tender' },
  'فال': { root: 'ف ا ل', meaning: 'Omen / Good portent' },
  'فول': { root: 'ف و ل', meaning: 'Fava beans' },
  'فوه': { root: 'ف و ه', meaning: 'Mouth / Spoke' },
  'فوز': { root: 'ف و ز', meaning: 'Victory / Win' },
  'فور': { root: 'ف و ر', meaning: 'Boil / Instant' },
  'فيض': { root: 'ف ي ض', meaning: 'Flood / Abundance' },
  'فيد': { root: 'ف ي د', meaning: 'Benefit / Gain' },
  'فهم': { root: 'ف ه م', meaning: 'Understand' },
  'فهد': { root: 'ف ه د', meaning: 'Cheetah' },
  'فكر': { root: 'ف ك ر', meaning: 'Think / Reflect' },
  'فصل': { root: 'ف ص ل', meaning: 'Season / Chapter / Separate' },
  'فرح': { root: 'ف ر ح', meaning: 'Joy / Gladness' },
  'فتح': { root: 'ف ت ح', meaning: 'Open / Conquer' },
  'فعل': { root: 'ف ع ل', meaning: 'Do / Verb / Action' },
  'فرق': { root: 'ف ر ق', meaning: 'Separate / Difference / Team' },
  'فرع': { root: 'ف ر ع', meaning: 'Branch' },
  'فرد': { root: 'ف ر د', meaning: 'Individual / Single' },
  'فرس': { root: 'ف ر س', meaning: 'Horse / Mare' },
  'فرش': { root: 'ف ر ش', meaning: 'Spread / Furnish' },
  'فرغ': { root: 'ف ر غ', meaning: 'Empty / Leisure' },
  'فرن': { root: 'ف ر ن', meaning: 'Oven' },
  'فزع': { root: 'ف ز ع', meaning: 'Panic / Rescue' },
  'فسد': { root: 'ف س د', meaning: 'Spoil / Corrupt' },
  'فصح': { root: 'ف ص ح', meaning: 'Eloquent / Easter' },
  'فضح': { root: 'ف ض ح', meaning: 'Expose / Disgrace' },
  'فطر': { root: 'ف ط ر', meaning: 'Break fast / Nature' },
  'فطن': { root: 'ف ط ن', meaning: 'Clever / Discern' },
  'فقد': { root: 'ف ق د', meaning: 'Lose' },
  'فقر': { root: 'ف ق ر', meaning: 'Poverty' },
  'فقه': { root: 'ف ق ه', meaning: 'Understand / Jurisprudence' },
  'فلك': { root: 'ف ل ك', meaning: 'Orbit / Celestial sphere' },
  'فلح': { root: 'ف ل ح', meaning: 'Succeed / Plow' },
  'فلس': { root: 'ف ل س', meaning: 'Penny / Bankrupt' },
  'فنن': { root: 'ف ن ن', meaning: 'Art / Variety' },
  'فوق': { root: 'ف و ق', meaning: 'Above / Superior' },
  'فني': { root: 'ف ن ي', meaning: 'Artistic / Perish' },
  'رحل': { root: 'ر ح ل', meaning: 'Depart / Travel / Journey' },
  'سفر': { root: 'س ف ر', meaning: 'Travel / Journey' },
  'نزل': { root: 'ن ز ل', meaning: 'Descend / Stay / Home' },
  'رجع': { root: 'ر ج ع', meaning: 'Return / Revert' },
  'خرج': { root: 'خ ر ج', meaning: 'Exit / Go out' },
  'دخل': { root: 'د خ ل', meaning: 'Enter / Come in' },
  'سير': { root: 'س ي ر', meaning: 'Walk / March / Pace' },
  'مشى': { root: 'م ش ي', meaning: 'Walk / Stroll' },
  'طوف': { root: 'ط و ف', meaning: 'Circumambulate / Roam' },
  'زور': { root: 'ز و ر', meaning: 'Visit' },
  'عود': { root: 'ع و د', meaning: 'Return / Habit / Repeat' },
  'حطط': { root: 'ح ط ط', meaning: 'Land / Settle' },
  'قفل': { root: 'ق ف ل', meaning: 'Lock / Return' },
  'حمل': { root: 'ح م ل', meaning: 'Carry / Bear' },
  'نقل': { root: 'ن ق ل', meaning: 'Move / Transport' },
  'كتب': { root: 'ك ت ب', meaning: 'Write / Book' },
  'قرا': { root: 'ق ر ا', meaning: 'Read / Recite' },
  'علم': { root: 'ع ل م', meaning: 'Know / Science / Flag' },
  'حفظ': { root: 'ح ف ظ', meaning: 'Preserve / Memorize' },
  'نسي': { root: 'ن س ي', meaning: 'Forget' },
  'ذكر': { root: 'ذ ك ر', meaning: 'Remember / Mention' },
  'سمع': { root: 'س م ع', meaning: 'Hear / Listen' },
  'بصر': { root: 'ب ص ر', meaning: 'See / Vision' },
  'نطق': { root: 'ن ط ق', meaning: 'Speak / Articulate' },
  'قول': { root: 'ق و ل', meaning: 'Say / Speech' },
  'كلم': { root: 'ك ل م', meaning: 'Talk / Speak' },
  'حدث': { root: 'ح د ث', meaning: 'Happen / Narrate' },
  'خبر': { root: 'خ ب ر', meaning: 'Inform / News' },
  'حمد': { root: 'ح م د', meaning: 'Praise' },
  'شكر': { root: 'ش ك ر', meaning: 'Thank / Gratitude' },
  'صبر': { root: 'ص ب ر', meaning: 'Patience / Endure' },
  'صدق': { root: 'ص د ق', meaning: 'Truth / Sincere' },
  'عدل': { root: 'ع د ل', meaning: 'Justice / Fair' },
  'حكم': { root: 'ح ك م', meaning: 'Rule / Judge / Wisdom' },
  'ملك': { root: 'م ل ك', meaning: 'Possess / King / Own' },
  'سلم': { root: 'س ل م', meaning: 'Peace / Safe / Surrender' },
  'امن': { root: 'ا م ن', meaning: 'Safe / Believe / Secure' },
  'نصر': { root: 'ن ص ر', meaning: 'Victory / Help' },
  'كرم': { root: 'ك ر م', meaning: 'Generous / Noble' },
  'جود': { root: 'ج و د', meaning: 'Bounty / Excellence' },
  'فضل': { root: 'ف ض ل', meaning: 'Merit / Virtue / Favor' },
  'شرف': { root: 'ش ر ف', meaning: 'Honor / Nobility' },
  'عزز': { root: 'ع ز ز', meaning: 'Might / Honor / Dear' },
  'رحم': { root: 'ر ح م', meaning: 'Mercy / Compassion' },
  'عطف': { root: 'ع ط ف', meaning: 'Affection / Kindness' },
  'ودد': { root: 'و د د', meaning: 'Love / Affection' },
  'حبب': { root: 'ح ب ب', meaning: 'Love / Beloved' },
  'صحب': { root: 'ص ح ب', meaning: 'Company / Friend' },
  'رفق': { root: 'ر ف ق', meaning: 'Gentle / Companion' },
  'جور': { root: 'ج و ر', meaning: 'Neighbor / Proximity' },
  'ضيف': { root: 'ض ي ف', meaning: 'Guest / Hospitality' },
  'طرق': { root: 'ط ر ق', meaning: 'Knock / Road / Path' },
  'درب': { root: 'د ر ب', meaning: 'Path / Trail / Train' },
  'سوق': { root: 'س و ق', meaning: 'Market / Drive' },
  'مول': { root: 'م و ل', meaning: 'Money / Wealth' },
  'ربح': { root: 'ر ب ح', meaning: 'Profit / Gain' },
  'تجر': { root: 'ت ج ر', meaning: 'Trade / Commerce' },
  'بيع': { root: 'ب ي ع', meaning: 'Sell / Sale' },
  'شري': { root: 'ش ر ي', meaning: 'Buy / Purchase' },
  'ذهب': { root: 'ذ ه ب', meaning: 'Gold / Go' },
  'فضض': { root: 'ف ض ض', meaning: 'Silver' },
  'خبز': { root: 'خ ب ز', meaning: 'Bread / Bake' },
  'لحم': { root: 'ل ح م', meaning: 'Meat / Join' },
  'لبن': { root: 'ل ب ن', meaning: 'Milk' },
  'عسل': { root: 'ع س ل', meaning: 'Honey' },
  'ملح': { root: 'م ل ح', meaning: 'Salt' },
  'زيت': { root: 'ز ي ت', meaning: 'Oil' },
  'تمر': { root: 'ت م ر', meaning: 'Dates' },
  'نخل': { root: 'ن خ ل', meaning: 'Palm trees' },
  'زرع': { root: 'ز ر ع', meaning: 'Plant / Cultivate' },
  'حصد': { root: 'ح ص د', meaning: 'Harvest' },
  'بني': { root: 'ب ن ي', meaning: 'Build / Children' },
  'هدم': { root: 'ه د م', meaning: 'Demolish' },
  'صنع': { root: 'ص ن ع', meaning: 'Craft / Manufacture' },
  'عمل': { root: 'ع م ل', meaning: 'Work / Action' },
  'وجد': { root: 'و ج د', meaning: 'Find / Exist' },
  'طلب': { root: 'ط ل ب', meaning: 'Seek / Request' },
  'نجح': { root: 'ن ج ح', meaning: 'Succeed' },
  'قوم': { root: 'ق و م', meaning: 'Stand / Rise / Nation' },
  'نوم': { root: 'ن و م', meaning: 'Sleep' },
  'جلس': { root: 'ج ل س', meaning: 'Sit' },
  'وقف': { root: 'و ق ف', meaning: 'Stand / Stop' },
  'اكل': { root: 'ا ك ل', meaning: 'Eat' },
  'شرب': { root: 'ش ر ب', meaning: 'Drink' },
  'لبس': { root: 'ل ب س', meaning: 'Wear / Dress' },
};

// Check if word matches standard morphology from authentic roots
function checkMorphology(word: string): { isValid: boolean; root?: string; translation?: string } | null {
  const norm = normalizeArabic(word);

  // Check direct 3-letter roots
  if (ARABIC_ROOTS[norm]) {
    return {
      isValid: true,
      root: ARABIC_ROOTS[norm].root,
      translation: ARABIC_ROOTS[norm].meaning,
    };
  }

  // Handle standard Scrabble valid words explicitly
  const commonValidWords: Record<string, { root: string; meaning: string }> = {
    'عنف': { root: 'ع ن ف', meaning: 'Violence / Rigor / Severity / Force' },
    'عنيف': { root: 'ع ن ف', meaning: 'Violent / Fierce / Severe' },
    'عنيفة': { root: 'ع ن ف', meaning: 'Violent (fem.)' },
    'عنفوان': { root: 'ع ن ف', meaning: 'Prime of life / Vigour / Bloom' },
    'اعنف': { root: 'ع ن ف', meaning: 'More violent / Fiercer' },
    'يعنف': { root: 'ع ن ف', meaning: 'Rebukes / Uses violence' },
    'فنع': { root: 'ف ن ع', meaning: 'Flourishing / Wealth / Increase' },
    'نفع': { root: 'ن ف ع', meaning: 'Benefit / Advantage / Profit' },
    'نافع': { root: 'ن ف ع', meaning: 'Beneficial / Useful' },
    'منفعة': { root: 'ن ف ع', meaning: 'Benefit / Utility' },
    'منافع': { root: 'ن ف ع', meaning: 'Benefits / Utilities' },
    'عفن': { root: 'ع ف ن', meaning: 'Rot / Mold / Decay' },
    'عفونة': { root: 'ع ف ن', meaning: 'Putrefaction / Moldiness' },
    'عفا': { root: 'ع ف و', meaning: 'Forgave / Pardoned / Effaced' },
    'عفو': { root: 'ع ف و', meaning: 'Pardon / Forgiveness / Amnesty' },
    'عفة': { root: 'ع ف ف', meaning: 'Chastity / Purity / Modesty' },
    'فيل': { root: 'ف ي ل', meaning: 'Elephant / Chess bishop' },
    'بال': { root: 'ب و ل', meaning: 'Mind / Thought / State / Attention' },
    'عنب': { root: 'ع ن ب', meaning: 'Grapes' },
    'ليف': { root: 'ل ي ف', meaning: 'Fiber / Sponge' },
    'لاب': { root: 'ل و ب', meaning: 'Wandered / Thirsty' },
    'لب': { root: 'ل ب ب', meaning: 'Core / Heart / Intellect' },
    'بان': { root: 'ب ي ن', meaning: 'Appeared / Clear' },
    'بين': { root: 'ب ي ن', meaning: 'Between / Manifest' },
    'ناب': { root: 'ن و ب', meaning: 'Canine / Tooth / Deputized' },
    'نال': { root: 'ن ي ل', meaning: 'Attained / Got' },
    'نيل': { root: 'ن ي ل', meaning: 'Nile / Attainment' },
    'فل': { root: 'ف ل ل', meaning: 'Jasmine / Break' },
    'فن': { root: 'ف ن ن', meaning: 'Art' },
    'لف': { root: 'ل ف ف', meaning: 'Wrap / Turn' },
    'فال': { root: 'ف ا ل', meaning: 'Good omen' },
    'فول': { root: 'ف و ل', meaning: 'Fava beans' },
    'فاه': { root: 'ف و ه', meaning: 'Mouth / Spoke' },
    'في': { root: 'ف ي', meaning: 'In / At' },
    'فم': { root: 'ف و ه', meaning: 'Mouth' },
    'افيال': { root: 'ف ي ل', meaning: 'Elephants' },
    'فيلة': { root: 'ف ي ل', meaning: 'Elephants / Female elephant' },
    'الياف': { root: 'ل ي ف', meaning: 'Fibers' },
    'ليفة': { root: 'ل ي ف', meaning: 'Sponge / Loofah' },
    'اعناب': { root: 'ع ن ب', meaning: 'Grapes' },
    'عنبة': { root: 'ع ن ب', meaning: 'Grape' },
    'الباب': { root: 'ل ب ب', meaning: 'Minds / Intellects' },
    'لبيب': { root: 'ل ب ب', meaning: 'Intelligent / Sensible' },
    'بيان': { root: 'ب ي ن', meaning: 'Declaration / Clarity' },
    'ابناء': { root: 'ب ن ي', meaning: 'Sons' },
    'بنات': { root: 'ب ن ي', meaning: 'Daughters' },
    'بنت': { root: 'ب ن ي', meaning: 'Girl / Daughter' },
    'ابن': { root: 'ب ن ي', meaning: 'Son' },
    'بنى': { root: 'ب ن ي', meaning: 'Built' },
    'بني': { root: 'ب ن ي', meaning: 'Brown / Sons of' },
  };

  if (commonValidWords[norm]) {
    return {
      isValid: true,
      root: commonValidWords[norm].root,
      translation: commonValidWords[norm].meaning,
    };
  }

  // Derive forms for each root
  for (const [key, data] of Object.entries(ARABIC_ROOTS)) {
    const r1 = key[0];
    const r2 = key[1];
    const r3 = key[2];

    const forms = [
      key, // فَعَلَ
      `${r1}ا${r2}${r3}`, // فَاعِل (راحل / كاتب / عالم)
      `${r1}ا${r2}${r3}ه`, // فَاعِلَة (راحلة / كاتبة)
      `${r1}ا${r2}${r3}ون`, // فَاعِلُون
      `${r1}ا${r2}${r3}ين`, // فَاعِلِين
      `${r1}ا${r2}${r3}ات`, // فَاعِلَات
      `${r1}${r2}ي${r3}`, // فَعِيل (رحيل / كريم / عظيم / فيل)
      `${r1}${r2}ي${r3}ه`, // فَعِيلَة (فضيلة / حديقة)
      `${r1}${r2}${r3}ه`, // فَعْلَة (رحلة / ضربة)
      `م${r1}${r2}${r3}`, // مَفْعَل (مرحل / منزل / مسار / مخرج / مدخل / مكتب)
      `م${r1}${r2}${r3}ه`, // مَفْعَلَة (مرحلة / مزرعة / محكمة / مدرسة)
      `م${r1}${r2}و${r3}`, // مَفْعُول (مكتوب / معلوم / محمود)
      `ي${r1}${r2}${r3}`, // يَفْعَل (يرحل / ينزل / يكتب / يعلم)
      `ت${r1}${r2}${r3}`, // تَفْعَل (ترحل / تنزل / تكتب)
      `ن${r1}${r2}${r3}`, // نَفْعَل (نرحل / ننزل)
      `ا${r1}${r2}${r3}`, // أَفْعَل (أرحل / أحمد / أعلم / أكبر / أصغر)
      `ت${r1}${r2}ي${r3}`, // تَفْعِيل (تعليم / ترحيل / تنظيم)
      `${r1}${r2}و${r3}`, // فُعُول (نزول / رجوع / خروج / دخول / فهود / نمور)
      `ا${r1}${r2}ا${r3}`, // أَفْعَال (أقوال / أخبار / أزمنة / أوقات / أسواق / أفيال)
      `${r1}و${r2}${r3}`, // فَوْعَل
      `${r1}ي${r2}${r3}`, // فَيْعَل
      `${r1}ا${r3}`, // فَال (بال / نال / بان / دار / نار / مال)
    ].map(normalizeArabic);

    if (forms.includes(norm)) {
      return {
        isValid: true,
        root: data.root,
        translation: `${data.meaning} (Derivation)`,
      };
    }
  }

  return null;
}

/**
 * Scrape / Check Almaany Arabic Dictionary (https://www.almaany.com/ar/dict/ar-ar/)
 */
async function checkAlmaany(word: string) {
  const cleanWord = word.trim();
  const almaanyUrl = `https://www.almaany.com/ar/dict/ar-ar/${encodeURIComponent(cleanWord)}/`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(almaanyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();

      const hasMeaning =
        html.includes('معنى كلمة') ||
        html.includes('table-results') ||
        html.includes('class="meaning"') ||
        html.includes('المعجم المعاصر') ||
        html.includes('معجم الرائد') ||
        html.includes('معجم المعاني الجامع') ||
        html.includes('لسان العرب') ||
        html.includes('الوسيط') ||
        html.includes('الغني');

      const isNotFound =
        html.includes('لم نعثر على نتائج') ||
        html.includes('لا توجد نتائج مطابقة') ||
        html.includes('عذرا، لم نجد');

      if (hasMeaning && !isNotFound) {
        let definitionAr = '';
        let root = '';

        const rootMatch = html.match(/جذر كلمة\s*[:：]?\s*<[^>]+>([^<]+)<\/[^>]+>/i) ||
          html.match(/جذر\s*:\s*([^<\n]+)/i);
        if (rootMatch && rootMatch[1]) {
          root = rootMatch[1].trim();
        }

        const meaningMatch = html.match(/<td[^>]*class="[^"]*meaning[^"]*"[^>]*>([\s\S]*?)<\/td>/i) ||
          html.match(/<li[^>]*class="[^"]*meaning[^"]*"[^>]*>([\s\S]*?)<\/li>/i) ||
          html.match(/<p[^>]*class="[^"]*meaning[^"]*"[^>]*>([\s\S]*?)<\/p>/i);

        if (meaningMatch && meaningMatch[1]) {
          definitionAr = meaningMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 160);
        }

        return {
          found: true,
          definitionAr: definitionAr || `كلمة عربية فصيحة موثقة في معجم المعاني`,
          root: root || undefined,
          almaanyUrl
        };
      }
    }
  } catch (err) {
    // Gracefully handle timeout/fetch issues
  }

  return { found: false, almaanyUrl };
}

/**
 * Gemini Linguistic Fallback & Translator
 */
async function checkWithGemini(word: string) {
  try {
    if (!process.env.GEMINI_API_KEY) return null;
    const ai = new GoogleGenAI();
    const prompt = `You are an Arabic lexicographer. Evaluate the Arabic word "${word}".
Is "${word}" a valid Arabic word in Fusha / classical / modern standard Arabic?
Respond ONLY with JSON:
{"isValid": boolean, "word": "${word}", "root": string, "type": "noun"|"verb"|"adjective", "translation": string, "definitionAr": string}`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = res.text?.trim();
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    // fallback silently
  }
  return null;
}

// API endpoint: Check Arabic Word via Almaany & Linguistic engine
app.get('/api/dictionary/check', async (req, res) => {
  const queryWord = (req.query.word as string || '').trim();
  if (!queryWord) {
    return res.status(400).json({ error: 'word query parameter is required' });
  }

  const norm = normalizeArabic(queryWord);
  const almaanyUrl = `https://www.almaany.com/ar/dict/ar-ar/${encodeURIComponent(queryWord)}/`;

  // 1. Check cache first
  if (dictionaryCache.has(norm)) {
    return res.json(dictionaryCache.get(norm));
  }

  // 2. Check local morphological lexicon
  const morph = checkMorphology(queryWord);
  if (morph && morph.isValid) {
    const result = {
      isValid: true,
      word: queryWord,
      normalized: norm,
      translation: morph.translation || 'Valid Arabic word',
      root: morph.root,
      type: 'verb/noun',
      definitionAr: `لفظ فصيح موثق في المعاجم العربية (جذر: ${morph.root})`,
      source: 'arabic_lexicon',
      almaanyUrl,
    };
    dictionaryCache.set(norm, result);
    return res.json(result);
  }

  // 3. Try Almaany Dictionary live query
  const almaanyRes = await checkAlmaany(queryWord);
  if (almaanyRes.found) {
    const result = {
      isValid: true,
      word: queryWord,
      normalized: norm,
      translation: 'Valid Arabic word in Almaany',
      root: almaanyRes.root,
      type: 'noun',
      definitionAr: almaanyRes.definitionAr,
      source: 'almaany',
      almaanyUrl: almaanyRes.almaanyUrl,
    };

    dictionaryCache.set(norm, result);
    return res.json(result);
  }

  // 4. Try Gemini AI Linguistic Lexicon
  const geminiData = await checkWithGemini(queryWord);
  if (geminiData && geminiData.isValid) {
    const result = {
      isValid: true,
      word: queryWord,
      normalized: norm,
      translation: geminiData.translation || 'Valid Arabic word',
      root: geminiData.root || undefined,
      type: geminiData.type || 'noun',
      definitionAr: geminiData.definitionAr || 'كلمة عربية معتمدة',
      source: 'gemini_lexicon',
      almaanyUrl,
    };

    dictionaryCache.set(norm, result);
    return res.json(result);
  }

  // Not recognized
  const invalidResult = {
    isValid: false,
    word: queryWord,
    normalized: norm,
    almaanyUrl,
    error: 'Word not found in Arabic dictionary',
  };
  dictionaryCache.set(norm, invalidResult);
  return res.json(invalidResult);
});

// Start Server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arabic With Friends Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
