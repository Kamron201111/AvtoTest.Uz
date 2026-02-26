import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, ChevronLeft, ChevronRight, Loader2, Video } from "lucide-react";
import { supabase } from "../../services/supabase";

interface Lesson {
  id: number;
  number: number;
  title: string;
  description: string;
  video_url: string;
  watched_percent?: number;
}

const DEFAULT_LESSONS: Lesson[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  title: `${i + 1} - dars`,
  description: "",
  video_url: "",
}));

const KurslarPage: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("kurs_lessons").select("*").order("number");
      if (data && data.length > 0) {
        setLessons(data);
      } else {
        setLessons(DEFAULT_LESSONS);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (activeLesson) {
    const idx = lessons.findIndex(l => l.id === activeLesson.id);
    const prev = idx > 0 ? lessons[idx - 1] : null;
    const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

    // YouTube/video embed URL
    const getEmbedUrl = (url: string) => {
      if (!url) return "";
      // YouTube
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\n?#]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      return url;
    };

    return (
      <div className="min-h-screen bg-slate-900 pb-24">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setActiveLesson(null)}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-lg">Dars {activeLesson.number}</span>
            </div>
            <h2 className="font-black text-white text-sm mt-0.5 truncate">{activeLesson.title}</h2>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-800 h-1">
          <div className="bg-blue-600 h-1 transition-all" style={{ width: `${(idx / lessons.length) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
          <span className="text-slate-400 text-xs">Tomosha qilindi</span>
          <span className="text-slate-400 text-xs font-bold">{Math.round((idx / lessons.length) * 100)}%</span>
        </div>

        {/* Video */}
        <div className="max-w-lg mx-auto px-0">
          {getEmbedUrl(activeLesson.video_url) ? (
            <div className="relative bg-black" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getEmbedUrl(activeLesson.video_url)}
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-black flex items-center justify-center" style={{ height: "220px" }}>
              <div className="text-center">
                <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Video hali yuklanmagan</p>
                <p className="text-slate-600 text-xs mt-1">Admin tez orada qo'shadi</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="max-w-lg mx-auto px-4 py-4">
          <h3 className="font-black text-white text-lg mb-2">{activeLesson.title}</h3>
          {activeLesson.description ? (
            <p className="text-slate-300 text-sm leading-relaxed">{activeLesson.description}</p>
          ) : (
            <p className="text-slate-500 text-sm italic">Matn admin tomonidan qo'shiladi</p>
          )}
        </div>

        {/* Prev / Next */}
        <div className="max-w-lg mx-auto px-4 py-4 flex gap-3">
          <button
            onClick={() => prev && setActiveLesson(prev)}
            disabled={!prev}
            className="flex-1 py-3.5 bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-5 h-5" /> Oldingi dars
          </button>
          <button
            onClick={() => next && setActiveLesson(next)}
            disabled={!next}
            className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all">
            Keyingi dars <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bot link */}
        <div className="max-w-lg mx-auto px-4">
          <p className="text-center text-slate-500 text-xs">@pddstartuz_bot</p>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Video Darslar</p>
            <h1 className="font-black text-slate-800 dark:text-white">Kurslar</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : (
          lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 shadow">
                {lesson.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-white text-sm">{lesson.title}</p>
                {lesson.description ? (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{lesson.description}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">Video dars</p>
                )}
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${lesson.video_url ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-700"}`}>
                <Play className={`w-4 h-4 ${lesson.video_url ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} fill={lesson.video_url ? "currentColor" : "none"} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default KurslarPage;
