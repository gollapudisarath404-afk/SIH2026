import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import SchemesPage from "../pages/SchemesPage.jsx";
import SchemeDetailPage from "../pages/SchemeDetailPage.jsx";
import EligibilityPage from "../pages/EligibilityPage.jsx";
import RecommendationsPage from "../pages/RecommendationsPage.jsx";
import AssistantPage from "../pages/AssistantPage.jsx";
import DocumentsPage from "../pages/DocumentsPage.jsx";
import ComparisonPage from "../pages/ComparisonPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/user"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="schemes" element={<SchemesPage />} />
        <Route path="schemes/:id" element={<SchemeDetailPage />} />
        <Route path="eligibility" element={<EligibilityPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="comparison" element={<ComparisonPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
