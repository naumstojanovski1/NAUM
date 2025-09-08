import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomDetail from "./pages/RoomDetail";
import AdminLogin from "./pages/AdminLogin";
import UnsubscribePage from "./pages/UnsubscribePage";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import Header from "./components/common/Header";
import BackToTop from "./components/common/BackToTop";
import ScrollToTop from "./components/common/ScrollToTop";
import { NotificationProvider } from "./components/common/NotificationProvider";

import {
  Home,
  Booking,
  PageNotFound,
  Room,
  Gallery,
  Services,
  AdminDashboard,
  Contact,
} from "./pages/index";
import Footer from "./components/common/Footer";
export default function App() {
  return (
    <NotificationProvider>
      <div className="bg-white">
        <Router>
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/rooms" element={<Room />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            <Route path="/*" element={<PageNotFound />} />
            <Route path="/services" element={<Services />} />
          </Routes>
          <Footer />
          <BackToTop />
        </Router>
      </div>
    </NotificationProvider>
  );
}
