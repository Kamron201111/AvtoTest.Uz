import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { loginUser, registerUser, getUsers } from "../services/db";
import { Role } from "../types";
import {
  ArrowLeft,
  UserPlus,
  LogIn,
  Moon,
  Sun,
  Car,
  Shield,
  Users,
  Award,
} from "lucide-react";
import { languages } from "../services/translations";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, toggleTheme, theme, language, setLanguage } = useUI();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLang, setShowLang] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError(t("error_fill_all"));
      return;
    }

    try {
      // Admin ekanligini tekshirish
      if (
        username === "ValiyevKamron" &&
        password === "128787$Kam"
      ) {
        // Admin login
        const users = getUsers();
        let adminUser = users.find((u) => u.role === Role.ADMIN);

        if (!adminUser) {
          // Agar admin yo'q bo'lsa, yaratamiz
          adminUser = {
            id: "admin-" + Date.now(),
            name: "Admin",
            role: Role.ADMIN,
            password: "muhammadsolihadmin12345",
          };
        }

        login(adminUser);
        navigate("/admin");
        return;
      }

      // Oddiy user login/register
      if (mode === "register" && password.length < 4) {
        setError(t("error_pass_len"));
        return;
      }

      let user;
      if (mode === "register") {
        user = registerUser(username, password);
      } else {
        user = loginUser(username, password);
      }

      login(user);
      navigate("/user");
    } catch (err: any) {
      if (err.message.includes("mavjud")) setError(t("error_user_exists"));
      else if (err.message.includes("topilmadi"))
        setError(t("error_user_not_found"));
      else if (err.message.includes("noto'g'ri")) setError(t("error_pass"));
      else setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex transition-colors">
      {/* Top Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-full shadow-lg hover:shadow-xl transition-all uppercase text-xs font-bold w-10 h-10 flex items-center justify-center"
          >
            {language}
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 py-2 overflow-hidden">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLang(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Side - Info Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="z-10 space-y-8">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Car size={36} className="text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">
                AvtoTest<span className="text-blue-300">.uz</span>
              </h1>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Haydovchilik guvohnomasini olish uchun eng yaxshi tayyorgarlik
              platformasi
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield size={24} className="text-blue-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Professional Savollar
                </h3>
                <p className="text-blue-200 text-sm">
                  Rasmiy imtihon savollariga asoslangan test tizimi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users size={24} className="text-blue-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Osongina O'rganish
                </h3>
                <p className="text-blue-200 text-sm">
                  Qulay interfeys va tushunarliligi bilan ajralib turadi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Award size={24} className="text-blue-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Natijalarni Kuzatish
                </h3>
                <p className="text-blue-200 text-sm">
                  O'z yutuqlaringizni kuzatib boring va takomillashing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Developer Info */}
        <div className="z-10 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="data:image/png;base64,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"
              alt="Kamron201"
              className="w-12 h-12 rounded-full object-cover shadow-lg"
            />
            <div>
              <p className="text-white/70 text-sm">Bu sayt yaratuvchisi</p>
              <p className="text-white font-semibold text-lg">
                Valiyev Kamron
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo - only on small screens */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Car size={28} className="text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                AvtoTest
                <span className="text-blue-600 dark:text-blue-400">.uz</span>
              </h1>
            </div>
            <div className="bg-blue-50 dark:bg-slate-700/50 rounded-xl p-4 border border-blue-100 dark:border-slate-600">
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-1">
                Dasturchi
              </p>
              <p className="text-slate-800 dark:text-white font-bold text-base">
                Valiyev Kamron
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:border dark:border-slate-700 p-8 transition-colors">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {mode === "login" ? t("login_title") : t("register_title")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {mode === "login" ? t("login_desc") : t("register_desc")}
              </p>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === "login" ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400"}`}
              >
                <LogIn size={16} /> {t("btn_login")}
              </button>
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === "register" ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400"}`}
              >
                <UserPlus size={16} /> {t("btn_register")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("name_label")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={t("name_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t("pass_label")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={
                    mode === "register"
                      ? t("new_pass_placeholder")
                      : t("pass_placeholder")
                  }
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-xl border-2 border-red-100 dark:border-red-800 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {mode === "login" ? t("btn_login") : t("btn_register")}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium">
              {t("app_footer_credit")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
