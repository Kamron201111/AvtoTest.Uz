import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { getQuestions } from "../../services/supabase";

const CATEGORIES = [
  { id: "umumiy", name: "Umumiy", emoji: "📚", color: "from-blue-500 to-blue-600" },
  { id: "belgilar", name: "Yo'l Belgilari", emoji: "🚦", color: "from-red-500 to-red-600" },
  { id: "qoidalar", name: "Harakatlanish Qoidalari", emoji: "📋", color: "from-indigo-500 to-indigo-600" },
  { id: "xavfsizlik", name: "Xavfsizlik", emoji: "🛡️", color: "from-green-500 to-green-600" },
  { id: "texnik", name: "Texnik Bilim", emoji: "🔧", color: "from-gray-600 to-gray-700" },
  { id: "birinchi-yordam", name: "Birinchi Yordam", emoji: "❤️", color: "from-pink-500 to-pink-600" },
  { id: "jarimalar", name: "Jarimalar", emoji: "💰", color: "from-orange-500 to-orange-600" },
];

const TalimPage: React.FC = () => {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(20);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const questions = await getQuestions();
      const c: Record<string, number> = {};
      CATEGORIES.forEach(cat => {
        if (cat.id === "umumiy") {
          c[cat.id] = questions.filter(q => !q.category || q.category === "umumiy").length;
        } else {
          c[cat.id] = questions.filter(q => q.category === cat.id).length;
        }
      });
      setCounts(c);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/user")}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Test</p>
            <h1 className="font-black text-slate-800 dark:text-white">Ta'lim Markazi</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Tezkor test boshlash */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5">
            <h2 className="text-white font-black text-xl">🚗 Umumiy Test</h2>
            <p className="text-blue-100 text-sm mt-1">Barcha kategoriyalardan test topshing</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">Savol soni:</span>
              <div className="flex gap-2">
                {[10, 20, 30, 40].map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)}
                    className={`w-11 h-9 rounded-xl font-bold text-sm transition-all ${questionCount === n ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => navigate(`/quiz?count=${questionCount}`)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all">
              <Play className="w-6 h-6" fill="white" /> Testni Boshlash
            </button>
          </div>
        </div>

        {/* Kategoriyalar */}
        <div>
          <h3 className="font-black text-slate-800 dark:text-white text-base mb-3">📂 Kategoriyalar</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 text-blue-500 animate-spin" /></div>
          ) : (
            <div className="space-y-2">
              {CATEGORIES.map(cat => {
                const count = counts[cat.id] || 0;
                const hasQ = count > 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => hasQ && navigate(`/quiz?topic=${cat.id}&count=20`)}
                    disabled={!hasQ}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm transition-all text-left ${hasQ ? "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer" : "border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl flex-shrink-0 shadow`}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{cat.name}</p>
                      {hasQ ? (
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">{count} ta savol bor</p>
                      ) : (
                        <p className="text-xs text-red-400 font-semibold mt-0.5">Savol yo'q</p>
                      )}
                    </div>
                    {hasQ && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1.5 rounded-xl">
                        Boshlash
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalimPage;
