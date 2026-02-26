import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Lock, Search, FileText, Loader2 } from "lucide-react";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";
import { isPremiumActive } from "../../services/supabase";

interface Chapter {
  id: number;
  number: number;
  title: string;
  description?: string;
  pdf_url?: string;
  is_free: boolean;
}

const YHQ: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<Chapter | null>(null);

  useEffect(() => {
    const load = async () => {
      // Chapters ni Supabase dan yuklaymiz
      const { data } = await supabase.from("yhq_chapters").select("*").order("number");
      if (data && data.length > 0) {
        setChapters(data);
      } else {
        // Default 29 ta bob (admin hali qo'shmagan)
        const defaults: Chapter[] = Array.from({ length: 29 }, (_, i) => ({
          id: i + 1,
          number: i + 1,
          title: `Bob ${i + 1}`,
          description: "",
          pdf_url: "",
          is_free: i < 2,
        }));
        setChapters(defaults);
      }
      if (user) {
        const prem = await isPremiumActive(user.id);
        setIsPremium(prem);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = chapters.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const canOpen = (ch: Chapter) => ch.is_free || isPremium;

  if (viewingPdf) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button onClick={() => setViewingPdf(null)}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">YHQ</p>
            <h2 className="font-black text-slate-800 dark:text-white text-sm">{viewingPdf.title}</h2>
          </div>
        </div>
        <div className="p-4 max-w-lg mx-auto">
          {viewingPdf.pdf_url ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
              <iframe
                src={`${viewingPdf.pdf_url}#toolbar=0`}
                className="w-full"
                style={{ height: "75vh" }}
                title={viewingPdf.title}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow border border-slate-200 dark:border-slate-700">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">Hozircha fayl yuklanmagan</p>
              <p className="text-slate-400 text-sm mt-1">Admin tez orada qo'shadi</p>
            </div>
          )}
          {viewingPdf.description && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">{viewingPdf.description}</p>
            </div>
          )}
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
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Yo'l Harakati Qoidalari</p>
            <h1 className="font-black text-slate-800 dark:text-white">YHQ — 29 Bob</h1>
          </div>
        </div>
        {/* Search */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Bob qidirish..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {filtered.map((ch) => {
              const locked = !canOpen(ch);
              const isOpen = expanded === ch.id && !locked;

              return (
                <div key={ch.id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden shadow-sm transition-all ${locked ? "border-slate-200 dark:border-slate-700 opacity-80" : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"}`}>
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => {
                      if (locked) return;
                      if (ch.pdf_url !== undefined) {
                        setViewingPdf(ch);
                      } else {
                        setExpanded(isOpen ? null : ch.id);
                      }
                    }}
                  >
                    {/* Bob raqami */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${locked ? "bg-slate-100 dark:bg-slate-700 text-slate-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"}`}>
                      {ch.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${locked ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>
                        {ch.title}
                      </p>
                      {ch.description ? (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{ch.description}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {locked ? "Premium kerak" : ch.is_free ? "Bepul" : "Premium"}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {locked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : ch.pdf_url ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Premium banner */}
            {!isPremium && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white text-center shadow-xl mt-4">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-black text-lg mb-1">Premium Oching</h3>
                <p className="text-blue-200 text-sm mb-4">Barcha 29 bobni to'liq o'qish uchun premium oling</p>
                <button onClick={() => navigate("/sozlamalar")}
                  className="bg-white text-blue-700 font-black px-6 py-2.5 rounded-xl shadow hover:bg-blue-50 transition-all">
                  Premium Olish
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default YHQ;
