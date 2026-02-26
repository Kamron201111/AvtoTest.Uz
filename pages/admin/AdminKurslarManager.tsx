import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Upload, Loader2, Video, Link } from "lucide-react";
import { supabase } from "../../services/supabase";

interface Lesson {
  id: number;
  number: number;
  title: string;
  description: string;
  video_url: string;
}

const DEFAULT_LESSONS: Lesson[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  title: `${i + 1} - dars`,
  description: "",
  video_url: "",
}));

const AdminKurslarManager: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Lesson>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => { loadLessons(); }, []);

  const loadLessons = async () => {
    setLoading(true);
    const { data } = await supabase.from("kurs_lessons").select("*").order("number");
    if (data && data.length > 0) {
      setLessons(data);
    } else {
      const { error } = await supabase.from("kurs_lessons").insert(DEFAULT_LESSONS);
      setLessons(DEFAULT_LESSONS);
    }
    setLoading(false);
  };

  const startEdit = (l: Lesson) => {
    setEditingId(l.id);
    setForm({ ...l });
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const uploadVideo = async (file: File, lessonId: number) => {
    setUploading(true);
    try {
      const path = `kurs/${lessonId}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("kurs-videos").upload(path, file, { upsert: true });
      if (error) { setMsg({ type: "err", text: "Video yuklashda xatolik: " + error.message }); return; }
      const { data } = supabase.storage.from("kurs-videos").getPublicUrl(path);
      setForm(prev => ({ ...prev, video_url: data.publicUrl }));
      setMsg({ type: "ok", text: "Video muvaffaqiyatli yuklandi!" });
    } finally {
      setUploading(false);
    }
  };

  const saveLesson = async () => {
    if (!form.title?.trim()) { setMsg({ type: "err", text: "Dars nomini kiriting" }); return; }
    setSaving(true);
    const { error } = await supabase.from("kurs_lessons").upsert({
      id: form.id,
      number: form.number,
      title: form.title,
      description: form.description || "",
      video_url: form.video_url || "",
    }, { onConflict: "id" });
    setSaving(false);
    if (error) { setMsg({ type: "err", text: "Saqlashda xatolik" }); return; }
    setMsg({ type: "ok", text: "Saqlandi!" });
    setLessons(prev => prev.map(l => l.id === form.id ? { ...l, ...form } as Lesson : l));
    setTimeout(() => { setEditingId(null); setForm({}); setMsg(null); }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/admin")}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            <h1 className="font-black text-slate-800 dark:text-white">Kurslar (20 dars)</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
        ) : (
          lessons.map(lesson => (
            <div key={lesson.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {editingId === lesson.id ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-700 dark:text-slate-200 text-sm">Dars {lesson.number} — Tahrirlash</span>
                    <button onClick={cancelEdit} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
                  </div>

                  {/* Dars nomi */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Dars nomi *</label>
                    <input value={form.title || ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masalan: Kirish darsi" />
                  </div>

                  {/* Tavsif */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Dars matni / tavsifi</label>
                    <textarea value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Dars mazmuni, izoh..." />
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">YouTube yoki Video URL</label>
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input value={form.video_url || ""} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                        className="flex-1 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  </div>

                  {/* Yoki video yuklash */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Yoki video fayl yuklash</label>
                    <label className={`flex items-center gap-2 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? "border-blue-300 bg-blue-50 dark:bg-blue-900/10" : "border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"}`}>
                      {uploading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <Upload className="w-5 h-5 text-slate-400" />}
                      <span className="text-sm text-slate-500">{uploading ? "Yuklanmoqda..." : "Video fayl yuklash (MP4)"}</span>
                      <input type="file" accept="video/*" className="hidden" disabled={uploading}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadVideo(f, lesson.id); }} />
                    </label>
                  </div>

                  {/* Msg */}
                  {msg && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold ${msg.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {msg.type === "ok" ? "✅" : "❌"} {msg.text}
                    </div>
                  )}

                  {/* Save */}
                  <button onClick={saveLesson} disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saqlanmoqda...</> : <><Save className="w-4 h-4" />Saqlash</>}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
                    {lesson.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {lesson.video_url ? (
                        <span className="text-xs text-blue-500 flex items-center gap-1"><Video className="w-3 h-3" />Video bor</span>
                      ) : (
                        <span className="text-xs text-slate-400">Video yo'q</span>
                      )}
                      {lesson.description && (
                        <span className="text-xs text-slate-400 truncate max-w-[120px]">{lesson.description}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => startEdit(lesson)}
                    className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all">
                    <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminKurslarManager;
