// services/supabase.ts
// Supabase bilan ishlash - barcha ma'lumotlar bulutda saqlanadi

import { createClient } from '@supabase/supabase-js';
import { Question, TestResult, User, Role } from '../types';

const SUPABASE_URL = 'https://bwdnvxucvyeknesifnwg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Wn3kdqlj3_w9tIZZX83rYw_sB-23j8v';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FREE_DAILY_LIMIT = 20;

// =================== PAROL HASH ===================
const hashPassword = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
};

// =================== FOYDALANUVCHILAR ===================

export const loginUser = async (name: string, password: string): Promise<User | null> => {
  const hashed = hashPassword(password);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .single();

  if (error || !data) return null;
  if (data.password !== hashed && data.password !== password) return null;

  return {
    id: data.id,
    name: data.name,
    password: data.password,
    avatar: data.avatar || '',
    role: data.role as Role,
    totalPoints: data.total_points || 0,
    createdAt: data.created_at,
    lastActive: data.last_active,
  };
};

export const registerUser = async (name: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  // Ism band emasligini tekshirish
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('name', name)
    .single();

  if (existing) {
    return { success: false, message: 'Bu ism allaqachon band!' };
  }

  const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const hashed = hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      name,
      password: hashed,
      role: 'USER',
      total_points: 0,
      avatar: '',
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, message: 'Xatolik yuz berdi, qayta urinib ko\'ring' };
  }

  const user: User = {
    id: data.id,
    name: data.name,
    password: data.password,
    avatar: data.avatar || '',
    role: data.role as Role,
    totalPoints: 0,
    createdAt: data.created_at,
  };

  return { success: true, user };
};

export const updateUserProfile = async (user: User): Promise<boolean> => {
  const updateData: any = {
    name: user.name,
    avatar: user.avatar || '',
    last_active: new Date().toISOString(),
  };

  if (user.password) {
    updateData.password = user.password.startsWith('hashed_') ? user.password : hashPassword(user.password);
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id);

  return !error;
};

export const updateLastActive = async (userId: string) => {
  await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', userId);
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (!data) return [];
  return data.map(d => ({
    id: d.id,
    name: d.name,
    password: d.password,
    avatar: d.avatar || '',
    role: d.role as Role,
    totalPoints: d.total_points || 0,
    createdAt: d.created_at,
    lastActive: d.last_active,
  }));
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  return !error;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    password: data.password,
    avatar: data.avatar || '',
    role: data.role as Role,
    totalPoints: data.total_points || 0,
    createdAt: data.created_at,
    lastActive: data.last_active,
  };
};

// =================== SAVOLLAR ===================

export const getQuestions = async (): Promise<Question[]> => {
  const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: true });
  if (!data) return [];
  return data.map(d => ({
    id: d.id,
    questionText: d.question_text,
    options: { A: d.option_a, B: d.option_b, C: d.option_c, D: d.option_d },
    correctAnswer: d.correct_answer as 'A' | 'B' | 'C' | 'D',
    image: d.image || '',
    category: d.category || 'umumiy',
  }));
};

export const getQuestionsByCategory = async (category: string): Promise<Question[]> => {
  let query = supabase.from('questions').select('*');

  if (category === 'umumiy') {
    query = query.or('category.eq.umumiy,category.is.null');
  } else {
    query = query.eq('category', category);
  }

  const { data } = await query.order('created_at', { ascending: true });
  if (!data) return [];

  return data.map(d => ({
    id: d.id,
    questionText: d.question_text,
    options: { A: d.option_a, B: d.option_b, C: d.option_c, D: d.option_d },
    correctAnswer: d.correct_answer as 'A' | 'B' | 'C' | 'D',
    image: d.image || '',
    category: d.category || 'umumiy',
  }));
};

export const saveQuestion = async (question: Question): Promise<boolean> => {
  const row = {
    id: question.id,
    question_text: question.questionText,
    option_a: question.options.A,
    option_b: question.options.B,
    option_c: question.options.C,
    option_d: question.options.D,
    correct_answer: question.correctAnswer,
    image: question.image || '',
    category: question.category || 'umumiy',
  };

  const { error } = await supabase.from('questions').upsert(row, { onConflict: 'id' });
  return !error;
};

export const deleteQuestion = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  return !error;
};

export const deleteAllQuestions = async (): Promise<boolean> => {
  const { error } = await supabase.from('questions').delete().neq('id', '');
  return !error;
};

export const bulkSaveQuestions = async (questions: Question[]): Promise<{ saved: number; errors: number }> => {
  let saved = 0;
  let errors = 0;

  // 50 tadan batch qilib yuborish (tezroq)
  const batchSize = 50;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize).map(q => ({
      id: q.id || 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      question_text: q.questionText,
      option_a: q.options.A,
      option_b: q.options.B,
      option_c: q.options.C,
      option_d: q.options.D,
      correct_answer: q.correctAnswer,
      image: q.image || '',
      category: q.category || 'umumiy',
    }));

    const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' });
    if (error) {
      errors += batch.length;
    } else {
      saved += batch.length;
    }
  }

  return { saved, errors };
};

// =================== TEST NATIJALARI ===================

