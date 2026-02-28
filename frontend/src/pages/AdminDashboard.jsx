import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import axios from 'axios';
import CallInquiries from '../inquiries/Callinquiries';
import ContactInquiries from '../inquiries/ContactInquiries';
import JobInquiries from '../inquiries/JobInquiries';
import EditCareer from './adminEdit/EditCareer';
import EditHome from './adminEdit/EditHome';
import EditServices from "./adminEdit/EditService";
import EditCompany from "./adminEdit/EditCompany";
import EditUsecases from './adminEdit/EditUsecases';
import ManageJobs from '../components/ManageJobs';
import ImageManager from './adminEdit/ImageManager';
import AllLogs from '../components/AllLogs';
import ExpenseForm from './adminEdit/ExpenseForm';
import Sidebar from './Sidebar';
import { Target } from 'lucide-react';
import { ImagePlus, LucidePhoneCall } from 'lucide-react';
import {
  LayoutDashboard, FileText, Briefcase, Users, TrendingUp, Settings,
  ChevronDown, ChevronRight, Wrench, Building2, MessageSquare, BarChart3,
  Bell, Save, Edit, Plus, Edit2, Trash2, X, MapPin, Clock, DollarSign,
  MoreVertical, Menu, LogOut, User,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCompanyPage = location.pathname.includes("company-inquiries");

  const [activeSection, setActiveSection] = useState('overview');
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [inquiriesExpanded, setInquiriesExpanded] = useState(false);
  const [activePage, setActivePage] = useState('');
  const [activeInquiry, setActiveInquiry] = useState('');
  const [mastersExpanded, setMastersExpanded] = useState(false);
  const [companiesExpanded, setCompaniesExpanded] = useState(false);

  // Sync URL with active section
  useEffect(() => {
    const path = location.pathname;

    if (path === '/admin' || path === '/admin/') {
      setActiveSection('overview');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/manage-jobs')) {
      setActiveSection('manage-jobs');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/manage-media')) {
      setActiveSection('manage-media');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/inquiries/call')) {
      setActiveSection('inquiries');
      setActiveInquiry('call');
      setInquiriesExpanded(true);
      setActivePage('');
    } else if (path.startsWith('/admin/inquiries/contact')) {
      setActiveSection('inquiries');
      setActiveInquiry('contact');
      setInquiriesExpanded(true);
      setActivePage('');
    } else if (path.startsWith('/admin/inquiries/job')) {
      setActiveSection('inquiries');
      setActiveInquiry('job');
      setInquiriesExpanded(true);
      setActivePage('');
    } else if (path.startsWith('/admin/all-logs')) {
      setActiveSection('logs');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/home')) {
      setActiveSection('pages');
      setActivePage('home');
      setPagesExpanded(true);
      setActiveInquiry('');
    } else if (path.startsWith('/admin/services')) {
      setActiveSection('pages');
      setActivePage('services');
      setPagesExpanded(true);
      setActiveInquiry('');
    } else if (path.startsWith('/admin/company')) {
      setActiveSection('pages');
      setActivePage('company');
      setPagesExpanded(true);
      setActiveInquiry('');
    } else if (path.startsWith('/admin/career')) {
      setActiveSection('pages');
      setActivePage('career');
      setPagesExpanded(true);
      setActiveInquiry('');
    } else if (path.startsWith('/admin/usecases')) {
      setActiveSection('pages');
      setActivePage('usecases');
      setPagesExpanded(true);
      setActiveInquiry('');
    } else if (path.startsWith('/admin/analytics')) {
      setActiveSection('analytics');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/mainmasters/channel')) {
      setActiveSection('masters');
      setActivePage('channel');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters/natureofbusiness')) {
      setActiveSection('masters');
      setActivePage('natureofbusiness');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters/category')) {
      setActiveSection('masters');
      setActivePage('category');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters/subcategory')) {
      setActiveSection('masters');
      setActivePage('subcategory');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters/types')) {
      setActiveSection('masters');
      setActivePage('types');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters/country')) {
      setActiveSection('masters');
      setActivePage('country');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters/currency')) {
      setActiveSection('masters');
      setActivePage('currency');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/mainmasters')) {
      setActiveSection('masters');
      setActivePage('');
      setMastersExpanded(true);
    } else if (path.startsWith('/admin/manageexpense')) {
      setActiveSection('manageexpense');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/newcompany')) {
      setActiveSection('newcompany');
      setCompaniesExpanded(true);
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/expense-inquiries')) {
      setActiveSection('expense-inquiries');
      setCompaniesExpanded(true);
      setActivePage('');
      setActiveInquiry('');
    }
  }, [location.pathname]);

  const [logs, setLogs] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [pageView, setPageView] = useState('list');
  const [editMode, setEditMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageData, setPageData] = useState({
    title: '',
    metaDescription: '',
    status: 'published',
  });

  const [allPages, setAllPages] = useState([]);
  const [showPageMenu, setShowPageMenu] = useState(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openRoles: 0,
    services: 0,
    useCases: 0,
    totalVisitors: 0,
    activeLeads: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    category: 'AI & Data Science',
    location: '',
    type: 'Full-Time',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    fetchStats();
    fetchAllPages();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (activeSection === 'careers') {
      fetchJobs();
    }
  }, [activeSection]);

  const fetchAllPages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pages');
      setAllPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/pages');
      const pages = await response.json();

      let servicesCount = 0;
      let useCasesCount = 0;
      let openRolesCount = 0;

      pages.forEach((page) => {
        if (page.pageName === 'services' && Array.isArray(page.sections?.services?.items)) {
          servicesCount = page.sections.services.items.length;
        }
        if (page.pageName === 'usecases' && Array.isArray(page.sections?.usecases?.items)) {
          useCasesCount = page.sections.usecases.items.length;
        }
        if (page.pageName === 'career') {
          const jobCategories = page.sections?.jobCategoriesSection?.jobCategories || [];
          openRolesCount = jobCategories.reduce((acc, cat) => acc + (cat.jobs?.length || 0), 0);
        }
      });

      setStats({
        services: servicesCount,
        useCases: useCasesCount,
        openRoles: openRolesCount,
        totalVisitors: 0,
        activeLeads: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookingCount(res.data.length);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookingsCount();
  }, []);

  const addLogToUI = (newLog) => {
    setLogs((prev) => [newLog, ...prev.slice(0, 5)]);
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/logs");
      setLogs(res.data.slice(0, 6));
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await fetch('http://localhost:5000/api/pages/career');
      const data = await response.json();

      const allJobs = [];
      if (data.sections && data.sections.jobCategories) {
        data.sections.jobCategories.forEach((category, catIndex) => {
          category.jobs.forEach((job, jobIndex) => {
            allJobs.push({
              id: `${catIndex}-${jobIndex}`,
              categoryIndex: catIndex,
              jobIndex: jobIndex,
              title: job.title,
              category: category.category,
              location: job.location,
              type: job.type,
              description: job.description,
              status: 'active',
            });
          });
        });
      }
      setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([
        {
          id: '0-0',
          categoryIndex: 0,
          jobIndex: 0,
          title: 'AI Consultant',
          category: 'AI & Data Science',
          location: 'Remote / EU',
          type: 'Full-Time',
          description: 'Guide clients in implementing AI solutions, from strategy to deployment, ensuring measurable business impact.',
          status: 'active',
        },
      ]);
    } finally {
      setJobsLoading(false);
    }
  };

  const resetJobForm = () => {
    setJobFormData({
      title: '',
      category: 'AI & Data Science',
      location: '',
      type: 'Full-Time',
      description: '',
      status: 'active',
    });
  };

  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    setJobFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddJob = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pages/career/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobFormData),
      });
      if (response.ok) {
        await fetchJobs();
        resetJobForm();
        setShowAddForm(false);
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding job:', error);
      const newJob = { id: `new-${Date.now()}`, ...jobFormData };
      setJobs((prev) => [...prev, newJob]);
      resetJobForm();
      setShowAddForm(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job.id);
    setJobFormData({
      title: job.title,
      category: job.category,
      location: job.location,
      type: job.type,
      description: job.description,
      status: job.status,
    });
    setShowAddForm(false);
  };

  const handleUpdateJob = async (job) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/career/job/${job.categoryIndex}/${job.jobIndex}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobFormData),
        }
      );
      if (response.ok) {
        await fetchJobs();
        setEditingJob(null);
        resetJobForm();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, ...jobFormData } : j)));
      setEditingJob(null);
      resetJobForm();
    }
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/pages/career/job/${job.categoryIndex}/${job.jobIndex}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        await fetchJobs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    }
  };

  const handlePageSelect = (pageName) => {
    setActiveSection('pages');
    setActivePage(pageName);
    setPageView('list');
    setEditMode(false);
    setPageData({ title: pageName, metaDescription: '', status: 'published' });
  };

  // Breadcrumb component
  const Breadcrumb = () => {
    const getBreadcrumbs = () => {
      const crumbs = [{ label: 'Admin', action: () => navigate('/admin') }];

      if (activeSection === 'overview') {
        crumbs.push({ label: 'Overview', action: null });
      } else if (activeSection === 'pages' && activePage) {
        crumbs.push({ label: 'Pages', action: () => { navigate('/admin'); setPagesExpanded(true); } });
        crumbs.push({ label: activePage.charAt(0).toUpperCase() + activePage.slice(1), action: null });
        if (editMode) crumbs.push({ label: 'Edit Section', action: null });
      } else if (activeSection === 'inquiries') {
        crumbs.push({ label: 'Inquiries', action: () => { navigate('/admin'); setInquiriesExpanded(true); } });
        if (activeInquiry === 'call') crumbs.push({ label: 'Call Inquiries', action: null });
        else if (activeInquiry === 'contact') crumbs.push({ label: 'General Inquiries', action: null });
        else if (activeInquiry === 'job') crumbs.push({ label: 'Job Applications', action: null });
      } else if (activeSection === 'manage-jobs') {
        crumbs.push({ label: 'Career Openings', action: null });
      } else if (activeSection === 'manage-media') {
        crumbs.push({ label: 'Manage Media', action: null });
      } else if (activeSection === 'careers') {
        crumbs.push({ label: 'Career Openings', action: () => { setShowAddForm(false); setEditingJob(null); } });
        if (showAddForm) crumbs.push({ label: 'Add New Opening', action: null });
        else if (editingJob) crumbs.push({ label: 'Edit Opening', action: null });
      } else if (activeSection === 'analytics') {
        crumbs.push({ label: 'Analytics', action: null });
      } else if (activeSection === 'manageexpense') {
        crumbs.push({ label: 'Expense Management', action: null });
      } else if (activeSection === 'settings') {
        crumbs.push({ label: 'Settings', action: null });
      } else if (activeSection === 'logs') {
        crumbs.push({ label: 'All Logs', action: null });
      } else if (activeSection === 'newcompany') {
        crumbs.push({ label: 'Companies', action: () => setCompaniesExpanded(true) });
        crumbs.push({ label: 'Company Inquiries', action: null });
      } else if (activeSection === 'expense-inquiries') {
        crumbs.push({ label: 'Companies', action: () => setCompaniesExpanded(true) });
        crumbs.push({ label: 'Expense Management', action: null });
      } else if (activeSection === 'masters') {
        crumbs.push({
          label: 'Masters',
          action: activePage ? () => { navigate('/admin/mainmasters'); setActivePage(''); } : null,
        });
        if (activePage === 'natureofbusiness') crumbs.push({ label: 'Nature of Business', action: null });
        else if (activePage === 'channel') crumbs.push({ label: 'Channel', action: null });
        else if (activePage === 'category') crumbs.push({ label: 'Category', action: null });
        else if (activePage === 'subcategory') crumbs.push({ label: 'Subcategory', action: null });
        else if (activePage === 'types') crumbs.push({ label: 'Types', action: null });
        else if (activePage === 'country') crumbs.push({ label: 'Country', action: null });
        else if (activePage === 'currency') crumbs.push({ label: 'Currency', action: null });
      }

      return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={16} className="text-slate-400" />}
            {crumb.action ? (
              <button
                onClick={crumb.action}
                className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {crumb.label}
              </button>
            ) : (
              <span className={index === breadcrumbs.length - 1 ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const StatCard = ({ icon, value, label, color, delay }) => (
    <div
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 bg-linear-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
            <div className="text-white">{icon}</div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <TrendingUp size={18} className="text-green-500" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className={`text-4xl font-bold bg-linear-to-br ${color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left`}>
            {value}
          </h3>
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-2 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text">
            Dashboard Overview
          </h2>
          <p className="text-slate-600 flex items-center gap-2">
            <span>Welcome back! Here's what's happening with SubDuxion</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Briefcase size={24} />} value={stats.openRoles} label="Open Roles" color="from-blue-500 to-blue-600" delay={0} />
            <StatCard icon={<Wrench size={24} />} value={stats.services} label="Total Services" color="from-purple-500 to-purple-600" delay={100} />
            <StatCard icon={<Building2 size={24} />} value={stats.useCases} label="Total Use Cases" color="from-orange-500 to-orange-600" delay={200} />
            <StatCard icon={<LucidePhoneCall size={24} />} value={bookingCount} label="Call Bookings" color="from-green-500 to-green-600" delay={300} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                <button
                  onClick={() => navigate('/admin/all-logs')}
                  className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {logs.map((log, index) => (
                <div
                  key={log._id}
                  className="p-6 hover:bg-slate-50 transition-all duration-200 group animate-slide-in-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      {index < logs.length - 1 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-linear-to-b from-slate-200 to-transparent"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {log.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                          {log.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30" onClick={() => setShowPageMenu(null)}>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; animation-fill-mode: both; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.5s ease-out; animation-fill-mode: both; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeSection={activeSection}
        activePage={activePage}
        activeInquiry={activeInquiry}
        pagesExpanded={pagesExpanded}
        setPagesExpanded={setPagesExpanded}
        inquiriesExpanded={inquiriesExpanded}
        setInquiriesExpanded={setInquiriesExpanded}
        mastersExpanded={mastersExpanded}
        setMastersExpanded={setMastersExpanded}
        companiesExpanded={companiesExpanded}
        setCompaniesExpanded={setCompaniesExpanded}
        allPages={allPages}
      />

      <div className="flex-1 overflow-auto">
        <div className={`p-7 max-w-7xl mx-auto ${isCompanyPage ? "" : "p-8"}`}>
          <Breadcrumb />
          {activeSection === 'overview' ? (
            <OverviewContent />
          ) : (
            <Outlet context={{ sidebarCollapsed }} />
          )}
        </div>
      </div>
    </div>
  );
}