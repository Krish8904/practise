import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DynamicPage from "./components/DynamicPage";
import Home from "./pages/Home";
import Career from "./pages/Career";
import Company from "./pages/Company";
import Services from "./pages/Services";
import Usecases from "./pages/Usecases";
import Touch from "./pages/Touch";
import Call from "./pages/contact/Call";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EditServices from "./pages/adminEdit/EditServices";
import EditCompany from "./pages/adminEdit/EditCompany";
import EditCareer from "./pages/adminEdit/EditCareer";
import EditHome from "./pages/adminEdit/EditHome";
import AddSection from "./components/AddSection";
import NewSectionEditor from "./pages/adminEdit/NewSectionEditor";

function App() {
  const location = useLocation();

  // Routes where we hide Header/Footer
  const hideHeaderFooterRoutes = ["/admin", "/adminlogin", "/admin/home", "/admin/company", "/admin/services/edit", "/admin/career"];

  const hideHeaderFooter = hideHeaderFooterRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/career" element={<Career />} />
        <Route path="/company" element={<Company />} />
        <Route path="/services" element={<Services />} />
        <Route path="/usecases" element={<Usecases />} />
        <Route path="/contact" element={<Touch />} />
        <Route path="/call" element={<Call />} />

        {/* Admin */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/createcareer" element={<AddSection />} />
        <Route path="/admin/newsection" element={<NewSectionEditor />} />

        {/* Dynamic edit pages */}
        <Route path="/admin/home" element={<EditHome />} />
        <Route path="/admin/services/edit" element={<EditServices />} />
        <Route path="/admin/company" element={<EditCompany />} />
        <Route path="/admin/career" element={<EditCareer />} />
        <Route path="/page/:pageName" element={<DynamicPage />} />

      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;
