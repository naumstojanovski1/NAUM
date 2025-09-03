import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomDetail from "./pages/RoomDetail";
import ContactPage from "./pages/ContactPage";
import Header from "./components/common/Header";
import BackToTop from "./components/common/BackToTop";
import ScrollToTop from "./components/common/ScrollToTop";

import {
  Home,
  Booking,
  PageNotFound,
  Room,
  Gallery,
  Services,
} from "./pages/index";
import Footer from "./components/common/Footer";
export default function App() {
  return (
    <div className="bg-white">
      <Router>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/rooms" element={<Room />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/*" element={<PageNotFound />} />
          <Route path="/services" element={<Services />} />
        </Routes>
        <Footer />
        <BackToTop />
      </Router>
    </div>
  );
}
