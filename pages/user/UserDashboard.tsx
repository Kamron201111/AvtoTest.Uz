import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, History, Trophy, BookOpen, Award, TrendingUp,
  Star, CreditCard, Copy, Check, X, Loader2, Clock,
  CheckCircle, XCircle, Upload, BarChart2, Bell, Shield,
} from "lucide-react";
import {
  getResults, getDailyTestInfo, getPremiumInfo,
  createPremiumRequest, getUserPremiumRequest, uploadScreenshot, getAllSettings,
} from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { TestResult } from "../../types";

const ADMIN_TG = "https://t.me/kamron201";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useUI();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [dailyInfo, setDailyInfo] = useState<{ used: number; limit: number; canTest: boolean }>({ used: 0, limit: 20, canTest: true });
  const [premiumInfo, setPremiumInfo] = useState<{ active: boolean; expiresAt?: string; plan?: string }>({ active: false });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [premiumStep, setPremiumStep] = useState<"closed"|"plans"|"payment"|"waiting">("closed");
  const [selectedPlan, setSelectedPlan] = useState<{ label: string; price: number; days: number } | null>(null);
  const [cardCopied, setCardCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success"|"error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [hist, daily, prem, sett, pending] = await Promise.all([
        getResults(user.id),
        getDailyTestInfo(user.id),
        getPremiumInfo(user.id),
        getAllSettings(),
        getUserPremiumRequest(user.id),
      ]);
      setHistory(hist);
      setDailyInfo(daily);
      setPremiumInfo(prem);
      setSettings(sett);
      setPendingRequest(pending);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const PLANS = [
    { label: "1 Hafta", price: parseInt(settings.price_1_hafta || "15000"), days: 7, popular: false },
    { label: "1 Oy", price: parseInt(settings.price_1_oy || "49000"), days: 30, popular: true },
    { label: "1 Yil", price: parseInt(settings.price_1_yil || "350000"), days: 365, popular: false },
  ];
  const CARD_NUMBER = settings.card_number || "9860 1266 7183 6719";
  const CARD_OWNER = settings.card_owner || "Valiyev Kamron";
  const CARD_TYPE = settings.card_type || "Humo / UzCard";

  const startTest = async () => {
    if (!user) return;
    const info = await getDailyTestInfo(user.id);
    if (!info.canTest) { setPremiumStep("plans"); return; }
    navigate(`/quiz?count=${questionCount}`);
  };

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""));
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2000);
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
    setSubmitMsg(null);
  };

  const handleSubmit = async () => {
    if (!user || !selectedPlan || !screenshot) {
      setSubmitMsg({ type: "error", text: "Iltimos to\'lov chekini yuklang" });
      return;
    }
    setSubmitting(true);
    try {
      const url = await uploadScreenshot(screenshot, user.id);
      const result = await createPremiumRequest(user.id, user.name, selectedPlan.label, selectedPlan.price, selectedPlan.days, url || "");
      if (result.success) {
        setPremiumStep("waiting");
        await loadData();
      } else {
        setSubmitMsg({ type: "error", text: "Xatolik yuz berdi" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closePremium = () => {
    setPremiumStep("closed");
    setSelectedPlan(null);
    setScreenshot(null);
    setScreenshotPreview("");
    setSubmitMsg(null);
  };

  const avgScore = history.length ? Math.round(history.reduce((s, r) => s + r.scorePercentage, 0) / history.length) : 0;
  const passCount = history.filter(r => r.scorePercentage >= 85).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-slate-500">Yuklanmoqda...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pb-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-5">

        {/* STATUS BANNER */}
        {premiumInfo.active ? (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Star className="w-5 h-5 text-white" fill="white" /></div>
              <div><p className="text-white font-black text-sm">⭐ Premium Faol!</p><p className="text-white/80 text-xs">{premiumInfo.plan} • {new Date(premiumInfo.expiresAt!).toLocaleDateString("uz-UZ")} gacha</p></div>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-xl"><p className="text-white font-bold text-xs">♾ Cheksiz</p></div>
          </div>
        ) : pendingRequest ? (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-white animate-pulse" /></div>
            <div><p className="text-white font-black text-sm">⏳ So\'rov kutilmoqda</p><p className="text-white/80 text-xs">Admin ko\'rib chiqmoqda — tez orada javob keladi</p></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Bugungi testlar: <strong>{dailyInfo.used}/{dailyInfo.limit}</strong></span>
            <button onClick={() => setPremiumStep("plans")} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3" fill="white" /> Premium olish
            </button>
          </div>
        )}

        {/* TEST BOSHLASH */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5">
            <h2 className="text-white font-black text-xl mb-1">🚗 Test Topshirish</h2>
            <p className="text-blue-100 text-sm">{premiumInfo.active ? "♾ Cheksiz test — premium faol" : `Bugun ${dailyInfo.limit - dailyInfo.used} ta test qoldi`}</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">Savol soni:</span>
              <div className="flex gap-2">
                {[10, 20, 30, 40].map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)} className={`w-11 h-9 rounded-xl font-bold text-sm transition-all ${questionCount === n ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{n}</button>
                ))}
              </div>
            </div>
            <button onClick={startTest} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all">
              <Play className="w-6 h-6" fill="white" /> Testni Boshlash
            </button>
            <div className="grid grid-cols-3 gap-2">
              {[{path:"/topics",icon:BookOpen,label:"Kategoriyalar"},{path:"/history",icon:History,label:"Tarix"},{path:"/leaderboard",icon:Trophy,label:"Reyting"}].map(({path,icon:Icon,label}) => (
                <button key={path} onClick={() => navigate(path)} className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all">
                  <Icon className="w-5 h-5 text-blue-500" /><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STATISTIKA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:"Jami testlar",value:history.length,icon:BarChart2,bg:"bg-blue-100 dark:bg-blue-900/30",color:"text-blue-600 dark:text-blue-400"},
            {label:"O\'rtacha ball",value:`${avgScore}%`,icon:TrendingUp,bg:"bg-green-100 dark:bg-green-900/30",color:"text-green-600 dark:text-green-400"},
            {label:"O\'tgan testlar",value:passCount,icon:CheckCircle,bg:"bg-emerald-100 dark:bg-emerald-900/30",color:"text-emerald-600 dark:text-emerald-400"},
            {label:"Jami ball",value:user?.totalPoints||0,icon:Award,bg:"bg-amber-100 dark:bg-amber-900/30",color:"text-amber-600 dark:text-amber-400"},
          ].map(({label,value,icon:Icon,bg,color}) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-200 dark:border-slate-700 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}><Icon className={`w-5 h-5 ${color}`} /></div>
              <p className="text-xl font-black text-slate-800 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* PREMIUM CTA */}
        {!premiumInfo.active && !pendingRequest && (
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-black mb-1">⭐ Premium Obuna</h3>
              <p className="text-blue-200 text-sm">Barcha imkoniyatlarni oching</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[{icon:BookOpen,label:"Cheksiz test"},{icon:BarChart2,label:"Xatolar tahlili"},{icon:Shield,label:"Real simulyator"},{icon:Bell,label:"Bildirgilar"}].map(({icon:Icon,label}) => (
                <div key={label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                  <Icon className="w-5 h-5 mx-auto mb-1" /><p className="text-xs font-bold">{label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setPremiumStep("plans")} className="w-full py-3.5 bg-white text-blue-700 rounded-xl font-black hover:bg-blue-50 transition-all shadow-lg">
              ⭐ Premium Olish — {parseInt(settings.price_1_hafta || "15000").toLocaleString()} so\'mdan
            </button>
          </div>
        )}

        {/* SO\'NGGI TESTLAR */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2"><History className="w-5 h-5 text-blue-500" /> So\'nggi testlar</h3>
              <button onClick={() => navigate("/history")} className="text-blue-500 text-sm font-bold">Hammasi →</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {history.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${r.scorePercentage >= 85 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{r.scorePercentage >= 85 ? "✓" : "✗"}</div>
                    <div><p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{r.correctCount}/{r.totalQuestions} to\'g\'ri</p><p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString("uz-UZ")}</p></div>
                  </div>
                  <span className={`font-black text-lg ${r.scorePercentage >= 85 ? "text-green-600" : "text-red-500"}`}>{r.scorePercentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PREMIUM MODAL */}
      {premiumStep !== "closed" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto">

            {premiumStep === "plans" && (
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl relative">
                  <button onClick={closePremium} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                  <h2 className="text-white font-black text-2xl">⭐ Premium</h2>
                  <p className="text-blue-200 text-sm mt-1">Paket tanlang</p>
                </div>
                <div className="p-5 space-y-3">
                  {PLANS.map(plan => (
                    <button key={plan.label} onClick={() => { setSelectedPlan(plan); setPremiumStep("payment"); }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative hover:scale-[1.01] ${plan.popular ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                      {plan.popular && <span className="absolute -top-2 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">MASHHUR</span>}
                      <div className="flex items-center justify-between">
                        <div><p className="font-black text-slate-800 dark:text-white">{plan.label}</p><p className="text-slate-500 text-xs">{plan.days} kun • Cheksiz test</p></div>
                        <p className="font-black text-blue-600 text-lg">{plan.price.toLocaleString()} <span className="text-sm">so\'m</span></p>
                      </div>
                    </button>
                  ))}
                  <p className="text-xs text-slate-400 text-center pt-2">To\'lov qilgach chekni yuklang — admin tasdiqlaydi</p>
                </div>
              </div>
            )}

            {premiumStep === "payment" && selectedPlan && (
              <div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-3xl relative">
                  <button onClick={() => setPremiumStep("plans")} className="absolute top-4 left-4 text-white/70 hover:text-white text-sm">← Orqaga</button>
                  <button onClick={closePremium} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                  <h2 className="text-white font-black text-xl mt-2">💳 To\'lov</h2>
                  <p className="text-emerald-100 text-sm">{selectedPlan.label} — {selectedPlan.price.toLocaleString()} so\'m</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <p className="text-slate-400 text-xs mb-1">{CARD_TYPE}</p>
                    <p className="text-xl font-mono font-bold tracking-widest mb-3">{CARD_NUMBER}</p>
                    <div className="flex items-center justify-between">
                      <div><p className="text-slate-400 text-xs">Egasi</p><p className="font-bold">{CARD_OWNER}</p></div>
                      <button onClick={copyCard} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-bold transition-all">
                        {cardCopied ? <><Check className="w-4 h-4" />Nusxalandi</> : <><Copy className="w-4 h-4" />Nusxalash</>}
                      </button>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs font-semibold">⚠️ To\'lovni amalga oshiring va chekni pastga yuklang</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📸 To\'lov chekini yuklang:</p>
                    {screenshotPreview ? (
                      <div className="relative">
                        <img src={screenshotPreview} alt="Chek" className="w-full rounded-xl max-h-48 object-cover" />
                        <button onClick={() => { setScreenshot(null); setScreenshotPreview(""); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <label className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-500">Chekni yuklash uchun bosing</p>
                        <p className="text-xs text-slate-400">JPG, PNG (maks 10MB)</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
                      </label>
                    )}
                  </div>
                  {submitMsg && (
                    <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${submitMsg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {submitMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{submitMsg.text}
                    </div>
                  )}
                  <button onClick={handleSubmit} disabled={submitting || !screenshot}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Yuborilmoqda...</> : "✅ To\'lovni Tasdiqlash"}
                  </button>
                </div>
              </div>
            )}

            {premiumStep === "waiting" && (
              <div>
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 rounded-t-3xl relative">
                  <button onClick={closePremium} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                  <h2 className="text-white font-black text-xl">⏳ So\'rov Yuborildi!</h2>
                </div>
                <div className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-2">Admin ko\'rib chiqmoqda</h3>
                    <p className="text-slate-500 text-sm">To\'lov tekshirilgach premium avtomatik faollashadi. Odatda 5-30 daqiqa ichida.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">📦 Paket: <strong>{selectedPlan?.label}</strong></p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">💰 To\'langan: <strong>{selectedPlan?.price.toLocaleString()} so\'m</strong></p>
                  </div>
                  <a href={ADMIN_TG} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    ✈️ Adminga yozish
                  </a>
                  <button onClick={closePremium} className="w-full py-2 text-slate-400 text-sm">Yopish</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
