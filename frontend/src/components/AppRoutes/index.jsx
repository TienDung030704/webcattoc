import { Routes, Route } from "react-router-dom";

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Page
import Login from "@/pages/Auth/LoginForm/login";
import Register from "@/pages/Auth/RegisterForm/register";
import ResetPassword from "@/pages/Auth/ResetForm/ResetPassword";
import ForgotPassword from "@/pages/Auth/ForgotForm/ForgotPassword";
import GoogleCallback from "@/pages/Auth/GoogleCallback";
import Home from "@/pages/Home";
import ServicePage from "@/pages/ServicePage";
import ProductPage from "@/pages/ProductPage";
import ProductDetailPage from "@/pages/ProductPage/ProductDetail";
import FavoritePage from "@/pages/FavoritePage";
import ShoppingCartPage from "@/pages/ShoppingCart";
import PaymentPage from "@/pages/PaymentPage";
import PaymentMomoPage from "@/pages/PaymentMomo";
import PaymentMomoReturnPage from "@/pages/PaymentMomoReturn";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import NewsPage from "@/pages/NewsPage";
import NewsPageDetails from "@/pages/NewsPage/NewsPageDetails";
import StoresPage from "@/pages/StoresPage";
import ContactPage from "@/pages/ContactPage";
import BookingHairPage from "@/pages/BookingHair";
import BookingHistoryPage from "@/pages/BookingHistory";
import InformationIndividualPage from "@/pages/Information-Individual";
import AdminPage from "@/pages/Admin";
import AdminDashboardPage from "@/pages/Admin/AdminDashboard";
import AppointmentManagerPage from "@/pages/Admin/AppointmentManager";
import ProductManagerPage from "@/pages/Admin/ProductManager";
import CustomerManagerPage from "@/pages/Admin/CustomerManager";
import ServiceManagerPage from "@/pages/Admin/ServiceManager";
import AdminNewsManagerPage from "@/pages/Admin/AdminNewsManager";
import AdminOrderManagerPage from "@/pages/Admin/AdminOrderManager";
import RevenuePageManager from "@/pages/Admin/RevenuePageManager";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Home />}></Route>
        <Route path="/service" element={<ServicePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/favorite" element={<FavoritePage />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/momo" element={<PaymentMomoPage />} />
        <Route path="/payment/momo/return" element={<PaymentMomoReturnPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsPageDetails />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/booking" element={<BookingHairPage />} />
        <Route
          path="/information-individual"
          element={<InformationIndividualPage />}
        />
        <Route path="/booking-history" element={<BookingHistoryPage />} />
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="appointments" element={<AppointmentManagerPage />} />
          <Route path="services" element={<ServiceManagerPage />} />
          <Route path="news" element={<AdminNewsManagerPage />} />
          <Route path="products" element={<ProductManagerPage />} />
          <Route path="orders" element={<AdminOrderManagerPage />} />
          <Route path="revenue" element={<RevenuePageManager />} />
          <Route path="customers" element={<CustomerManagerPage />} />
        </Route>
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Route>
    </Routes>
  );
}
export default AppRoutes;
