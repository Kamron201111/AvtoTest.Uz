import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getQuestions,
  saveQuestion,
  deleteQuestion,
  deleteAllQuestions,
} from "../../services/db";
import { Question } from "../../types";
import {
  Trash2,
  Edit,
  ArrowLeft,
  Save,
  Plus,
  Search,
  ImageIcon,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";
import { useUI } from "../../context/UIContext";
import { VirtualScroll } from "../../components/VirtualScroll";
import ConfirmModal from "../../components/ConfirmModal";

// ===================== BULK IMPORT MODAL =====================
const BulkImportModal: React.FC<{
  onClose: () => void;
  onImport: (questions: Question[]) => void;
}> = ({ onClose, onImport }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Question[]>([]);

  const EXAMPLE = `[
  {
    "questionText": "Aholi punktlarida ruxsat etilgan tezlik?",
    "options": {"A": "60 km/soat", "B": "80 km/soat", "C": "50 km/soat", "D": "100 km/soat"},
    "correctAnswer": "A",
    "category": "qoidalar"
  },
  {
    "questionText": "Bu qaysi belgi?",
    "options": {"A": "To'xtash", "B": "Yo'l bering", "C": "Taqiq", "D": "Xavf"},
    "correctAnswer": "A",
    "category": "belgilar",
    "image": "https://example.com/rasm.jpg"
  }
]`;

  const toBase64FromUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const handleParse = async () => {
    setError("");
    setPreview([]);
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON massiv bo'lishi kerak: [...]");

      const questions: Question[] = await Promise.all(
        parsed.map(async (item: any, i: number) => {
          if (!item.questionText) throw new Error(`${i + 1}-savol: "questionText" yo'q`);
          if (!item.options?.A || !item.options?.B || !item.options?.C || !item.options?.D)
            throw new Error(`${i + 1}-savol: options ichida A, B, C, D bo'lishi kerak`);
          if (!["A", "B", "C", "D"].includes(item.correctAnswer))
            throw new Error(`${i + 1}-savol: "correctAnswer" faqat A, B, C yoki D bo'lishi kerak`);

          let image = item.image || "";
          if (image && image.startsWith("http")) {
            image = await toBase64FromUrl(image);
          }

          return {
            id: Date.now().toString() + "_" + i + "_" + Math.random().toString(36).substr(2, 5),
            questionText: item.questionText,
            options: { A: item.options.A, B: item.options.B, C: item.options.C, D: item.options.D },
            correctAnswer: item.correctAnswer,
            category: item.category || "umumiy",
            image,
          };
        })
      );
      setPreview(questions);
    } catch (e: any) {
      setError(e.message || "JSON xato — formatni tekshiring");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">📥 Ko'p savolni bittada yuklash</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">📋 JSON format (namuna):</p>
            <pre className="text-xs text-blue-600 dark:text-blue-300 overflow-x-auto whitespace-pre-wrap font-mono">{EXAMPLE}</pre>
            <button
              onClick={() => { setText(EXAMPLE); setPreview([]); setError(""); }}
              className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Namunani yuklash
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              💡 <strong>Rasmli savollar uchun:</strong> "image" maydoniga rasm URL manzilini yozing — dastur uni avtomatik yuklab saqlaydi. Yoki base64 formatida ham qo'ysa bo'ladi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              JSON ni bu yerga joylashtiring:
            </label>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setPreview([]); setError(""); }}
              rows={12}
              placeholder='[{"questionText": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correctAnswer": "A", "category": "qoidalar"}]'
              className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-sm text-red-600 dark:text-red-400">❌ {error}</p>
            </div>
          )}

          {preview.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {preview.length} ta savol tayyor! Ko'rib chiqing:
                </p>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {preview.map((q, i) => (
                  <div key={i} className="text-xs bg-white dark:bg-slate-700 rounded-lg p-2 border border-green-100 dark:border-green-900 flex items-center gap-2">
                    {q.image && (
                      <img src={q.image} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-500 mr-1">{i + 1}.</span>
                      <span className="text-slate-700 dark:text-slate-300">{q.questionText}</span>
                    </div>
                    <span className="text-green-600 font-bold flex-shrink-0">{q.correctAnswer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {preview.length === 0 ? (
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Tekshirish
              </button>
            ) : (
              <button
                onClick={() => onImport(preview)}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Upload size={18} /> {preview.length} ta savolni saqlash
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Bekor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuestionList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useUI();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Confirmation States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Bulk import states
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);

  // Kategoriyalar ro'yxati
  const categories = [
    { id: "all", name: "Barchasi" },
    { id: "umumiy", name: "Umumiy" },
    { id: "jarimalar", name: "Jarimalar" },
    { id: "belgilar", name: "Yo'l belgilari" },
    { id: "qoidalar", name: "Harakatlanish qoidalari" },
    { id: "xavfsizlik", name: "Xavfsizlik" },
    { id: "texnik", name: "Texnik bilim" },
    { id: "birinchi-yordam", name: "Birinchi yordam" },
  ];

  useEffect(() => {
    setQuestions(getQuestions());
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteQuestion(deleteId);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAll(true);
  };

  const handleConfirmDeleteAll = () => {
    deleteAllQuestions();
    setQuestions([]);
    setIsDeleteAll(false);
  };

  const handleBulkImport = (newQuestions: Question[]) => {
    newQuestions.forEach((q) => saveQuestion(q));
    setQuestions(getQuestions());
    setShowBulkImport(false);
    setImportSuccess(newQuestions.length);
    setTimeout(() => setImportSuccess(0), 4000);
  };

  const filtered = useMemo(() => {
    let result = questions;

    // Kategoriya bo'yicha filtrlash
    if (selectedCategory !== "all") {
      result = result.filter(
        (q) => (q.category || "umumiy") === selectedCategory,
      );
    }

    // Qidiruv bo'yicha filtrlash
    if (search) {
      result = result.filter((q) =>
        q.questionText.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return result;
  }, [questions, search, selectedCategory]);

  const renderRow = (q: Question) => (
    <div className="p-2 h-full">
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-4 transition-colors h-full items-center shadow-sm hover:shadow-md">
        {q.image ? (
          <img
            src={q.image}
            alt=""
            className="w-16 h-16 object-cover rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
            <ImageIcon size={20} />
          </div>
        )}
        <div className="flex-1 overflow-hidden min-w-0">
          <p className="font-medium text-slate-800 dark:text-white line-clamp-2 mb-1 text-sm">
            {q.questionText}
          </p>
          <div className="flex gap-2 flex-wrap">
            {q.category && (
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900">
                {categories.find((c) => c.id === q.category)?.name ||
                  q.category}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded border border-green-100 dark:border-green-900">
              {t("q_answer")}: {q.correctAnswer}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/admin/questions/${q.id}`)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title={t("q_edit")}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, q.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="O'chirish"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 h-screen flex flex-col pb-4 box-border">

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImport}
        />
      )}

      {/* Muvaffaqiyat xabari */}
      {importSuccess > 0 && (
        <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle size={18} />
          {importSuccess} ta savol muvaffaqiyatli qo'shildi!
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t("q_list_title")}
          </h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleDeleteAllClick}
            className="flex-1 sm:flex-none bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-red-200 transition-all"
          >
            <Trash2 size={16} /> Tozalash
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-purple-700 transition-all"
          >
            <Upload size={16} /> Ko'p yuklash
          </button>
          <button
            onClick={() => navigate("/admin/questions/new")}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
          >
            <Plus size={16} /> {t("q_new")}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 flex-shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {cat.name}
            {cat.id !== "all" && (
              <span className="ml-2 text-xs opacity-75">
                (
                {
                  questions.filter((q) => (q.category || "umumiy") === cat.id)
                    .length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-6 flex-shrink-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder={t("q_search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white shadow-sm"
        />
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        {filtered.length > 0 ? (
          <VirtualScroll
            items={filtered}
            height={600} // Approximate height
            rowHeight={104} // 80px height + padding
            renderRow={renderRow}
            className="h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
            <ImageIcon size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {selectedCategory !== "all"
                ? `"${categories.find((c) => c.id === selectedCategory)?.name}" bo'limida hozircha savollar yo'q`
                : "Savollar topilmadi"}
            </p>
            <p className="text-sm text-center">
              {selectedCategory !== "all"
                ? "Bu bo'limga savol qo'shish uchun \"Yangi savol\" tugmasini bosing"
                : search
                  ? "Boshqa kalit so'z bilan qidiring yoki filterni o'zgartiring"
                  : 'Savol qo\'shish uchun "Yangi savol" tugmasini bosing'}
            </p>
          </div>
        )}
      </div>
      <div className="text-center text-xs text-slate-400 mt-2">
        Jami: {filtered.length} ta savol
      </div>

      {/* Delete Single Question Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Savolni o'chirish"
        message="Siz rostdan ham ushbu savolni o'chirib tashlamoqchimisiz?"
      />

      {/* Delete All Questions Modal */}
      <ConfirmModal
        isOpen={isDeleteAll}
        onClose={() => setIsDeleteAll(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Barchasini tozalash"
        message="DIQQAT! Barcha savollar o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
};

export const QuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useUI();
  const isEdit = id && id !== "new";

  const [formData, setFormData] = useState<Question>({
    id: "",
    questionText: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "A",
    image: "",
    category: "umumiy",
  });

  useEffect(() => {
    if (isEdit) {
      const all = getQuestions();
      const found = all.find((q) => q.id === id);
      if (found) setFormData(found);
    }
  }, [id, isEdit]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id: isEdit ? formData.id : Date.now().toString(),
    };
    saveQuestion(payload);
    navigate("/admin/questions");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Rasm hajmi juda katta!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setFormData((prev) => ({ ...prev, image: dataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/questions")}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isEdit ? t("q_form_edit") : t("q_form_new")}
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 transition-colors"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Savol Kategoriyasi
          </label>
          <select
            value={formData.category || "umumiy"}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="umumiy">Umumiy</option>
            <option value="jarimalar">Jarimalar</option>
            <option value="belgilar">Yo'l belgilari</option>
            <option value="qoidalar">Harakatlanish qoidalari</option>
            <option value="xavfsizlik">Xavfsizlik</option>
            <option value="texnik">Texnik bilim</option>
            <option value="birinchi-yordam">Birinchi yordam</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t("q_form_img")}
          </label>
          <div className="flex items-center gap-4">
            {formData.image ? (
              <div className="relative">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600">
                <ImageIcon className="text-slate-400" />
              </div>
            )}
            <label className="cursor-pointer bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
              Rasm Tanlash
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t("q_form_text")}
          </label>
          <textarea
            required
            rows={3}
            value={formData.questionText}
            onChange={(e) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("q_form_opts")}
          </label>
          {(["A", "B", "C", "D"] as const).map((opt) => (
            <div key={opt} className="flex gap-3 items-center">
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded font-bold text-slate-500 dark:text-slate-300">
                {opt}
              </span>
              <input
                required
                type="text"
                placeholder={`${opt} varianti`}
                value={formData.options[opt]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: { ...formData.options, [opt]: e.target.value },
                  })
                }
                className="flex-1 p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t("q_form_correct")}
          </label>
          <select
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value as any })
            }
            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
          >
            <option value="A">Variant A</option>
            <option value="B">Variant B</option>
            <option value="C">Variant C</option>
            <option value="D">Variant D</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex justify-center gap-2"
        >
          <Save size={20} /> {t("q_form_save")}
        </button>
      </form>
    </div>
  );
};
