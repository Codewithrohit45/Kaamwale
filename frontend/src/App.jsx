import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Search from "./pages/Search/Search";
import Category from "./pages/Category/Category";
import ProviderProfile from "./pages/ProviderProfile/ProviderProfile";
import Booking from "./pages/Booking/Booking";
import ProviderOverview from "./pages/Dashboard/ProviderOverview";
import ProviderAvailability from "./pages/Dashboard/ProviderAvailability";
import ProviderProfileEdit from "./pages/Dashboard/ProviderProfileEdit";
import ProviderReviews from "./pages/Dashboard/ProviderReviews";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import UserProfileEdit from "./pages/Dashboard/UserProfileEdit";
import Messages from "./pages/Dashboard/Messages";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/category/:name" element={<MainLayout><Category /></MainLayout>} />
        <Route path="/provider/:id" element={<MainLayout><ProviderProfile /></MainLayout>} />
        <Route path="/book/:id" element={<ProtectedRoute role="user"><MainLayout><Booking /></MainLayout></ProtectedRoute>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        
        {/* Provider Dashboard Routes */}
        <Route path="/provider/dashboard" element={<ProtectedRoute role="provider"><DashboardLayout role="provider"><ProviderOverview /></DashboardLayout></ProtectedRoute>} />
        <Route path="/provider/availability" element={<ProtectedRoute role="provider"><DashboardLayout role="provider"><ProviderAvailability /></DashboardLayout></ProtectedRoute>} />
        <Route path="/provider/profile" element={<ProtectedRoute role="provider"><DashboardLayout role="provider"><ProviderProfileEdit /></DashboardLayout></ProtectedRoute>} />
        <Route path="/provider/reviews" element={<ProtectedRoute role="provider"><DashboardLayout role="provider"><ProviderReviews /></DashboardLayout></ProtectedRoute>} />
        <Route path="/provider/messages" element={<ProtectedRoute role="provider"><DashboardLayout role="provider"><Messages /></DashboardLayout></ProtectedRoute>} />
        
        {/* User Dashboard Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute role="user"><DashboardLayout role="user"><UserDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute role="user"><DashboardLayout role="user"><UserProfileEdit /></DashboardLayout></ProtectedRoute>} />
        <Route path="/user/messages" element={<ProtectedRoute role="user"><DashboardLayout role="user"><Messages /></DashboardLayout></ProtectedRoute>} />
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminLayout><AdminUsers /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/bookings" element={<AdminProtectedRoute><AdminLayout><AdminBookings /></AdminLayout></AdminProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;