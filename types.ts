export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;         // Login username, e.g. Kamron201
  fullName?: string;    // Ism va Familya
  phone?: string;       // Telefon raqam: +998901234567
  password?: string;
  avatar?: string;
  role: Role;
  createdAt: string;
  totalPoints: number;
  lastActive?: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  image?: string;
  category?: string;
  description?: string; // Premium foydalanuvchilar uchun tushuntirish
}

export interface TestResultDetail {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface TestResult {
  id: string;
  userId: string;
  date: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  details: TestResultDetail[];
  questions?: Question[]; // Premium xatolar tahlili uchun
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  loginTime: string;
  lastSeen: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUserProfile: (updatedUser: User) => void;
}

export interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  totalTestsTaken: number;
  badges: string[];
  streak: number;
  lastTestDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface Friend {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  addedAt: string;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  status: 'pending' | 'accepted' | 'completed';
  questionCount: number;
  challengerScore?: number;
  challengedScore?: number;
  createdAt: string;
  expiresAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  questionId: string;
  note?: string;
  createdAt: string;
}

export interface UserGoal {
  userId: string;
  dailyTestTarget: number;
  accuracyTarget: number;
  weeklyTestTarget: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  category: string;
  type: 'article' | 'video' | 'quiz';
  content: string;
}
