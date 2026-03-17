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
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";
const GREEN = "#10b981";
const ORANGE = "#f97316";
const YELLOW = "#eab308";
const PINK = "#ec4899";

const ChartTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", fontSize: 12,
    }}>
      {label && <p style={{ color: "#94a3b8", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.stroke, display: "inline-block" }} />
          <span style={{ color: "#475569" }}>{p.name}: </span>
          <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

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
    } else if (path.startsWith('/admin/newcompany')) {
      setActiveSection('newcompany');
      setCompaniesExpanded(true);
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/expense-inquiries/manageexpense')) {
      setActiveSection('manageexpense');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/expense-inquiries')) {
      setActiveSection('expense-inquiries');
      setCompaniesExpanded(true);
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/settings')) {
      setActiveSection('settings');
    } else if (path.startsWith('/admin/legalentities/expenseanalytics')) {
      setActiveSection('expenseanalytics');
      setActivePage('');
      setActiveInquiry('');
    } else if (path.startsWith('/admin/legalentities')) {
      setActiveSection('legalentities');
    }
  }, [location.pathname]);
  const [logs, setLogs] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [pageView, setPageView] = useState('list');
  const [editMode, setEditMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageData, setPageData] = useState({ title: '', metaDescription: '', status: 'published' });
  const [allPages, setAllPages] = useState([]);
  const [showPageMenu, setShowPageMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openRoles: 0, services: 0, useCases: 0,
    totalVisitors: 0, activeLeads: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '', category: 'AI & Data Science', location: '',
    type: 'Full-Time', description: '', status: 'active',
  });

  // chart data built from stats + logs
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchAllPages();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (activeSection === 'careers') fetchJobs();
  }, [activeSection]);

  const fetchAllPages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pages');
      setAllPages(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [pagesRes, companiesRes, jobAppsRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/pages'),
        axios.get('http://localhost:5000/api/companies'),
        axios.get('http://localhost:5000/api/career/applications'),
        axios.get('http://localhost:5000/api/bookings'),
      ]);

      const pages = await pagesRes.json();
      const companiesCount = companiesRes.data.success ? companiesRes.data.data.length : 0;
      const jobAppsCount = jobAppsRes.data.length || 0;
      const bookings = bookingsRes.data || [];

      let servicesCount = 0, useCasesCount = 0, openRolesCount = 0;
      pages.forEach((page) => {
        if (page.pageName === 'services' && Array.isArray(page.sections?.services?.items))
          servicesCount = page.sections.services.items.length;
        if (page.pageName === 'usecases' && Array.isArray(page.sections?.usecases?.items))
          useCasesCount = page.sections.usecases.items.length;
        if (page.pageName === 'career') {
          const cats = page.sections?.jobCategoriesSection?.jobCategories || [];
          openRolesCount = cats.reduce((a, c) => a + (c.jobs?.length || 0), 0);
        }
      });

      setBookingCount(bookings.length);
      setStats({
        services: servicesCount, useCases: useCasesCount, openRoles: openRolesCount,
        totalVisitors: 0, activeLeads: 0, companiesCount, jobAppsCount,
      });

      /* build 6-month trend from bookings + applications */
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { label: monthNames[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}`, bookings: 0, applications: 0 };
      });
      const toKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}`; };
      bookings.forEach(b => { const m = last6.find(x => x.key === toKey(b.createdAt)); if (m) m.bookings++; });
      jobAppsRes.data.forEach(a => { const m = last6.find(x => x.key === toKey(a.createdAt)); if (m) m.applications++; });
      setTrendData(last6);

    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/logs");
      setLogs(res.data.slice(0, 6));
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await fetch('http://localhost:5000/api/pages/career');
      const data = await response.json();
      const allJobs = [];
      if (data.sections?.jobCategories) {
        data.sections.jobCategories.forEach((category, catIndex) => {
          category.jobs.forEach((job, jobIndex) => {
            allJobs.push({ id: `${catIndex}-${jobIndex}`, categoryIndex: catIndex, jobIndex, ...job, category: category.category, status: 'active' });
          });
        });
      }
      setJobs(allJobs);
    } catch (error) { console.error(error); }
    finally { setJobsLoading(false); }
  };

  const resetJobForm = () => setJobFormData({ title: '', category: 'AI & Data Science', location: '', type: 'Full-Time', description: '', status: 'active' });
  const handleJobInputChange = (e) => { const { name, value } = e.target; setJobFormData(prev => ({ ...prev, [name]: value })); };
  const handlePageSelect = (pageName) => { setActiveSection('pages'); setActivePage(pageName); setPageView('list'); setEditMode(false); setPageData({ title: pageName, metaDescription: '', status: 'published' }); };

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
        crumbs.push({ label: 'Customers', action: () => { navigate('/admin'); setCompaniesExpanded(true); } });
        crumbs.push({ label: 'Expense Management', action: () => navigate('/admin/expense-inquiries') });
        crumbs.push({ label: 'Create Expense', action: null });
      } else if (activeSection === 'settings') {
        crumbs.push({ label: 'Settings', action: null });
      } else if (activeSection === 'logs') {
        crumbs.push({ label: 'All Logs', action: null });
      } else if (location.pathname.includes('expenseanalytics')) {
        crumbs.push({ label: 'Legal Entities', action: () => navigate('/admin/legalentities') });
        crumbs.push({ label: 'Expense Analytics', action: null });
      } else if (activeSection === 'legalentities') {
        crumbs.push({ label: 'Legal Entites', action: null });
      } else if (activeSection === 'newcompany') {
        crumbs.push({ label: 'Customers', action: () => setCompaniesExpanded(true) });
        crumbs.push({ label: 'Company Inquiries', action: null });
      } else if (activeSection === 'expense-inquiries') {
        crumbs.push({ label: 'Customers', action: () => setCompaniesExpanded(true) });
        crumbs.push({ label: 'Expense Management', action: null });
      } else if (activeSection === 'masters') {
        crumbs.push({ label: 'Masters', action: activePage ? () => { navigate('/admin/mainmasters'); setActivePage(''); } : null });
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
      <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={16} className="text-slate-400" />}
            {crumb.action ? (
              <button onClick={crumb.action} className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">{crumb.label}</button>
            ) : (
              <span className={index === breadcrumbs.length - 1 ? 'text-slate-900 font-semibold' : 'text-slate-600'}>{crumb.label}</span>
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
      <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
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
          <h3 className={`text-4xl font-bold bg-linear-to-br ${color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left`}>{value}</h3>
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );

  const tk = { fontSize: 11, fill: "#94a3b8" };

  const OverviewContent = () => {
    /* pie data */
    const contentPie = [
      { name: "Services", value: stats.services, fill: PURPLE },
      { name: "Use Cases", value: stats.useCases, fill: ORANGE },
      { name: "Open Roles", value: stats.openRoles, fill: BLUE },
    ];
    const inquiryBar = [
      { name: "Bookings", value: bookingCount, fill: BLUE },
      { name: "Applications", value: stats.jobAppsCount ?? 0, fill: PURPLE },
      { name: "Companies", value: stats.companiesCount ?? 0, fill: GREEN },
    ];

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text">
              Dashboard Overview
            </h2>
            <p className="text-slate-600 flex items-center gap-2">
              <span>Welcome back! Here's what's happening with SubDuxion</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
            </div>
            <p className="mt-6 text-slate-600 font-medium">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={<Briefcase size={24} />} value={stats.openRoles} label="Open Roles" color="from-blue-500 to-blue-600" delay={0} />
              <StatCard icon={<Wrench size={24} />} value={stats.services} label="Total Services" color="from-purple-500 to-purple-600" delay={100} />
              <StatCard icon={<Building2 size={24} />} value={stats.useCases} label="Total Use Cases" color="from-orange-500 to-orange-600" delay={200} />
              <StatCard icon={<LucidePhoneCall size={24} />} value={bookingCount} label="Call Bookings" color="from-green-500 to-green-600" delay={300} />
              <StatCard icon={<Building2 size={24} />} value={stats.companiesCount ?? 0} label="Registered Companies" color="from-yellow-400 to-yellow-500" delay={400} />
              <StatCard icon={<Users size={24} />} value={stats.jobAppsCount ?? 0} label="Job Applications" color="from-pink-500 to-pink-600" delay={500} />
            </div>

            {/* ── Charts Row 1: Trend + Inquiry Bar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* 6-month trend */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp size={15} style={{ color: BLUE }} />
                  </div>
                  <span className="text-sm font-700 text-slate-800 font-bold">6-Month Activity Trend</span>
                </div>
                <div className="p-4" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 4, right: 12, bottom: 0, left: -16 }}>
                      <defs>
                        <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BLUE} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PURPLE} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={tk} />
                      <YAxis tick={tk} allowDecimals={false} />
                      <Tooltip content={<ChartTT />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="bookings" name="Bookings" stroke={BLUE} strokeWidth={2} fill="url(#gB)" dot={{ r: 3, fill: BLUE }} activeDot={{ r: 5 }} />
                      <Area type="monotone" dataKey="applications" name="Applications" stroke={PURPLE} strokeWidth={2} fill="url(#gA)" dot={{ r: 3, fill: PURPLE }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inquiry bar */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <BarChart3 size={15} style={{ color: PURPLE }} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Inquiry Totals</span>
                </div>
                <div className="p-4" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inquiryBar} margin={{ top: 4, right: 12, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={tk} />
                      <YAxis tick={tk} allowDecimals={false} />
                      <Tooltip content={<ChartTT />} />
                      <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                        {inquiryBar.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── Charts Row 2: Content Pie + Recent Logs ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Content pie */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Wrench size={15} style={{ color: ORANGE }} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Content Distribution</span>
                </div>
                <div className="p-4" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={contentPie} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4} stroke="none">
                        {contentPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<ChartTT />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent logs */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                  <button onClick={() => navigate('/admin/all-logs')} className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {logs.map((log, index) => (
                    <div key={log._id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{log.message}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <Clock size={11} />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium">{log.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

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
        <div className={`max-w-7xl mx-auto ${isCompanyPage ? "" : "p-3"}`}>
          <Breadcrumb />
          {activeSection === 'overview' ? <OverviewContent /> : <Outlet context={{ sidebarCollapsed }} />}
        </div>
      </div>
    </div>
  );
}