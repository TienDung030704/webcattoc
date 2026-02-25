import { Routes, Route } from "react-router-dom";

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Page
import Login from "@/pages/Auth/LoginForm/login";
import Register from "@/pages/Auth/RegisterForm/register";
import ResetPassword from "@/pages/Auth/ResetForm/ResetPassword";
import ForgotPassword from "@/pages/Auth/ForgotForm/ForgotPassword";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Home />}></Route>
        <Route path="/search" element={<Search />}></Route>
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
