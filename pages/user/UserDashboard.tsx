import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, History, Trophy, BarChart2, TrendingUp,
  CheckCircle, Award, Clock, ArrowLeft,
} from "lucide-react";
import {
  getResults, getDailyTestInfo,
} from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { TestResult } from "../../types";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [dailyInfo, setDailyInfo] = useState<{ used: number; limit: number; canTest: boolean }>({ used: 0, limit: 20, canTest: true });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [hist, daily] = await Promise.all([
        getResults(user.id),
        getDailyTestInfo(user.id),
      ]);
      setHistory(hist);
      setDailyInfo(daily);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const startTest = async () => {
    if (!user) return;
    navigate(`/quiz?count=${questionCount}`);
  };

  const avgScore = history.length ? Math.round(history.reduce((s, r) => s + r.scorePercentage, 0) / history.length) : 0;
  const passCount = history.filter(r => r.scorePercentage >= 85).length;
  const totalMinutes = Math.round(history.reduce((s, r) => s + (r.timeSpentSeconds || 0), 0) / 60);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500">Yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pb-24">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Xush kelibsiz 👋</p>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{user?.name}</h1>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Kunlik limit */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            Bugungi testlar:
          </span>
          <span className="font-black text-blue-600 dark:text-blue-400">
            {dailyInfo.used} / {dailyInfo.limit === 999 ? "∞" : dailyInfo.limit}
          </span>
        </div>

        {/* TEST BOSHLASH */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5">
            <h2 className="text-white font-black text-xl mb-1">🚗 Test Topshirish</h2>
            <p className="text-blue-100 text-sm">Savol sonini tanlang va boshlang</p>
          </div>
          <div className="p-5 space-y-4">
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
            <button onClick={startTest}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all">
              <Play className="w-6 h-6" fill="white" /> Testni Boshlash
            </button>
            <div className="grid grid-cols-3 gap-2">
              {[
                { path: "/talim", icon: "📚", label: "Kategoriyalar" },
                { path: "/history", icon: "📋", label: "Tarix" },
                { path: "/kurslar", icon: "🏆", label: "Kurslar" },
              ].map(({ path, icon, label }) => (
                <button key={path} onClick={() => navigate(path)}
                  className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all">
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STATISTIKA */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Jami testlar", value: history.length, icon: BarChart2, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
            { label: "O'rtacha ball", value: `${avgScore}%`, icon: TrendingUp, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
            { label: "O'tgan testlar", value: passCount, icon: CheckCircle, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Vaqt (daqiqa)", value: totalMinutes, icon: Clock, bg: "bg-violet-100 dark:bg-violet-900/30", color: "text-violet-600 dark:text-violet-400" },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-200 dark:border-slate-700 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-xl font-black text-slate-800 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* SO'NGGI TESTLAR */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" /> So'nggi testlar
              </h3>
              <button onClick={() => navigate("/history")} className="text-blue-500 text-sm font-bold">Hammasi →</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {history.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${r.scorePercentage >= 85 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {r.scorePercentage >= 85 ? "✓" : "✗"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{r.correctCount}/{r.totalQuestions} to'g'ri</p>
                      <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString("uz-UZ")}</p>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${r.scorePercentage >= 85 ? "text-green-600" : "text-red-500"}`}>{r.scorePercentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
