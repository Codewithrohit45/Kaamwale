import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Search from "./pages/Search/Search";
import ProviderProfile from "./pages/ProviderProfile/ProviderProfile";
import Booking from "./pages/Booking/Booking";
import ProviderOverview from "./pages/Dashboard/ProviderOverview";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import Messages from "./pages/Dashboard/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/provider/:id" element={<MainLayout><ProviderProfile /></MainLayout>} />
        <Route path="/book/:id" element={<MainLayout><Booking /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
        
        {/* Provider Dashboard Routes */}
        <Route path="/provider/dashboard" element={<DashboardLayout role="provider"><ProviderOverview /></DashboardLayout>} />
        
        {/* User Dashboard Routes */}
        <Route path="/user/dashboard" element={<DashboardLayout role="user"><UserDashboard /></DashboardLayout>} />
        <Route path="/user/messages" element={<DashboardLayout role="user"><Messages /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;