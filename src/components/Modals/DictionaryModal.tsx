import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, BookOpen, ExternalLink, Loader2, Globe } from 'lucide-react';
import { arabicDictionary, ArabicWordEntry } from '../../services/dictionary';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DictionaryModal({ isOpen, onClose }: DictionaryModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    checked: boolean;
    isValid: boolean;
    word?: string;
    entry?: ArabicWordEntry | null;
    definitionAr?: string;
    source?: string;
    almaanyUrl?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    try {
      const res = await arabicDictionary.checkWordLive(clean);
      setResult({
        checked: true,
        isValid: res.isValid,
        word: clean,
        entry: res.entry,
        definitionAr: res.definitionAr,
        source: res.source,
        almaanyUrl: res.almaanyUrl,
      });
    } catch (err) {
      console.error(err);
      const isValid = arabicDictionary.isValidWord(clean);
      const entry = arabicDictionary.getDefinition(clean);
      setResult({
        checked: true,
        isValid,
        word: clean,
        entry,
        almaanyUrl: arabicDictionary.getAlmaanyUrl(clean),
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleWords = [
    { word: 'رحل', translation: 'Departed / Traveled', root: 'ر ح ل' },
    { word: 'سفر', translation: 'Journey / Travel', root: 'س ف ر' },
    { word: 'نزل', translation: 'Descended / Stayed', root: 'ن ز ل' },
    { word: 'سلام', translation: 'Peace / Greeting', root: 'س ل م' },
    { word: 'حكمة', translation: 'Wisdom', root: 'ح ك م' },
    { word: 'كتاب', translation: 'Book', root: 'ك ت ب' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 border border-teal-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-lg text-white">معجم المعاني العربي (Almaany Dictionary)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-teal-950/40 border border-teal-500/20 px-3 py-2 rounded-xl">
          <span className="text-xs text-teal-200 flex items-center gap-1.5 font-medium">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            مربوط بقاعدة معجم المعاني (almaany.com)
          </span>
          <a
            href="https://www.almaany.com/ar/dict/ar-ar/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-teal-400 hover:text-teal-300 underline flex items-center gap-1 font-semibold"
          >
            زيارة المعجم <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-slate-300">
          تحقق من صحة أي كلمة عربية (مثل <span className="font-arabic text-amber-300 font-bold">رحل</span> أو <span className="font-arabic text-amber-300 font-bold">سفر</span>) واستعراض معناها وجذرها وقبولها في اللعبة.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            dir="rtl"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResult(null);
            }}
            placeholder="اكتب كلمة بالعربية (مثال: رحل)..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-arabic text-lg focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center transition active:scale-95 min-w-[54px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>

        {/* Search Result */}
        {result && result.checked && (
          <div
            className={`p-4 rounded-2xl border ${
              result.isValid
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-arabic text-2xl font-bold text-white">
                    {result.word || query}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wider ${
                      result.isValid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {result.isValid ? 'كلمة معتمدة ✓' : 'غير معتمدة'}
                  </span>
                </div>

                {result.isValid ? (
                  <div className="text-xs space-y-1 text-slate-300 pt-1">
                    {result.entry?.translation && (
                      <p><span className="text-slate-400">المعنى / Meaning:</span> <span className="font-semibold text-white">{result.entry.translation}</span></p>
                    )}
                    {result.entry?.root && (
                      <p><span className="text-slate-400">الجذر اللغوي:</span> <span className="font-arabic font-bold text-amber-300 text-sm">{result.entry.root}</span></p>
                    )}
                    {result.definitionAr && (
                      <p className="text-[11px] text-emerald-300/90 font-arabic italic bg-emerald-900/30 p-2 rounded-lg border border-emerald-700/30">
                        {result.definitionAr}
                      </p>
                    )}

                    {result.almaanyUrl && (
                      <a
                        href={result.almaanyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-200 rounded-lg text-xs font-semibold transition"
                      >
                        عرض في معجم المعاني الكامل <ExternalLink className="w-3 h-3 text-teal-400" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-rose-300/90">لم يتم العثور على الكلمة كلفظ فصيح في معجم المعاني.</p>
                    {result.almaanyUrl && (
                      <a
                        href={result.almaanyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 rounded-lg text-xs font-semibold transition"
                      >
                        البحث المباشر في almaany.com <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Popular Word Suggestions */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            كلمات شائعة ومعتمدة في المعجم
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleWords.map((item) => (
              <button
                key={item.word}
                type="button"
                onClick={() => {
                  setQuery(item.word);
                  setResult({
                    checked: true,
                    isValid: true,
                    word: item.word,
                    entry: item as ArabicWordEntry,
                    almaanyUrl: arabicDictionary.getAlmaanyUrl(item.word),
                  });
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs font-arabic text-amber-200 transition"
              >
                {item.word} <span className="text-[10px] text-slate-400 font-sans">({item.translation})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
