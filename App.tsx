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
import Badges from "./pages/user/Badges";
import Topics from "./pages/user/Topics";
import Friends from "./pages/user/Friends";
import Goals from "./pages/user/Goals";
import StudyMaterials from "./pages/user/StudyMaterials";
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

// Admin uchun — yuqori navbar bilan
const AdminLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

// User uchun — pastki navigatsiya bilan, navbar yo'q
const UserLayout = () => (
  <>
    <div className="pb-20"> {/* Bottom nav uchun joy */}
      <Outlet />
    </div>
    <BottomNav />
  </>
);

// Quiz va Result uchun — bottom nav YO'Q (to'liq ekran)
const FullScreenLayout = () => (
  <Outlet />
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <LoadingOverlay />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* USER routes — bottom nav bilan */}
            <Route element={<ProtectedRoute allowedRoles={[Role.USER]} />}>
              <Route element={<UserLayout />}>
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/badges" element={<Badges />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/study-materials" element={<StudyMaterials />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Quiz va Result — to'liq ekran, bottom nav yo'q */}
              <Route element={<FullScreenLayout />}>
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
              </Route>
            </Route>

            {/* ADMIN routes — top navbar bilan */}
            <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/questions" element={<QuestionList />} />
                <Route path="/admin/questions/:id" element={<QuestionForm />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/chat/:userId" element={<AdminChat />} />
              </Route>
            </Route>

            {/* Shared profile — user uchun bottom nav bilan */}
            <Route element={<ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]} />}>
              <Route element={<FullScreenLayout />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
