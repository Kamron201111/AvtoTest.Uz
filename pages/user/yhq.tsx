import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, BookOpen, ArrowLeft, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// YHQ ma'lumotlari — Bob va bandlar
const YHQ_CHAPTERS = [
  {
    id: 1,
    title: "Bob 1. Umumiy qoidalar",
    subtitle: "dan 1 gacha 6 band",
    premium: false,
    icon: "📋",
    color: "from-blue-500 to-blue-600",
    bands: [
      { n: 1, text: "Mazkur Yo'l harakati qoidalari O'zbekiston Respublikasi hududida yo'l harakatining yagona tartibini belgilaydi." },
      { n: 2, text: "O'zbekiston Respublikasi avtomobil yo'llarida avtotransport vositalari uchun o'ng tomonda harakatlanish tartibi o'rnatildi." },
      { n: 3, text: "Yo'l harakati qatnashchilari ushbu Qoidalarni hamda svetoforning tegishli talablarini, yo'l belgilarini bilishi va ularga rioya etishi shart." },
      { n: 4, text: "Yo'l harakati qatnashchilari harakatga to'sqinlik qilmasligi yoki yo'l harakatining boshqa ishtirokchilari uchun xavf tug'dirmasligi kerak." },
      { n: 5, text: "Mazkur Qoidalarni buzgan shaxslar O'zbekiston Respublikasi qonun hujjatlariga muvofiq javobgar bo'ladilar." },
      { n: 6, text: "Qoidalar quyidagi asosiy tushuncha va atamalardan foydalanadi: Avtomobil yo'li, Haydovchi, Piyoda, Yo'l, Chorraha, va boshqalar." },
    ]
  },
  {
    id: 2,
    title: "Bob 2. Haydovchilarning umumiy vazifalari",
    subtitle: "dan 7 gacha 12 band",
    premium: false,
    icon: "🚗",
    color: "from-indigo-500 to-indigo-600",
    bands: [
      { n: 7, text: "Haydovchi o'zi bilan birga tegishli toifadagi haydovchilik guvohnomasi, transport vositasi ro'yxatga olish hujjatlarini olib yurishi shart." },
      { n: 8, text: "Haydovchi tegishli toifadagi transport vositasini boshqarish uchun haydovchilik guvohnomasiga ega bo'lishi kerak: A — mopedlar, mototsikllar; B — ruxsat etilgan og'irligi 3500 kg gacha; C — 3500 kg dan ortiq; D — avtobuslar." },
      { n: 9, text: "Agar transport vositasi xavfsizlik kamarlari bilan jihozlangan bo'lsa, haydovchi va old o'rindiq yo'lovchisi haydash paytida mahkamlanishi shart." },
      { n: 10, text: "Respublika hududida avtotransport vositasini boshqarayotgan xorijiy davlat haydovchisi Yo'l harakati to'g'risidagi konventsiyaga muvofiq keladigan hujjatlarni olib yurishi shart." },
      { n: 11, text: "Avtotransport vositasi haydovchisi ketishdan oldin transport vositasining texnik holatini tekshirishi, harakatni boshlashdan oldin eshiklar yopiqligiga ishonch hosil qilishi shart." },
      { n: 12, text: "Haydovchiga taqiqlanadi: alkogolli ichimliklar ta'sirida haydash; telefondan foydalanish (qo'llarsiz qurilmasiz); piyodalar xavfsizligini ta'minlamaslik." },
    ]
  },
  {
    id: 3,
    title: "Bob 3. Svetofor va tartibga soluvchi signallari",
    subtitle: "dan 13 gacha 18 band",
    premium: true,
    icon: "🚦",
    color: "from-green-500 to-emerald-600",
    bands: []
  },
  {
    id: 4,
    title: "Bob 4. Harakatlanishni boshlash va manyovrlar",
    subtitle: "dan 19 gacha 25 band",
    premium: true,
    icon: "↩️",
    color: "from-violet-500 to-purple-600",
    bands: []
  },
  {
    id: 5,
    title: "Bob 5. Harakatlanish tezligi",
    subtitle: "dan 26 gacha 29 band",
    premium: true,
    icon: "⚡",
    color: "from-amber-500 to-orange-500",
    bands: []
  },
  {
    id: 6,
    title: "Bob 6. To'xtash va to'xtab turish",
    subtitle: "dan 30 gacha 34 band",
    premium: true,
    icon: "🅿️",
    color: "from-red-500 to-rose-600",
    bands: []
  },
  {
    id: 7,
    title: "Bob 7. Kesishmalarda harakatlanish",
    subtitle: "dan 35 gacha 42 band",
    premium: true,
    icon: "🔀",
    color: "from-teal-500 to-cyan-600",
    bands: []
  },
  {
    id: 8,
    title: "Bob 8. Piyodalar o'tish joylari",
    subtitle: "dan 43 gacha 48 band",
    premium: true,
    icon: "🚶",
    color: "from-pink-500 to-rose-500",
    bands: []
  },
];

const YHQ: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [openChapter, setOpenChapter] = useState<number | null>(null);

  const filtered = YHQ_CHAPTERS.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/user")}
            className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Yo'l harakati qoidalari</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qidirish"
            className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Chapters list */}
      <div className="px-4 py-4 space-y-2">
        {filtered.map((chapter) => {
          const isOpen = openChapter === chapter.id;
          const isPremiumLocked = chapter.premium;

          return (
            <div key={chapter.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => {
                  if (isPremiumLocked) return;
                  setOpenChapter(isOpen ? null : chapter.id);
                }}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${chapter.color} flex items-center justify-center text-lg flex-shrink-0`}>
                    {chapter.icon}
                  </div>
                  <div>
                    <p className={`font-bold text-sm leading-tight ${isPremiumLocked ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>
                      {chapter.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{chapter.subtitle}</p>
                  </div>
                </div>

                {isPremiumLocked ? (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-xl flex-shrink-0">
                    <Lock className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">Premium</span>
                  </div>
                ) : (
                  isOpen
                    ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {/* Bands */}
              {isOpen && !isPremiumLocked && chapter.bands.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800">
                  {chapter.bands.map((band) => (
                    <div key={band.n} className="px-4 py-3 flex gap-3">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-400 font-black text-xs">№{band.n}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{band.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Premium banner */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white">
          <p className="font-black text-sm mb-1">⭐ Barcha boblarni ko'rish uchun</p>
          <p className="text-blue-200 text-xs mb-3">Premium obuna orqali barcha 24 ta bobni o'qing</p>
          <button
            onClick={() => navigate("/user")}
            className="bg-white text-blue-700 font-bold text-sm px-4 py-2 rounded-xl"
          >
            Premium olish →
          </button>
        </div>
      </div>
    </div>
  );
};

export default YHQ;