export const saveResult = async (result: TestResult): Promise<boolean> => {
  const { error } = await supabase.from('test_results').insert({
    id: result.id,
    user_id: result.userId,
    date: result.date,
    total_questions: result.totalQuestions,
    correct_count: result.correctCount,
    score_percentage: result.scorePercentage,
    time_spent_seconds: result.timeSpentSeconds || 0,
    details: result.details,
  });

  if (!error) {
    // Ballarni yangilash
    const points = Math.round(result.scorePercentage);
    await supabase.rpc('increment_points', { user_id_param: result.userId, points_param: points })
      .then(async () => {
        // RPC yo'q bo'lsa, oddiy update
      }).catch(async () => {
        const { data: u } = await supabase.from('users').select('total_points').eq('id', result.userId).single();
        if (u) {
          await supabase.from('users').update({ total_points: (u.total_points || 0) + points }).eq('id', result.userId);
        }
      });
  }

  return !error;
};

export const getResults = async (userId?: string): Promise<TestResult[]> => {
  let query = supabase.from('test_results').select('*').order('date', { ascending: false });
  if (userId) query = query.eq('user_id', userId);

  const { data } = await query.limit(500);
  if (!data) return [];

  return data.map(d => ({
    id: d.id,
    userId: d.user_id,
    date: d.date,
    totalQuestions: d.total_questions,
    correctCount: d.correct_count,
    scorePercentage: d.score_percentage,
    timeSpentSeconds: d.time_spent_seconds || 0,
    details: d.details || [],
  }));
};

// =================== PREMIUM ===================

export const isPremiumActive = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('premium_users')
    .select('expires_at')
    .eq('user_id', userId)
    .single();

  if (!data) return false;
  return new Date(data.expires_at) > new Date();
};

export const getPremiumInfo = async (userId: string): Promise<{ active: boolean; expiresAt?: string } | null> => {
  const { data } = await supabase
    .from('premium_users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) return { active: false };
  const active = new Date(data.expires_at) > new Date();
  return { active, expiresAt: data.expires_at };
};

export const activatePremiumCode = async (
  userId: string,
  code: string
): Promise<{ success: boolean; message: string; expiresAt?: string }> => {
  // Format: PREM-XXXXXX-30
  const parts = code.trim().toUpperCase().split('-');
  if (parts.length !== 3 || parts[0] !== 'PREM') {
    return { success: false, message: 'Noto\'g\'ri kod formati!' };
  }

  const days = parseInt(parts[2]);
  if (isNaN(days) || days <= 0) {
    return { success: false, message: 'Noto\'g\'ri kod!' };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const labels: Record<number, string> = { 7: '1 hafta', 30: '1 oy', 90: '3 oy', 365: '1 yil' };
  const plan = labels[days] || `${days} kun`;

  const { error } = await supabase.from('premium_users').upsert({
    user_id: userId,
    plan,
    activated_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    code,
  }, { onConflict: 'user_id' });

  if (error) return { success: false, message: 'Xatolik yuz berdi!' };

  return { success: true, message: `Premium ${plan} faollashtirildi!`, expiresAt: expiresAt.toISOString() };
};

// =================== KUNLIK TEST LIMIT ===================

export const getDailyTestInfo = async (userId: string): Promise<{ used: number; limit: number; canTest: boolean }> => {
  const premium = await isPremiumActive(userId);
  if (premium) return { used: 0, limit: 999, canTest: true };

  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('daily_tests')
    .select('count')
    .eq('user_id', userId)
    .eq('test_date', today)
    .single();

  const used = data?.count || 0;
  return { used, limit: FREE_DAILY_LIMIT, canTest: used < FREE_DAILY_LIMIT };
};

export const incrementDailyTest = async (userId: string): Promise<void> => {
  const premium = await isPremiumActive(userId);
  if (premium) return;

  const today = new Date().toISOString().split('T')[0];
  
  // Mavjud bo'lsa +1, yo'q bo'lsa 1 dan boshlash
  const { data } = await supabase
    .from('daily_tests')
    .select('count')
    .eq('user_id', userId)
    .eq('test_date', today)
    .single();

  if (data) {
    await supabase
      .from('daily_tests')
      .update({ count: data.count + 1 })
      .eq('user_id', userId)
      .eq('test_date', today);
  } else {
    await supabase
      .from('daily_tests')
      .insert({ user_id: userId, test_date: today, count: 1 });
  }
};

// =================== SOZLAMALAR ===================

export const getSetting = async (key: string): Promise<string> => {
  const { data } = await supabase.from('settings').select('value').eq('key', key).single();
  return data?.value || '';
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
};

export const getPaymentSettings = async () => {
  const { data } = await supabase.from('settings').select('*');
  if (!data) return {};
  return Object.fromEntries(data.map(d => [d.key, d.value]));
};

// =================== STATISTIKA ===================

export const getAdminStats = async () => {
  const [usersRes, questionsRes, resultsRes, premiumRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('test_results').select('id', { count: 'exact', head: true }),
    supabase.from('premium_users').select('id', { count: 'exact', head: true }).gt('expires_at', new Date().toISOString()),
  ]);

  return {
    totalUsers: usersRes.count || 0,
    totalQuestions: questionsRes.count || 0,
    totalTests: resultsRes.count || 0,
    activePremium: premiumRes.count || 0,
  };
};

// =================== ADMIN ===================

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  const hashed = hashPassword(password);
  const { data } = await supabase
    .from('users')
    .select('password')
    .eq('role', 'ADMIN')
    .single();

  if (!data) return false;
  return data.password === hashed || data.password === password;
};

export const updateAdminPassword = async (newPass: string): Promise<void> => {
  const hashed = hashPassword(newPass);
  await supabase.from('users').update({ password: hashed }).eq('role', 'ADMIN');
};
