import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, MessageSquare,
  BookOpen, Video, Ticket, Star, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  {
    section: 'Asosiy',
    items: [
      { path: '/admin',             icon: LayoutDashboard, label: 'Dashboard',        exact: true },
    ]
  },
  {
    section: 'Kontent',
    items: [
      { path: '/admin/questions/new', icon: PlusCircle,  label: "Savol qo'shish" },
      { path: '/admin/questions',     icon: FileText,    label: 'Savollar ro\'yxati' },
      { path: '/admin/biletlar',      icon: Ticket,      label: 'Biletlar' },
    ]
  },
  {
    section: 'Ta\'lim',
    items: [
      { path: '/admin/yhq',     icon: BookOpen,      label: 'YHQ Boblar' },
      { path: '/admin/kurslar', icon: Video,         label: 'Video Kurslar' },
    ]
  },
  {
    section: 'Foydalanuvchilar',
    items: [
      { path: '/admin/messages', icon: MessageSquare, label: 'Xabarlar' },
    ]
  },
];

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const currentPageName = () => {
    for (const group of NAV) {
      for (const item of group.items) {
        if (isActive(item.path, item.exact)) return item.label;
      }
    }
    return 'Admin Panel';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
            R
          </div>
          <div>
            <p className="font-black text-slate-800 dark:text-white text-sm leading-tight">RuldaTest</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV.map(group => (
          <div key={group.section}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-1.5">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.path, item.exact);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Chiqish */}
      <div className="px-3 pb-5 border-t border-slate-200 dark:border-slate-800 pt-3">
        <button
          onClick={() => { if (window.confirm("Chiqishni tasdiqlaysizmi?")) logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white dark:bg-slate-900 h-full shadow-2xl">
            <SidebarContent />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        </div>
      )}

      {/* ── KONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Yuqori panel (faqat mobil + breadcrumb) */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Mobil menu tugma */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">Admin</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
            <span className="font-bold text-slate-800 dark:text-white">{currentPageName()}</span>
          </div>
        </header>

        {/* Sahifa kontenti */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
