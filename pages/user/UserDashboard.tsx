import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  History,
  Trophy,
  Target,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Zap,
  Star,
  AlertCircle,
  Heart,
  CreditCard,
  Copy,
  Check,
  Calendar,
  Clock,
} from "lucide-react";
import {
  getResults,
  getUserProgress,
  checkAndAwardBadges,
  getDailyTestInfo,
  isPremiumActive,
  getPremiumInfo,
  activatePremiumCode,
} from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { TestResult } from "../../types";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useUI();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState(false);
  // Premium
  const [premiumStep, setPremiumStep] = useState<"closed"|"plans"|"payment"|"confirm">("closed");
  const [selectedPlan, setSelectedPlan] = useState<{label:string;price:number;days:number}|null>(null);
  const [cardCopied, setCardCopied] = useState(false);
  const [premiumCode, setPremiumCode] = useState("");
  const [premiumMsg, setPremiumMsg] = useState<{type:"success"|"error";text:string}|null>(null);
  const [dailyInfo, setDailyInfo] = useState(getDailyTestInfo());
  const [premiumInfo, setPremiumInfo] = useState(getPremiumInfo());

  useEffect(() => {
    if (user) {
      setHistory(getResults(user.id));
      checkAndAwardBadges(user.id);
      setProgress(getUserProgress(user.id));
    }
  }, [user]);

  const startTest = () => {
    const info = getDailyTestInfo();
    if (!info.canTest) {
      setPremiumStep("plans");
      return;
    }
    navigate(`/quiz?count=${questionCount}`);
  };

  const PLANS = [
    { label: "1 Hafta", price: 15000, days: 7 },
    { label: "1 Oy",   price: 49000, days: 30 },
    { label: "1 Yil",  price: 350000, days: 365 },
  ];
  const CARD_NUMBER = "9860 1266 7183 6719";
  const CARD_OWNER  = "Valiyev Kamron";
  const CARD_TYPE   = "Humo / UzCard";
  const ADMIN_TG    = "https://t.me/kamron201";

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g,""));
    setCardCopied(true);
    setTimeout(()=>setCardCopied(false),2000);
  };

  const handleActivateCode = () => {
    if (!premiumCode.trim()) return;
    const result = activatePremiumCode(premiumCode);
    if (result.success) {
      setPremiumMsg({ type:"success", text: result.message });
      setPremiumInfo(getPremiumInfo());
      setDailyInfo(getDailyTestInfo());
      setTimeout(()=>{ setPremiumStep("closed"); setPremiumMsg(null); setPremiumCode(""); }, 2000);
    } else {
      setPremiumMsg({ type:"error", text: result.message });
    }
  };

  const copyCardNumber = () => {
    const cardNumber = "8600 1234 5678 9012";
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastResult = history.length > 0 ? history[0] : null;
  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((acc, curr) => acc + curr.scorePercentage, 0) /
            history.length,
        )
      : 0;

  const xpProgress = progress
    ? (progress.xp / progress.xpForNextLevel) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">

      {/* ======= PREMIUM MODAL ======= */}
      {premiumStep !== "closed" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* --- STEP 1: Paketlar --- */}
            {premiumStep === "plans" && (
              <div>
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-center relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"/>
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"/>
                  <div className="relative z-10">
                    <div className="text-5xl mb-2">⭐</div>
                    <h2 className="text-2xl font-black text-white">Premium Obuna</h2>
                    <p className="text-blue-100 text-sm mt-1">Kunlik test limitiga yetdingiz</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
                    Premium bilan nimalar ochiladi:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[["♾","Cheksiz test"],["🔍","Xatolar tahlili"],["🏛","Real simulyator"],["🔔","Bildirgilar"]].map(([icon,text])=>(
                      <div key={text} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5">
                        <span className="text-base">{icon}</span>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-5">
                    {PLANS.map(plan=>(
                      <button
                        key={plan.label}
                        onClick={()=>{ setSelectedPlan(plan); setPremiumStep("payment"); }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${plan.days===30?"border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-200/50":"border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 dark:text-white">{plan.label}</span>
                            {plan.days===30 && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">MASHHUR</span>}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{plan.days} kun</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-blue-600">{plan.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 block">so'm</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="text-xs text-slate-400 text-center mb-3">Allaqachon kod bormisiz?</p>
                    <div className="flex gap-2">
                      <input
                        value={premiumCode}
                        onChange={e=>{setPremiumCode(e.target.value.toUpperCase());setPremiumMsg(null);}}
                        placeholder="PREM-XXXXXX-XX"
                        className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={handleActivateCode} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
                        Kirish
                      </button>
                    </div>
                    {premiumMsg && (
                      <p className={`text-xs text-center mt-2 font-medium ${premiumMsg.type==="success"?"text-green-600":"text-red-500"}`}>
                        {premiumMsg.type==="success"?"✅":"❌"} {premiumMsg.text}
                      </p>
                    )}
                  </div>

                  <button onClick={()=>setPremiumStep("closed")} className="w-full mt-4 py-2.5 text-slate-400 text-sm hover:text-slate-600 transition-colors">
                    Yopish
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: To'lov --- */}
            {premiumStep === "payment" && selectedPlan && (
              <div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"/>
                  <button onClick={()=>setPremiumStep("plans")} className="absolute top-4 left-4 text-white/70 hover:text-white text-sm">← Orqaga</button>
                  <div className="relative z-10">
                    <div className="text-4xl mb-2">💳</div>
                    <h2 className="text-xl font-black text-white">{selectedPlan.label} — {selectedPlan.price.toLocaleString()} so'm</h2>
                    <p className="text-emerald-100 text-xs mt-1">{selectedPlan.days} kunlik premium obuna</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Karta */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400 font-medium">{CARD_TYPE}</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">💳</span>
                    </div>
                    <div className="font-mono text-xl font-black tracking-widest mb-3 text-center">{CARD_NUMBER}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-300">{CARD_OWNER}</span>
                      <button onClick={copyCard} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all ${cardCopied?"bg-emerald-500 text-white":"bg-white/20 text-white hover:bg-white/30"}`}>
                        {cardCopied?"✓ Nusxalandi":"Nusxalash"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">⚠️ Muhim:</p>
                    <p className="text-xs text-amber-600 dark:text-amber-300">
                      To'lov qilgach, chek skrinshotini adminga yuboring. Admin tasdiqlashi bilan premium faollashadi.
                    </p>
                  </div>

                  <button
                    onClick={()=>setPremiumStep("confirm")}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-base hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                  >
                    To'lov qildim — Chekni yuborish →
                  </button>
                  <button onClick={()=>setPremiumStep("plans")} className="w-full py-2.5 text-slate-400 text-sm hover:text-slate-600 transition-colors">
                    ← Orqaga
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: Chekni Telegramga yuborish --- */}
            {premiumStep === "confirm" && selectedPlan && (
              <div>
                <div className="bg-gradient-to-br from-violet-500 to-purple-700 p-6 text-center relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"/>
                  <div className="relative z-10">
                    <div className="text-4xl mb-2">📤</div>
                    <h2 className="text-xl font-black text-white">Chekni yuboring</h2>
                    <p className="text-violet-100 text-xs mt-1">Oxirgi qadam!</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 font-black text-sm">1</div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">To'lov cheki (skrinshotini) oling</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 font-black text-sm">2</div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Adminga Telegramda yuboring</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 font-black text-sm">3</div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">Admin tekshirib, premiumni yoqadi ✅</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                      📦 Paket: <strong>{selectedPlan.label}</strong> | 💰 <strong>{selectedPlan.price.toLocaleString()} so'm</strong> | 📅 <strong>{selectedPlan.days} kun</strong>
                    </p>
                  </div>

                  <a
                    href={ADMIN_TG}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-black text-base hover:from-blue-600 hover:to-cyan-600 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    ✈️ Telegramda adminga yozish
                  </a>

                  <button onClick={()=>setPremiumStep("closed")} className="w-full py-2.5 text-slate-400 text-sm hover:text-slate-600 transition-colors">
                    Yopish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">

        {/* Daily limit / Premium status banner */}
        {isPremiumActive() ? (
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 shadow-lg">
            <span className="text-3xl">⭐</span>
            <div className="flex-1">
              <p className="font-black text-white text-sm">Premium faol!</p>
              <p className="text-amber-900 text-xs font-medium">
                {premiumInfo.expiresAt ? new Date(premiumInfo.expiresAt).toLocaleDateString("uz-UZ") : ""} gacha • ♾ Cheksiz test
              </p>
            </div>
            <button onClick={()=>setPremiumStep("plans")} className="bg-white/30 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-white/40 transition-all">
              Yangilash
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {dailyInfo.used >= dailyInfo.limit ? "⛔" : "🔓"}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                Bugungi testlar: {dailyInfo.used}/{dailyInfo.limit}
              </p>
              <p className="text-slate-400 text-xs">Premium — cheksiz test va xatolar tahlili</p>
            </div>
            <button
              onClick={()=>setPremiumStep("plans")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-2 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md whitespace-nowrap"
            >
              ⭐ Premium
            </button>
          </div>
        )}

        {/* Welcome Banner - Gradient Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Xush kelibsiz! 👋
                </h1>
                <p className="text-lg sm:text-xl font-bold text-blue-50">
                  {user?.name}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString("uz-UZ")}
                </span>
              </div>
            </div>

            <p className="text-blue-50 text-sm sm:text-base mb-6 max-w-2xl">
              Bugun ham yangi bilimlar orttiring va maqsadlaringizga
              yaqinlashing!
            </p>

            {/* Level & XP Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Level Badge */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                      LVL
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-100 font-medium mb-1">
                      Sizning darajangiz
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-white">
                      {progress?.level || 1}
                    </p>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center text-sm text-blue-50 mb-2">
                    <span className="font-semibold">Tajriba ballari (XP)</span>
                    <span className="font-black">
                      {progress?.xp || 0} / {progress?.xpForNextLevel || 100}
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 transition-all duration-700 ease-out shadow-lg"
                      style={{ width: `${xpProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-100 mt-2 font-medium">
                    Keyingi darajagacha:{" "}
                    {progress?.xpForNextLevel - progress?.xp || 100} XP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Test Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Tezkor Test
                </h2>
                <p className="text-emerald-50 text-sm">
                  Bilimlaringizni sinab ko'ring
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Savollar soni:{" "}
                <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                  {questionCount}
                </span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {[10, 20, 30, 40].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 min-w-[60px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
                      questionCount === num
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startTest}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              Testni Boshlash
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ActionCard
            onClick={() => navigate("/topics")}
            icon={BookOpen}
            title="Mavzular"
            description="Bo'limlar bo'yicha"
            color="blue"
          />
          <ActionCard
            onClick={() => navigate("/badges")}
            icon={Award}
            title="Nishonlar"
            description={`${progress?.badges?.length || 0} ta olindi`}
            color="yellow"
          />
          <ActionCard
            onClick={() => navigate("/friends")}
            icon={Users}
            title="Do'stlar"
            description="Raqobatlashish"
            color="purple"
          />
          <ActionCard
            onClick={() => navigate("/goals")}
            icon={Target}
            title="Maqsadlar"
            description="Rejalaringiz"
            color="green"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Statistics Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                Statistika
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Jami Testlar
                </p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-300">
                  {history.length}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  O'rtacha Ball
                </p>
                <p
                  className={`text-3xl font-black ${
                    averageScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : averageScore >= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {averageScore}%
                </p>
              </div>
            </div>

            {lastResult && (
              <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 rounded-xl border border-violet-200 dark:border-violet-800">
                <p className="text-sm font-bold text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Oxirgi Urinish
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                      {lastResult.scorePercentage}%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(lastResult.date).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/history")}
                    className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline"
                  >
                    Batafsil
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/history")}
              className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
            >
              <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Test Tarixi</span>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group"
            >
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Reyting Jadvali</span>
            </button>

            <button
              onClick={() => navigate("/study-materials")}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-black shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span>O'quv Materiallari</span>
            </button>
          </div>
        </div>

        {/* ⭐ Premium CTA Section */}
        {!isPremiumActive() && (
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                  <span className="text-3xl">⭐</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Premium Obuna</h2>
                  <p className="text-sm text-blue-100 font-medium">Cheksiz imkoniyatlar</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[["♾","Cheksiz test"],["🔍","Xatolar tahlili"],["🏛","Real simulyator"],["🔔","Bildirgilar"]].map(([icon,label])=>(
                  <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
                    <span>{icon}</span>
                    <span className="text-xs font-semibold text-white">{label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={()=>setPremiumStep("plans")}
                className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-base hover:bg-blue-50 shadow-xl transition-all active:scale-95"
              >
                ⭐ Premium olish — 15,000 so'mdan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Action Card Component
interface ActionCardProps {
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
  color: "blue" | "yellow" | "purple" | "green";
}

const ActionCard: React.FC<ActionCardProps> = ({
  onClick,
  icon: Icon,
  title,
  description,
  color,
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-blue-200 dark:border-blue-800",
    yellow:
      "from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-amber-200 dark:border-amber-800",
    purple:
      "from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-purple-200 dark:border-purple-800",
    green:
      "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-emerald-200 dark:border-emerald-800",
  };

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700 hover:border-transparent transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95"
    >
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      <h3 className="font-black text-slate-800 dark:text-white text-sm sm:text-base mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {description}
      </p>
    </button>
  );
};

export default UserDashboard;
