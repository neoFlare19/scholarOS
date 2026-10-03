import InterestSetup from "./pages/InterestSetup.jsx";
import RoleSetup from "./pages/RoleSetup.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import DashboardShell from "./layout/DashboardShell.jsx";
import AdminShell from "./layout/AdminShell.jsx";

// Dashboard Sub-Pages
import Overview from "./pages/dashboard/index.jsx";
import Projects from "./pages/dashboard/projects.jsx";
import Papers from "./pages/dashboard/papers.jsx";
import Researchers from "./pages/dashboard/researchers.jsx";
import Notifications from "./pages/dashboard/notifications.jsx";
import Settings from "./pages/dashboard/settings.jsx";
import UploadPaper from "./pages/UploadPaper.jsx";
import ProfilePage from "./pages/dashboard/profile.jsx";

// Admin Pages
import VerificationDashboard from "./pages/admin/VerificationDashboard.jsx";

// Public Pages
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function AppRouter() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/interest-setup" element={<InterestSetup />} />
        <Route path="/role-setup" element={<RoleSetup />} />

        {/* Protected Dashboard Routes (Nested) */}
        <Route path="/dashboard" element={<DashboardShell />}>
          <Route index element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="papers" element={<Papers />} />
          <Route path="researchers" element={<Researchers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="upload" element={<UploadPaper />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminShell />}>
          <Route
            path="verification"
            element={<VerificationDashboard />}
          />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}