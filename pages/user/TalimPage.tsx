import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, BookOpen, AlertTriangle, Heart, Wrench, Car, DollarSign, Shield, Ticket } from "lucide-react";
import { getQuestions } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { id: "umumiy",        nameUz: "Umumiy",                icon: BookOpen,      color: "from-blue-500 to-blue-600",    emoji: "📚" },
  { id: "belgilar",      nameUz: "Yo'l Belgilari",        icon: AlertTriangle, color: "from-red-500 to-rose-600",     emoji: "🚦" },
  { id: "qoidalar",      nameUz: "Harakatlanish Qoidalari", icon: Shield,      color: "from-indigo-500 to-violet-600", emoji: "📖" },
  { id: "xavfsizlik",    nameUz: "Xavfsizlik",            icon: Car,           color: "from-green-500 to-emerald-600", emoji: "🛡️" },
  { id: "texnik",        nameUz: "Texnik Bilim",          icon: Wrench,        color: "from-slate-500 to-slate-600",   emoji: "🔧" },
  { id: "birinchi-yordam", nameUz: "Birinchi Yordam",     icon: Heart,         color: "from-pink-500 to-rose-500",     emoji: "❤️" },
  { id: "jarimalar",     nameUz: "Jarimalar",             icon: DollarSign,    color: "from-orange-500 to-amber-500",  emoji: "⚠️" },
];

const TalimPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalQ, setTotalQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getQuestions();
        setTotalQ(all.length);
        const c: Record<string, number> = {};
        CATEGORIES.forEach(cat => {
          if (cat.id === "umumiy") {
            c[cat.id] = all.filter(q => !q.category || q.category === "umumiy").length;
          } else {
            c[cat.id] = all.filter(q => q.category === cat.id).length;
          }
        });
        setCounts(c);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startTest = () => navigate(`/quiz?count=${questionCount}`);
  const startByCategory = (catId: string) => {
    if ((counts[catId] || 0) === 0) return;
    navigate(`/quiz?topic=${catId}&count=20`);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4 pt-8 pb-6">
        <h1 className="text-2xl font-black text-white mb-1">🚗 Ta'lim</h1>
        <p className="text-blue-200 text-sm">Test topshirish va kategoriyalar</p>

        {/* Tezkor test boshlash */}
        <div className="mt-4 bg-white/10 border border-white/20 rounded-2xl p-4">
          <p className="text-white font-bold text-sm mb-3">Testni boshlash</p>
          <div className="flex gap-2 mb-3">
            {[10, 20, 30, 40].map(n => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${questionCount === n ? "bg-white text-blue-700 shadow" : "bg-white/20 text-white"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={startTest}
            disabled={totalQ === 0}
            className="w-full py-3.5 bg-white text-blue-700 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            <Play className="w-5 h-5" fill="currentColor" />
            Testni Boshlash
          </button>
          {totalQ === 0 && (
            <p className="text-white/60 text-xs text-center mt-2">Admin savollar qo'shishini kuting</p>
          )}
        </div>
      </div>

      {/* Kategoriyalar */}
      <div className="px-4 py-5">
        <h2 className="font-black text-slate-800 dark:text-white text-base mb-3">
          Kategoriyalar bo'yicha
        </h2>

        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.id] || 0;
            const Icon = cat.icon;
            const hasQ = count > 0;

            return (
              <button
                key={cat.id}
                onClick={() => startByCategory(cat.id)}
                disabled={!hasQ}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  hasQ
                    ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-300 hover:shadow-md active:scale-[0.99] cursor-pointer"
                    : "bg-slate-100 dark:bg-slate-800/50 border-transparent opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
                  {cat.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <p className={`font-bold text-sm ${hasQ ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                    {cat.nameUz}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {hasQ ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">{count} ta savol bor</span>
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"/>
                        <span className="text-xs text-slate-400">Savol yo'q</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow or count badge */}
                {hasQ ? (
                  <div className="flex items-center gap-1.5">
                    <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${cat.color} bg-opacity-10`}>
                      <span className="text-xs font-black text-white">{count}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-slate-400 text-xs">—</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {totalQ > 0 && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              💡 Jami <strong>{totalQ}</strong> ta savol mavjud. Kategoriya tanlang yoki umumiy test boshlang!
            </p>
          </div>
        )}

        {/* Biletlar bo'limi */}
        <div className="mt-6">
          <h2 className="font-black text-slate-800 dark:text-white text-base mb-3">
            🎫 Imtihon Biletlari
          </h2>
          <button
            onClick={() => navigate("/biletlar")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:border-green-400 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
              🎫
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-slate-800 dark:text-white text-sm">Biletlar bo'yicha test</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-semibold">Har biletda 10 ta savol • GAI imtihon formati</p>
            </div>
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalimPage;
