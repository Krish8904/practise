import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
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
import EditService from "./pages/adminEdit/EditService";
import EditCompany from "./pages/adminEdit/EditCompany";
import EditCareer from "./pages/adminEdit/EditCareer";
import EditHome from "./pages/adminEdit/EditHome";
import EditUsecases from "./pages/adminEdit/EditUsecases";
import AddSection from "./components/AddSection";
import NewSectionEditor from "./pages/adminEdit/NewSectionEditor";
import ManageJobs from "./components/ManageJobs";
import Logs from "./components/Logs";
import ImageManager from "./pages/adminEdit/ImageManager";
import CallInquiries from "./inquiries/CallInquiries";
import ContactInquiries from "./inquiries/ContactInquiries";
import JobInquiries from "./inquiries/JobInquiries";
import Apply from "./pages/Apply";
import ServicesEditCustomSection from "./core/service/ServicesEditCustomSection";
import ServicesNewSection from "./core/service/ServicesNewSection";
import CompanyForm from "./pages/CompanyForm";
import AllLogs from "./components/AllLogs";
import CompanyInquiries from "./inquiries/CompanyInquiries";
import Analytics from "./pages/adminEdit/Analytics";
import ServicesForm from "./components/ServicesForm";

/* ---------- Masters ---------- */
import AdminNatureOfBusiness from "./mastersPages/AdminNatureOfBusiness";
import Channel from "./mastersPages/Channel";
import Category from "./mastersPages/Category";
import Subcategory from "./mastersPages/Subcategory";
import Types from "./mastersPages/Types";
import ExpenseForm from "./pages/adminEdit/ExpenseForm";
import ExpenseInquiries from "./inquiries/ExpenseInquiries";
import Country from "./mastersPages/Country";
import ExpenseCurrency from "./mastersPages/Currency";
import MastersPage from "./mastersPages/MasterPage";
import Settings from "./pages/Settings";
import LegalEntities from "./pages/LegalEntities";
import ExpenseAnalytics from "./components/ExpenseAnalytics";

function App() {
  const location = useLocation();

  // Routes where we hide Header/Footer
  const hideHeaderFooterRoutes = ["/admin", "/adminlogin"];

  const hideHeaderFooter = hideHeaderFooterRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    if (hideHeaderFooter) return;

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      // ✅ Don't intercept scroll events inside the Botpress widget
      prevent: (node) => {
        return (
          node.id === "bp-web-widget-container" ||
          node.id === "botpress-webchat" ||
          node.closest?.("#bp-web-widget-container") !== null ||
          node.closest?.("#botpress-webchat") !== null
        );
      },
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [hideHeaderFooter]);

  return (
    <>
      {!hideHeaderFooter && <Header />}

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/career" element={<Career />} />
        <Route path="/career/applyforjobs" element={<Apply />} />
        <Route path="/company" element={<Company />} />
        <Route path="/services" element={<Services />} />
        <Route path="/usecases" element={<Usecases />} />
        <Route path="/contact" element={<Touch />} />
        <Route path="/call" element={<Call />} />
        <Route path="/companyform" element={<CompanyForm />} />
        <Route path="services/servicesform" element={<ServicesForm />} />

        {/* Admin Login */}
        <Route path="/adminlogin" element={<AdminLogin />} />

        {/* Admin Dashboard */}
        <Route path="/admin/*" element={<AdminDashboard />}>

          <Route index element={<div>Overview</div>} />

          {/* Page Edit Routes */}
          <Route path="home" element={<EditHome />} />
          <Route path="home/edit/:id" element={<NewSectionEditor />} />
          <Route path="services" element={<EditService />} />
          <Route path="services/new" element={<ServicesNewSection />} />
          <Route path="services/edit/core/:id" element={<EditService />} />
          <Route path="services/edit/custom/:id" element={<ServicesEditCustomSection />} />
          <Route path="company" element={<EditCompany />} />
          <Route path="company/edit/:id" element={<NewSectionEditor />} />
          <Route path="usecases" element={<EditUsecases />} />
          <Route path="usecases/edit/:id" element={<NewSectionEditor />} />
          <Route path="career" element={<EditCareer />} />
          <Route path="career/edit/:id" element={<NewSectionEditor />} />

          {/* Other Admin Sections */}
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="manage-media" element={<ImageManager />} />
          <Route path="inquiries/call" element={<CallInquiries />} />
          <Route path="inquiries/contact" element={<ContactInquiries />} />
          <Route path="inquiries/job" element={<JobInquiries />} />
          <Route path="expense-inquiries" element={<ExpenseInquiries />} />
          <Route path="settings" element={<Settings />} />
          <Route path="legalentities" element={<LegalEntities />} />
          <Route path="logs" element={<Logs />} />
          <Route path="createcareer" element={<AddSection />} />
          <Route path="newsection" element={<NewSectionEditor />} />
          <Route path="all-logs" element={<AllLogs />} />
          <Route path="newcompany" element={<CompanyInquiries />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="expense-inquiries/manageexpense" element={<ExpenseForm />} />
          <Route path="legalentities/expenseanalytics" element={<ExpenseAnalytics />} />

          {/* Masters */}
          <Route path="mainmasters" element={<MastersPage />} />
          <Route path="mainmasters/natureofbusiness" element={<AdminNatureOfBusiness />} />
          <Route path="mainmasters/channel" element={<Channel />} />
          <Route path="mainmasters/category" element={<Category />} />
          <Route path="mainmasters/subcategory" element={<Subcategory />} />
          <Route path="mainmasters/types" element={<Types />} />
          <Route path="mainmasters/country" element={<Country />} />
          <Route path="mainmasters/currency" element={<ExpenseCurrency />} />

        </Route>

        {/* Dynamic pages */}
        <Route path="/page/:pageName" element={<DynamicPage />} />

      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;