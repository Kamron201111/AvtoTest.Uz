import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, BookOpen, Star, Settings } from "lucide-react";

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { to: "/user", icon: LayoutGrid, label: "Umumiy" },
    { to: "/yhq", icon: BookOpen, label: "YHQ" },
    { to: "/talim", icon: null, label: "Ta'lim", center: true },
    { to: "/kurslar", icon: Star, label: "Kurslar" },
    { to: "/sozlamalar", icon: Settings, label: "Sozlamalar" },
  ];

  const isActive = (to: string) => {
    if (to === "/user") return path === "/user";
    return path.startsWith(to);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 shadow-2xl">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto relative">
        {tabs.map((tab) => {
          if (tab.center) {
            return (
              <button
                key={tab.to}
                onClick={() => navigate(tab.to)}
                className="flex flex-col items-center gap-0.5 -mt-6 relative"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 transition-all ${isActive(tab.to) ? "bg-blue-700 border-white scale-105" : "bg-gradient-to-br from-blue-500 to-indigo-600 border-white"}`}>
                  {/* Steering wheel SVG */}
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2" x2="12" y2="9" />
                    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                    <line x1="19.07" y1="4.93" x2="14.83" y2="9.17" />
                  </svg>
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isActive(tab.to) ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>{tab.label}</span>
              </button>
            );
          }
          const Icon = tab.icon!;
          const active = isActive(tab.to);
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? "bg-blue-100 dark:bg-blue-900/40" : ""}`}>
                <Icon className={`w-5 h-5 ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
              </div>
              <span className={`text-[10px] font-semibold ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
