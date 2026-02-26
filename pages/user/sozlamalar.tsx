import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Star, BarChart2, Globe,
  FileText, Shield, Scroll, Copy, Check, X, Upload,
  Loader2, Clock, CheckCircle, XCircle, Moon, Sun,
} from "lucide-react";
import {
  getPremiumInfo, getDailyTestInfo, getResults,
  createPremiumRequest, getUserPremiumRequest,
  uploadScreenshot, getAllSettings, supabase,
} from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { TestResult } from "../../types";

type LegalType = "shartnoma" | "maxfiylik" | "oferta" | null;
type Lang = "uz" | "ru" | "en";

const LANGS: { code: Lang; flag: string; name: string }[] = [
  { code: "uz", flag: "🇺🇿", name: "O'zbek" },
  { code: "ru", flag: "🇷🇺", name: "Русский" },
  { code: "en", flag: "🇬🇧", name: "English" },
];

const Sozlamalar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const darkMode = theme === 'dark';

  const [premiumInfo, setPremiumInfo] = useState<{ active: boolean; expiresAt?: string; plan?: string }>({ active: false });
  const [dailyInfo, setDailyInfo] = useState<{ used: number; limit: number; canTest: boolean }>({ used: 0, limit: 20, canTest: true });
  const [history, setHistory] = useState<TestResult[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  // Premium modal
  const [premiumStep, setPremiumStep] = useState<"closed" | "plans" | "payment" | "waiting">("closed");
  const [selectedPlan, setSelectedPlan] = useState<{ label: string; price: number; days: number } | null>(null);
  const [cardCopied, setCardCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Statistics
  const [showStats, setShowStats] = useState(false);

  // Language
  const [lang, setLang] = useState<Lang>("uz");

  // Legal
  const [legalType, setLegalType] = useState<LegalType>(null);
  const [legalContent, setLegalContent] = useState("");
  const [legalLoading, setLegalLoading] = useState(false);

  // Logout confirm
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [prem, daily, hist, sett, pending] = await Promise.all([
        getPremiumInfo(user.id),
        getDailyTestInfo(user.id),
        getResults(user.id),
        getAllSettings(),
        getUserPremiumRequest(user.id),
      ]);
      setPremiumInfo(prem);
      setDailyInfo(daily);
      setHistory(hist);
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
      setSubmitMsg({ type: "error", text: "Iltimos to'lov chekini yuklang" });
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

  const openLegal = async (type: LegalType) => {
    setLegalType(type);
    setLegalLoading(true);
    const keyMap: Record<string, string> = {
      shartnoma: "legal_shartnoma",
      maxfiylik: "legal_maxfiylik",
      oferta: "legal_oferta",
    };
    if (type) {
      const { data } = await supabase.from("settings").select("value").eq("key", keyMap[type]).single();
      setLegalContent(data?.value || "Hozircha mazmun mavjud emas.");
    }
    setLegalLoading(false);
  };

  const avgScore = history.length ? Math.round(history.reduce((s, r) => s + r.scorePercentage, 0) / history.length) : 0;
  const totalMinutes = Math.round(history.reduce((s, r) => s + (r.timeSpentSeconds || 0), 0) / 60);
  const passCount = history.filter(r => r.scorePercentage >= 85).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Legal page
  if (legalType) {
    const titles: Record<string, string> = {
      shartnoma: "Foydalanuvchi Shartnomasi",
      maxfiylik: "Maxfiylik Siyosati",
      oferta: "Ommaviy Oferta",
    };
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setLegalType(null)}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-black text-slate-800 dark:text-white">{titles[legalType]}</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-5">
          {legalLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-blue-500 animate-spin" /></div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{legalContent}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Statistics page
  if (showStats) {
    // Weekly activity (last 7 days)
    const today = new Date();
    const days = ["Дт", "Чт", "Пт", "Сб", "Вс", "Пн", "Вт"];
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const count = history.filter(r => r.date.startsWith(dateStr)).length;
      return { day: days[i], count };
    });
    const maxCount = Math.max(...weekData.map(d => d.count), 1);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setShowStats(false)}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-black text-slate-800 dark:text-white">Statistika</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
          {/* Faollik */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-black text-slate-800 dark:text-white mb-4">Faollik</h3>
            <div className="flex items-end justify-between gap-2 h-24">
              {weekData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-end" style={{ height: "64px" }}>
                    <div
                      className="w-full bg-blue-500 rounded-lg transition-all"
                      style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "8px" : "0" }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Xulosa - 4 ta karta */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-black text-slate-800 dark:text-white mb-4">Xulosa</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-600 rounded-2xl p-4">
                <p className="text-white font-black text-3xl">{history.length}</p>
                <p className="text-blue-200 text-xs mt-1">savollar yechildi</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4">
                <p className="text-slate-800 dark:text-white font-black text-3xl">{avgScore}%</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">to'g'ri javoblar</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4">
                <p className="text-slate-800 dark:text-white font-black text-3xl">{totalMinutes} <span className="text-sm font-bold">МИН</span></p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">platformada vaqt</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4">
                <p className="text-slate-800 dark:text-white font-black text-3xl">{passCount}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">biletlar yechildi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/user")}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-black text-slate-800 dark:text-white text-lg">Sozlamalar</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profil */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 flex items-center gap-4 shadow-xl">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-white font-black text-lg">{user?.name}</h2>
            <p className="text-blue-200 text-sm">{premiumInfo.active ? `⭐ Premium • ${new Date(premiumInfo.expiresAt!).toLocaleDateString("uz-UZ")} gacha` : "Bepul foydalanuvchi"}</p>
          </div>
        </div>

        {/* Premium */}
        {premiumInfo.active ? (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <Star className="w-8 h-8 text-white" fill="white" />
            <div>
              <p className="text-white font-black">⭐ Premium Faol!</p>
              <p className="text-white/80 text-sm">{premiumInfo.plan} • {new Date(premiumInfo.expiresAt!).toLocaleDateString("uz-UZ")} gacha</p>
            </div>
          </div>
        ) : pendingRequest ? (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <Clock className="w-7 h-7 text-white animate-pulse" />
            <div>
              <p className="text-white font-black">⏳ So'rov kutilmoqda</p>
              <p className="text-white/80 text-sm">Admin ko'rib chiqmoqda</p>
            </div>
          </div>
        ) : (
          <button onClick={() => setPremiumStep("plans")}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between shadow-lg hover:opacity-90 transition-all">
            <div className="flex items-center gap-3">
              <Star className="w-7 h-7 text-white" fill="white" />
              <div className="text-left">
                <p className="text-white font-black">Premium Obuna</p>
                <p className="text-white/80 text-sm">Cheksiz test va ko'proq</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Statistika */}
        <button onClick={() => setShowStats(true)}
          className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">Statistika</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {/* Til */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">Til</span>
          </div>
          <div className="flex gap-2">
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${lang === l.code ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300"}`}>
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mavzu (Dark/Light) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
              {darkMode ? <Moon className="w-5 h-5 text-violet-600 dark:text-violet-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            </div>
            <span className="font-bold text-slate-800 dark:text-white">Mavzu</span>
          </div>
          <button onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-all ${darkMode ? "bg-blue-600" : "bg-slate-200"}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${darkMode ? "left-7" : "left-0.5"}`} />
          </button>
        </div>

        {/* Huquqiy */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {[
            { type: "shartnoma" as LegalType, icon: Scroll, label: "Foydalanuvchi Shartnomasi" },
            { type: "maxfiylik" as LegalType, icon: Shield, label: "Maxfiylik Siyosati" },
            { type: "oferta" as LegalType, icon: FileText, label: "Ommaviy Oferta" },
          ].map(({ type, icon: Icon, label }, i, arr) => (
            <button key={type} onClick={() => openLegal(type)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left ${i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}>
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Chiqish */}
        <button onClick={() => setLogoutConfirm(true)}
          className="w-full py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-black hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
          Hisobdan Chiqish
        </button>
      </div>

      {/* PREMIUM MODAL */}
      {premiumStep !== "closed" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl shadow-2xl max-h-[95vh] overflow-y-auto">
            {premiumStep === "plans" && (
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl relative">
                  <button onClick={closePremium} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                  <h2 className="text-white font-black text-2xl">⭐ Premium</h2>
                  <p className="text-blue-200 text-sm mt-1">Paket tanlang</p>
                </div>
                <div className="p-5 space-y-3">
                  {PLANS.map(plan => (
                    <button key={plan.label}
                      onClick={() => { setSelectedPlan(plan); setPremiumStep("payment"); }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative hover:scale-[1.01] ${plan.popular ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}>
                      {plan.popular && <span className="absolute -top-2 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">MASHHUR</span>}
                      <div className="flex items-center justify-between">
                        <div><p className="font-black text-slate-800 dark:text-white">{plan.label}</p><p className="text-slate-500 text-xs">{plan.days} kun • Cheksiz test</p></div>
                        <p className="font-black text-blue-600 text-lg">{plan.price.toLocaleString()} <span className="text-sm">so'm</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {premiumStep === "payment" && selectedPlan && (
              <div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-3xl relative">
                  <button onClick={() => setPremiumStep("plans")} className="absolute top-4 left-4 text-white/70 hover:text-white text-sm">← Orqaga</button>
                  <button onClick={closePremium} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                  <h2 className="text-white font-black text-xl mt-2">💳 To'lov</h2>
                  <p className="text-emerald-100 text-sm">{selectedPlan.label} — {selectedPlan.price.toLocaleString()} so'm</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
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
                    <p className="text-amber-700 text-xs font-semibold">⚠️ To'lovni amalga oshiring va chekni pastga yuklang</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📸 To'lov chekini yuklang:</p>
                    {screenshotPreview ? (
                      <div className="relative">
                        <img src={screenshotPreview} alt="Chek" className="w-full rounded-xl max-h-48 object-cover" />
                        <button onClick={() => { setScreenshot(null); setScreenshotPreview(""); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <label className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 transition-all">
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
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Yuborilmoqda...</> : "✅ To'lovni Tasdiqlash"}
                  </button>
                </div>
              </div>
            )}

            {premiumStep === "waiting" && (
              <div>
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 rounded-t-3xl relative">
                  <button onClick={closePremium} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                  <h2 className="text-white font-black text-xl">⏳ So'rov Yuborildi!</h2>
                </div>
                <div className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-2">Admin ko'rib chiqmoqda</h3>
                    <p className="text-slate-500 text-sm">To'lov tekshirilgach premium avtomatik faollashadi. 5–30 daqiqa ichida.</p>
                  </div>
                  <button onClick={closePremium} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">Yopish</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout confirm */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="font-black text-slate-800 dark:text-white text-xl mb-2">Chiqmoqchimisiz?</h3>
            <p className="text-slate-500 text-sm mb-6">Hisobingizdan chiqiladi</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Bekor
              </button>
              <button onClick={() => { logout(); navigate("/"); }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sozlamalar;
