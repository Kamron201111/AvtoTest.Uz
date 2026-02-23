import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TestResult } from "../../types";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useUI } from "../../context/UIContext";
import { isPremiumActive, getQuestions } from "../../services/db";

const EXPLANATIONS: Record<string, string> = {
  "qoidalar": "Yo'l harakati qoidalari bo'yicha: ",
  "belgilar": "Yo'l belgilari bo'yicha: ",
  "jarimalar": "Jarima miqdorlari bo'yicha: ",
  "xavfsizlik": "Xavfsizlik qoidalari bo'yicha: ",
  "texnik": "Transport vositasi texnik holatiga doir: ",
  "birinchi-yordam": "Birinchi tibbiy yordam bo'yicha: ",
  "umumiy": "Umumiy qoidalar bo'yicha: ",
};

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useUI();
  const result = location.state?.result as TestResult;
  const [openErrorIdx, setOpenErrorIdx] = useState<number | null>(null);
  const isPremium = isPremiumActive();

  if (!result) {
    return (
      <div className="p-10 text-center dark:text-white">Natija topilmadi.</div>
    );
  }

  const passed = result.scorePercentage >= 85;
  const allQuestions = getQuestions();
  const wrongDetails = result.details.filter(d => !d.isCorrect);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-6">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center ${passed ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"} animate-fadeIn`}
          >
            {passed ? (
              <CheckCircle size={40} className="sm:w-12 sm:h-12" />
            ) : (
              <XCircle size={40} className="sm:w-12 sm:h-12" />
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
              {passed ? t("res_congrats") : t("res_fail")}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              {t("res_score_text", {
                total: result.totalQuestions,
                correct: result.correctCount,
              })}
            </p>
          </div>

          <div className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white animate-fadeIn">
            {result.scorePercentage}%
          </div>

          <div className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>
              ⏱️ {Math.floor(result.timeSpentSeconds / 60)}m{" "}
              {result.timeSpentSeconds % 60}s
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4">
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
                  const q = allQuestions.find(q => q.id === detail.questionId);
                  if (!q) return null;
                  const isOpen = openErrorIdx === idx;
                  const prefix = EXPLANATIONS[q.category || "umumiy"] || "";

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800">
                      <button
                        onClick={() => setOpenErrorIdx(isOpen ? null : idx)}
                        className="w-full p-3 sm:p-4 flex items-start gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                            {q.questionText}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-red-500">
                              Sizning: <strong>{detail.userAnswer || "javob berilmadi"}</strong>
                            </span>
                            <span className="text-xs text-green-600">
                              To'g'ri: <strong>{detail.correctAnswer}</strong>
                            </span>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-1" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          {/* Variantlar */}
                          <div className="grid gap-1.5">
                            {(["A","B","C","D"] as const).map(opt => (
                              <div key={opt} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                                opt === detail.correctAnswer
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : opt === detail.userAnswer
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                  : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
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
                              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                                📖 Tushuntirish:
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-300">
                                {prefix}To'g'ri javob <strong>{detail.correctAnswer}</strong> — "{q.options[detail.correctAnswer as keyof typeof q.options]}".{" "}
                                {q.category === "jarimalar" && "Jarima miqdori O'zbekiston Respublikasining YHQ ga muvofiq belgilangan."}
                                {q.category === "belgilar" && "Bu belgi yo'l harakati ishtirokchilarini xabardor qilish uchun o'rnatiladi."}
                                {q.category === "qoidalar" && "Bu qoida YHQ ning tegishli moddasi asosida amal qiladi."}
                                {q.category === "xavfsizlik" && "Xavfsizlik talablariga rioya qilish majburiydir."}
                                {q.category === "texnik" && "Transport vositasining texnik holati YHQ talablariga mos bo'lishi shart."}
                                {q.category === "birinchi-yordam" && "Birinchi tibbiy yordam ko'rsatish qonuniy majburiyat hisoblanadi."}
                                {(q.category === "umumiy" || !q.category) && "Ushbu qoida yo'l harakati xavfsizligini ta'minlash uchun zarur."}
                              </p>
                            </div>
                          ) : (
                            <div
                              className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 cursor-pointer"
                              onClick={() => navigate("/user")}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Lock size={12} className="text-amber-600" />
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                  Premium tushuntirish
                                </p>
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

          {/* Tarix */}
          <button
            onClick={() => navigate("/history")}
            className="w-full p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-98"
          >
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base">
              <AlertTriangle className="text-orange-500 flex-shrink-0" size={18} />
              {t("res_analyze")}
            </span>
            <span className="text-slate-400">&rarr;</span>
          </button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/user")}
              className="py-2.5 sm:py-3 px-3 sm:px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg sm:rounded-xl font-bold hover:border-slate-300 dark:hover:border-slate-500 transition-all active:scale-95"
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <Home size={16} className="sm:w-[18px] sm:h-[18px]" />{" "}
                {t("res_home")}
              </span>
            </button>
            <button
              onClick={() => navigate("/quiz?count=20")}
              className="py-2.5 sm:py-3 px-3 sm:px-4 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />{" "}
                {t("res_retry")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
