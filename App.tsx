import React from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { Role } from "./types";
import LoadingOverlay from "./components/LoadingOverlay";
import BottomNav from "./components/BottomNav";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import UserDashboard from "./pages/user/UserDashboard";
import Quiz from "./pages/user/Quiz";
import Result from "./pages/user/Result";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";
import YHQ from "./pages/user/YHQ";
import TalimPage from "./pages/user/TalimPage";
import KurslarPage from "./pages/user/Kurslar";
import Sozlamalar from "./pages/user/Sozlamalar";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { QuestionList, QuestionForm } from "./pages/admin/QuestionManager";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminChat from "./pages/admin/AdminChat";
import AdminYHQManager from "./pages/admin/AdminYHQManager";
import AdminKurslarManager from "./pages/admin/AdminKurslarManager";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// Layout with bottom navigation (for user pages)
const UserLayout = () => (
  <>
    <Outlet />
    <BottomNav />
  </>
);

// Layout with top navbar (for admin pages)
const AdminLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

// Full screen layout - no nav (for quiz, result)
const FullScreen = () => <Outlet />;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <LoadingOverlay />
        <HashRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* User routes - with bottom nav */}
            <Route element={<UserLayout />}>
              <Route element={<ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]} />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={[Role.USER]} />}>
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/yhq" element={<YHQ />} />
                <Route path="/talim" element={<TalimPage />} />
                <Route path="/kurslar" element={<KurslarPage />} />
                <Route path="/sozlamalar" element={<Sozlamalar />} />
                <Route path="/history" element={<History />} />
                <Route path="/chat" element={<Chat />} />
              </Route>
            </Route>

            {/* Full screen routes - no nav (quiz, result) */}
            <Route element={<FullScreen />}>
              <Route element={<ProtectedRoute allowedRoles={[Role.USER]} />}>
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
              </Route>
            </Route>

            {/* Admin routes - with top navbar */}
            <Route element={<AdminLayout />}>
              <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/questions" element={<QuestionList />} />
                <Route path="/admin/questions/:id" element={<QuestionForm />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/chat/:userId" element={<AdminChat />} />
                <Route path="/admin/yhq" element={<AdminYHQManager />} />
                <Route path="/admin/kurslar" element={<AdminKurslarManager />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
