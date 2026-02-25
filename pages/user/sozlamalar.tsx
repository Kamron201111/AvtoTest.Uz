import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe, Star, TrendingUp, LogOut, ChevronRight, User,
  Moon, Sun, Shield, Bell, AlertCircle, Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const LANGUAGES = [
  { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const Sozlamalar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useUI();
  const [showLogout, setShowLogout] = useState(false);
  const [showLang, setShowLang] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Header profil */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-4 pt-8 pb-8">
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate("/profile")}
            className="cursor-pointer"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-2xl">{user.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-white font-black text-xl">{user.name}</h1>
            <p className="text-blue-200 text-sm">ID {user.id?.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">

        {/* Premium banner */}
        <div
          onClick={() => navigate("/user")}
          className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Premium obuna</p>
              <p className="text-white/70 text-xs">Cheksiz testlar va tahlil</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70" />
        </div>

        {/* Statistika */}
        <div
          onClick={() => navigate("/history")}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">Statistika</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        {/* Til */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowLang(!showLang)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-bold text-slate-800 dark:text-white">Til</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm uppercase">{language}</span>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showLang ? "rotate-90" : ""}`} />
            </div>
          </button>

          {showLang && (
            <div className="border-t border-slate-100 dark:border-slate-800">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setShowLang(false); }}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{lang.label}</span>
                  </div>
                  {language === lang.code && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tema */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <button
            onClick={toggleTheme}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                {theme === "light"
                  ? <Moon className="w-5 h-5 text-purple-600" />
                  : <Sun className="w-5 h-5 text-amber-400" />
                }
              </div>
              <p className="font-bold text-slate-800 dark:text-white">
                {theme === "light" ? "Qorong'u rejim" : "Yorug' rejim"}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-blue-600" : "bg-slate-200"} relative`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${theme === "dark" ? "left-7" : "left-1"}`} />
            </div>
          </button>
        </div>

        {/* Profil */}
        <div
          onClick={() => navigate("/profile")}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">Profilni tahrirlash</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        {/* Chiqish */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-bold text-red-600 dark:text-red-400">Chiqish</p>
        </button>

        <p className="text-center text-xs text-slate-400 pb-4">AvtoTest.uz v1.0 • @avtotest_uz_bot</p>
      </div>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Chiqish</h3>
              <p className="text-slate-500 dark:text-slate-400">Siz saytdan rostdan chiqmoqchimisiz?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-2xl font-bold transition-colors"
              >
                Yo'q
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg transition-all"
              >
                Ha, chiqaman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sozlamalar;
