import React from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { Role } from "./types";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import LoadingOverlay from "./components/LoadingOverlay";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import UserDashboard from "./pages/user/UserDashboard";
import Quiz from "./pages/user/Quiz";
import Result from "./pages/user/Result";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";
import Leaderboard from "./pages/user/Leaderboard";
import YHQ from "./pages/user/YHQ";
import TalimPage from "./pages/user/TalimPage";
import Sozlamalar from "./pages/user/Sozlamalar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { QuestionList, QuestionForm } from "./pages/admin/QuestionManager";
import Chat from "./pages/Chat";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminChat from "./pages/admin/AdminChat";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// Admin — yuqori navbar bilan
const AdminLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

// User — pastki BottomNav bilan, navbar YO'Q
const UserLayout = () => (
  <>
    <div className="pb-20">
      <Outlet />
    </div>
    <BottomNav />
  </>
);

// To'liq ekran — Quiz, Result (nav yo'q)
const FullScreen = () => <Outlet />;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <LoadingOverlay />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* === USER ROUTES === */}
            <Route element={<ProtectedRoute allowedRoles={[Role.USER]} />}>

              {/* Bottom Nav ko'rinadigan sahifalar */}
              <Route element={<UserLayout />}>
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/yhq" element={<YHQ />} />
                <Route path="/talim" element={<TalimPage />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/sozlamalar" element={<Sozlamalar />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
              </Route>

              {/* To'liq ekran (bottom nav yo'q) */}
              <Route element={<FullScreen />}>
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
              </Route>
            </Route>

            {/* === ADMIN ROUTES === */}
            <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/questions" element={<QuestionList />} />
                <Route path="/admin/questions/:id" element={<QuestionForm />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/chat/:userId" element={<AdminChat />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
