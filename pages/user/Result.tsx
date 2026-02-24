import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TestResult, Question } from "../../types";
import { CheckCircle, XCircle, RotateCcw, Home, AlertTriangle, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { isPremiumActive } from "../../services/supabase";

const EXPLANATIONS: Record<string, string> = {
  qoidalar: "Yo'l harakati qoidalari bo'yicha: ",
  belgilar: "Yo'l belgilari bo'yicha: ",
  jarimalar: "Jarima miqdorlari bo'yicha: ",
  xavfsizlik: "Xavfsizlik qoidalari bo'yicha: ",
  texnik: "Transport vositasi texnik holatiga doir: ",
  "birinchi-yordam": "Birinchi tibbiy yordam bo'yicha: ",
  umumiy: "Umumiy qoidalar bo'yicha: ",
};

const LEGAL_NOTES: Record<string, string> = {
  jarimalar: "Jarima miqdori O'zbekiston Respublikasining YHQ ga muvofiq belgilangan.",
  belgilar: "Bu belgi yo'l harakati ishtirokchilarini xabardor qilish uchun o'rnatiladi.",
  qoidalar: "Bu qoida YHQ ning tegishli moddasi asosida amal qiladi.",
  xavfsizlik: "Xavfsizlik talablariga rioya qilish majburiydir.",
  texnik: "Transport vositasining texnik holati YHQ talablariga mos bo'lishi shart.",
  "birinchi-yordam": "Birinchi tibbiy yordam ko'rsatish qonuniy majburiyat hisoblanadi.",
  umumiy: "Ushbu qoida yo'l harakati xavfsizligini ta'minlash uchun zarur.",
};

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useUI();
  const { user } = useAuth();
  const result = location.state?.result as TestResult;
  const passedQuestions = location.state?.questions as Question[] | undefined;
  const [openErrorIdx, setOpenErrorIdx] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      isPremiumActive(user.id).then(setIsPremium);
    }
  }, [user]);

  if (!result) return <div className="p-10 text-center dark:text-white">Natija topilmadi.</div>;

  const passed = result.scorePercentage >= 85;
  const wrongDetails = result.details.filter(d => !d.isCorrect);

  const getQuestion = (questionId: string): Question | undefined => {
    if (passedQuestions) return passedQuestions.find(q => q.id === questionId);
    return undefined;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-6">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">

        {/* Natija */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center ${passed ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}>
            {passed ? <CheckCircle size={40} className="sm:w-12 sm:h-12" /> : <XCircle size={40} className="sm:w-12 sm:h-12" />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
              {passed ? t("res_congrats") : t("res_fail")}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              {t("res_score_text", { total: result.totalQuestions, correct: result.correctCount })}
            </p>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white">{result.scorePercentage}%</div>
          <div className="flex justify-center gap-4 text-sm text-slate-500">
            <span>⏱️ {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s</span>
            <span>✅ {result.correctCount} to'g'ri</span>
            <span>❌ {wrongDetails.length} xato</span>
          </div>
        </div>

        {/* Xatolar tahlili */}
        {wrongDetails.length > 0 && (
          <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 flex items-center gap-2 border-b border-orange-100 dark:border-orange-900">
              <AlertTriangle className="text-orange-500 flex-shrink-0" size={18} />
              <span className="font-bold text-orange-700 dark:text-orange-400 text-sm sm:text-base">
                Xatolar tahlili ({wrongDetails.length} ta xato)
              </span>
              {!isPremium && (
                <span className="ml-auto flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-bold">
                  <Lock size={10} /> Premium
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {wrongDetails.map((detail, idx) => {
                const q = getQuestion(detail.questionId);
                const isOpen = openErrorIdx === idx;

                return (
                  <div key={idx} className="bg-white dark:bg-slate-800">
                    <button onClick={() => setOpenErrorIdx(isOpen ? null : idx)}
                      className="w-full p-3 sm:p-4 flex items-start gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-black">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                          {q ? q.questionText : `Savol #${idx + 1}`}
                        </p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-red-500">Sizning: <strong>{detail.userAnswer || "javob berilmadi"}</strong></span>
                          <span className="text-xs text-green-600">To'g'ri: <strong>{detail.correctAnswer}</strong></span>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-1" />}
                    </button>

                    {isOpen && q && (
                      <div className="px-4 pb-4 space-y-3">
                        {/* Variantlar */}
                        <div className="grid gap-1.5">
                          {(["A", "B", "C", "D"] as const).map(opt => (
                            <div key={opt} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                              opt === detail.correctAnswer ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                              opt === detail.userAnswer ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                              "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            }`}>
                              <span className="font-black w-4">{opt}.</span>
                              <span>{q.options[opt]}</span>
                              {opt === detail.correctAnswer && <CheckCircle size={12} className="ml-auto" />}
                              {opt === detail.userAnswer && opt !== detail.correctAnswer && <XCircle size={12} className="ml-auto" />}
                            </div>
                          ))}
                        </div>

                        {/* Premium tushuntirish */}
                        {isPremium ? (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">📖 Tushuntirish:</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {EXPLANATIONS[q.category || "umumiy"]}To'g'ri javob <strong>{detail.correctAnswer}</strong> — "{q.options[detail.correctAnswer as keyof typeof q.options]}".{" "}
                              {LEGAL_NOTES[q.category || "umumiy"]}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 cursor-pointer"
                            onClick={() => navigate("/user")}>
                            <div className="flex items-center gap-2 mb-1">
                              <Lock size={12} className="text-amber-600" />
                              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Premium tushuntirish</p>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-300">
                              ⭐ Premium obuna bilan har bir xatongizga batafsil tushuntirish va qonun moddasi ko'rinadi.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tugmalar */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button onClick={() => navigate("/user")}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl font-bold hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
            <Home size={16} /> {t("res_home")}
          </button>
          <button onClick={() => navigate("/quiz?count=20")}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
            <RotateCcw size={16} /> {t("res_retry")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
