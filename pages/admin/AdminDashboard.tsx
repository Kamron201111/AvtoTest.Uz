import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, Activity, Key, PlusCircle, List,
  Eye, EyeOff, Trash2, MessageSquare, Star, Clock,
  CheckCircle, XCircle, CreditCard, Settings, RefreshCw,
  AlertTriangle, ExternalLink,
} from 'lucide-react';
import {
  getAdminStats, getUsers, deleteUser, updateAdminPassword,
  getPremiumRequests, approvePremiumRequest, rejectPremiumRequest,
  getAllPremiumUsers, getAllSettings, setSetting,
} from '../../services/supabase';
import { User, Role } from '../../types';
import { useUI } from '../../context/UIContext';
import ConfirmModal from '../../components/ConfirmModal';

type AdminTab = 'dashboard' | 'premium' | 'users' | 'settings';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useUI();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalTests: 0, activePremium: 0, pendingRequests: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<any[]>([]);
  const [allPremiumUsers, setAllPremiumUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showUserPass, setShowUserPass] = useState<Record<string, boolean>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      const [st, us, reqs, prem, sett] = await Promise.all([
        getAdminStats(),
        getUsers(),
        getPremiumRequests(),
        getAllPremiumUsers(),
        getAllSettings(),
      ]);
      setStats(st);
      setUsers(us.filter(u => u.role !== Role.ADMIN));
      setPremiumRequests(reqs);
      setAllPremiumUsers(prem);
      setSettings(sett);
      setLocalSettings(sett);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh pending requests every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const reqs = await getPremiumRequests();
      setPremiumRequests(reqs);
      const st = await getAdminStats();
      setStats(st);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    const success = await approvePremiumRequest(requestId);
    if (success) {
      setPremiumRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
      await loadData();
    }
    setProcessing(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    await rejectPremiumRequest(requestId);
    setPremiumRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    setProcessing(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    await deleteUser(deleteUserId);
    setUsers(prev => prev.filter(u => u.id !== deleteUserId));
    setDeleteUserId(null);
  };

  const handlePasswordChange = async () => {
    if (newPass.length < 4) return alert("Parol juda qisqa");
    await updateAdminPassword(newPass);
    setShowPassModal(false);
    setNewPass('');
    alert("Parol o'zgartirildi");
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const keys = ['card_number', 'card_owner', 'card_type', 'price_1_hafta', 'price_1_oy', 'price_1_yil'];
    await Promise.all(keys.map(k => setSetting(k, localSettings[k] || '')));
    setSettings({ ...localSettings });
    setSettingsMsg('✅ Sozlamalar saqlandi!');
    setTimeout(() => setSettingsMsg(''), 3000);
    setSavingSettings(false);
  };

  const pendingReqs = premiumRequests.filter(r => r.status === 'pending');

  const TABS: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'premium', label: 'Premium', icon: Star, badge: pendingReqs.length },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">🔑 Admin Panel</h1>
          <button onClick={loadData} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <RefreshCw className="w-4 h-4" /> Yangilash
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all relative ${tab === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {badge && badge > 0 ? (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${tab === id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ======= DASHBOARD TAB ======= */}
        {tab === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Savollar', value: stats.totalQuestions, icon: FileText, color: 'blue' },
                { label: 'Testlar', value: stats.totalTests, icon: Activity, color: 'green' },
                { label: 'Foydalanuvchilar', value: stats.totalUsers, icon: Users, color: 'purple' },
                { label: 'Premium faol', value: stats.activePremium, icon: Star, color: 'amber' },
                { label: 'Kutilmoqda', value: stats.pendingRequests, icon: Clock, color: 'red' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                  <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button onClick={() => navigate('/admin/questions/new')} className="p-5 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 flex flex-col items-center gap-2">
                <PlusCircle className="w-8 h-8" />
                <span className="font-bold">Savol qo'shish</span>
              </button>
              <button onClick={() => navigate('/admin/questions')} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:shadow-md flex flex-col items-center gap-2">
                <List className="w-8 h-8 text-slate-400" />
                <span className="font-bold">Savollar boshqaruvi</span>
              </button>
              <button onClick={() => navigate('/admin/messages')} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:shadow-md flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 text-slate-400" />
                <span className="font-bold">Xabarlar</span>
              </button>
              <button onClick={() => navigate('/admin/yhq')} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:shadow-md flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-indigo-400" />
                <span className="font-bold">YHQ Boblar</span>
              </button>
              <button onClick={() => navigate('/admin/kurslar')} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:shadow-md flex flex-col items-center gap-2">
                <Activity className="w-8 h-8 text-purple-400" />
                <span className="font-bold">Kurslar</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPassModal(true)} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md">
                <Key className="w-4 h-4" /> Admin parolni o'zgartirish
              </button>
            </div>
          </div>
        )}

        {/* ======= PREMIUM TAB ======= */}
        {tab === 'premium' && (
          <div className="space-y-5">
            {/* Kutilayotgan so'rovlar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" /> Kutilayotgan so'rovlar
                  {pendingReqs.length > 0 && <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{pendingReqs.length}</span>}
                </h3>
              </div>
              {pendingReqs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                  <p className="font-medium">Hozircha kutilayotgan so'rovlar yo'q</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pendingReqs.map(req => (
                    <div key={req.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 dark:text-white">{req.user_name}</p>
                          <p className="text-sm text-slate-500">📦 {req.plan} • 💰 {parseInt(req.price).toLocaleString()} so'm</p>
                          <p className="text-xs text-slate-400 mt-1">🕐 {new Date(req.created_at).toLocaleString('uz-UZ')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(req.id)} disabled={processing === req.id}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
                            <CheckCircle className="w-4 h-4" /> Tasdiqlash
                          </button>
                          <button onClick={() => handleReject(req.id)} disabled={processing === req.id}
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
                            <XCircle className="w-4 h-4" /> Rad etish
                          </button>
                        </div>
                      </div>
                      {req.screenshot_url && (
                        <div className="space-y-2">
                          <img src={req.screenshot_url} alt="To'lov cheki" className="w-full max-h-56 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50" />
                          <a href={req.screenshot_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                            <ExternalLink className="w-3 h-3" /> To'liq ko'rish
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Faol premium foydalanuvchilar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" fill="currentColor" /> Premium foydalanuvchilar ({stats.activePremium})
                </h3>
              </div>
              {allPremiumUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400"><p>Hozircha premium foydalanuvchilar yo'q</p></div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {allPremiumUsers.map((pu: any) => {
                    const isActive = new Date(pu.expires_at) > new Date();
                    const userName = pu.users?.name || pu.user_id;
                    return (
                      <div key={pu.user_id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-400'}`}></div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{userName}</p>
                            <p className="text-xs text-slate-500">{pu.plan} • {new Date(pu.expires_at).toLocaleDateString('uz-UZ')} gacha</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {isActive ? 'Faol' : 'Tugagan'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Barcha so'rovlar tarixi */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-black text-slate-800 dark:text-white">📋 Barcha so'rovlar tarixi</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
                {premiumRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{req.user_name}</p>
                      <p className="text-xs text-slate-400">{req.plan} • {new Date(req.created_at).toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status === 'approved' ? '✅ Tasdiqlangan' : req.status === 'rejected' ? '❌ Rad etilgan' : '⏳ Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======= USERS TAB ======= */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-black text-slate-800 dark:text-white">👥 Foydalanuvchilar ({users.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  {u.avatar ? (
                    <img src={u.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString('uz-UZ')} • {u.totalPoints} ball</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">
                        {showUserPass[u.id] ? u.password : '••••••'}
                      </span>
                      <button onClick={() => setShowUserPass(prev => ({ ...prev, [u.id]: !prev[u.id] }))} className="text-slate-400 hover:text-slate-600">
                        {showUserPass[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button onClick={() => setDeleteUserId(u.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="p-8 text-center text-slate-400">Foydalanuvchilar yo'q</div>}
            </div>
          </div>
        )}

        {/* ======= SETTINGS TAB ======= */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> Karta ma'lumotlari
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'card_number', label: 'Karta raqami', placeholder: '9860 1234 5678 9012' },
                  { key: 'card_owner', label: 'Karta egasi', placeholder: 'Ism Familiya' },
                  { key: 'card_type', label: 'Karta turi', placeholder: 'Humo / UzCard' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">{label}</label>
                    <input type="text" value={localSettings[key] || ''} onChange={e => setLocalSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-blue-500 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                💰 Premium narxlar (so'm)
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'price_1_hafta', label: '1 Hafta narxi' },
                  { key: 'price_1_oy', label: '1 Oy narxi' },
                  { key: 'price_1_yil', label: '1 Yil narxi' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 block">{label}</label>
                    <input type="number" value={localSettings[key] || ''} onChange={e => setLocalSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-blue-500 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {settingsMsg && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl text-sm font-semibold">{settingsMsg}</div>
            )}

            <button onClick={handleSaveSettings} disabled={savingSettings}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {savingSettings ? 'Saqlanmoqda...' : '💾 Sozlamalarni Saqlash'}
            </button>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-900/30 p-4 flex items-center justify-between">
              <span className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Admin parolini o'zgartirish
              </span>
              <button onClick={() => setShowPassModal(true)} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-700 px-3 py-2 rounded-xl border border-red-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:shadow-md">
                <Key className="w-4 h-4" /> O'zgartirish
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PAROL MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm border dark:border-slate-700">
            <h3 className="text-lg font-black mb-4 dark:text-white">Yangi Admin Parol</h3>
            <input type="password" className="w-full border-2 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 rounded-xl mb-4 text-slate-900 dark:text-white outline-none focus:border-blue-500"
              placeholder="Yangi parol" value={newPass} onChange={e => setNewPass(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setShowPassModal(false)} className="flex-1 py-2.5 text-slate-500 border border-slate-200 dark:border-slate-600 rounded-xl">Bekor qilish</button>
              <button onClick={handlePasswordChange} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Foydalanuvchini o'chirish"
        message="Siz rostdan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz?"
      />
    </div>
  );
};

export default AdminDashboard;
