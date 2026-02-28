import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Page
import Login from "@/pages/Auth/LoginForm/login";
import Register from "@/pages/Auth/RegisterForm/register";
import ResetPassword from "@/pages/Auth/ResetForm/ResetPassword";
import ForgotPassword from "@/pages/Auth/ForgotForm/ForgotPassword";

// Placeholder pages (chưa làm)
function Home() {
  return <div className="p-8 text-white">Trang chủ (coming soon)</div>;
}
function Search() {
  return <div className="p-8 text-white">Tìm kiếm (coming soon)</div>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route element={<DefaultLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
}
export default AppRoutes;
