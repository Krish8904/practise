import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CallInquiries from '../components/Callinquiries';
import EditCareer from './adminEdit/EditCareer';
import EditHome from './adminEdit/EditHome';
import EditServices from "./adminEdit/EditServices";
import EditCompany from "./adminEdit/EditCompany";
import EditUsecases from './adminEdit/EditUsecases';
import NewSectionEditor from './adminEdit/NewSectionEditor';
import ManageJobs from '../components/ManageJobs';
import ImageManager from './adminEdit/ImageManager';
import { ImagePlus, LucidePhoneCall, PhoneCall, PhoneCallIcon, PhoneIncoming } from 'lucide-react';
import { LayoutDashboard, FileText, Briefcase, Users, TrendingUp, Settings, ChevronDown, ChevronRight, Wrench, Building2, MessageSquare, BarChart3, Bell, Save, Edit, Plus, Edit2, Trash2, X, MapPin, Clock, DollarSign, MoreVertical, Menu, LogOut, User } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [activePage, setActivePage] = useState('');
  const [logs, setLogs] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [pageView, setPageView] = useState('list');
  const [editMode, setEditMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageData, setPageData] = useState({
    title: '',
    metaDescription: '',
    status: 'published'
  });

  const [allPages, setAllPages] = useState([]);
  const [showPageMenu, setShowPageMenu] = useState(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    openRoles: 0,
    services: 0,
    useCases: 0,
    totalVisitors: 0,
    activeLeads: 0
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
    status: 'active'
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

  fetchBookingsCount();

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
              status: 'active'
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
          status: 'active'
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
      status: 'active'
    });
  };

  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    setJobFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddJob = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pages/career/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const newJob = {
        id: `new-${Date.now()}`,
        ...jobFormData,
      };
      setJobs(prev => [...prev, newJob]);
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
      status: job.status
    });
    setShowAddForm(false);
  };

  const handleUpdateJob = async (job) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pages/career/job/${job.categoryIndex}/${job.jobIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobFormData),
      });

      if (response.ok) {
        await fetchJobs();
        setEditingJob(null);
        resetJobForm();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setJobs(prev => prev.map(j =>
        j.id === job.id
          ? { ...j, ...jobFormData }
          : j
      ));
      setEditingJob(null);
      resetJobForm();
    }
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pages/career/job/${job.categoryIndex}/${job.jobIndex}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchJobs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setJobs(prev => prev.filter(j => j.id !== job.id));
    }
  };

  const pageComponentMap = {
    home: (props) => <EditHome {...props} onNavigate={setPageView} />,
    services: (props) => <EditServices {...props} onNavigate={setPageView} />,
    company: (props) => <EditCompany {...props} onNavigate={setPageView} />,
    career: (props) => <EditCareer {...props} onNavigate={setPageView} />,
    usecases: (props) => <EditUsecases {...props} onNavigate={setPageView} />,
  };

  const handlePageSelect = (pageName) => {
    setActiveSection('pages');
    setActivePage(pageName);
    setPageView('list');
    setEditMode(false);
    setPageData({
      title: pageName,
      metaDescription: '',
      status: 'published'
    });
  };

  const Sidebar = () => (
    <div 
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen flex flex-col transition-all duration-300 ease-in-out border-r  border-slate-700/50 backdrop-blur-xl relative overflow-hidden`}
    >
      {/* Animated background linear */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-50"></div>
      
      {/* Header */}
      <div className="relative p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-1">
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SubDuxion
              </h1>
              <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110"
          >
            <Menu size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative">
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Overview"
          active={activeSection === 'overview'}
          collapsed={sidebarCollapsed}
          onClick={() => setActiveSection('overview')}
        />

        <div className="relative">
          <NavItem
            icon={<FileText size={20} />}
            label="Pages"
            collapsed={sidebarCollapsed}
            onClick={() => setPagesExpanded(!pagesExpanded)}
            hasSubmenu
            submenuExpanded={pagesExpanded}
          />

          {pagesExpanded && !sidebarCollapsed && (
            <div className="ml-4 mt-1 space-y-1 animate-slide-down">
              {allPages.map((page) => (
                <button
                  key={page._id}
                  onClick={() => handlePageSelect(page.pageName)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${
                    activePage === page.pageName
                      ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                  <span className="capitalize">{page.pageName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <NavItem
          icon={<MessageSquare size={20} />}
          label="Inquiries"
          active={activeSection === 'inquiries'}
          collapsed={sidebarCollapsed}
          onClick={() => setActiveSection('inquiries')}
        />

        <NavItem
          icon={<BarChart3 size={20} />}
          label="Analytics"
          active={activeSection === 'analytics'}
          collapsed={sidebarCollapsed}
          onClick={() => setActiveSection('analytics')}
        />

        <NavItem
          icon={<Briefcase size={20} />}
          label="Career Openings"
          active={activeSection === 'careers'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate("/admin/manage-jobs")}
          className="cursor-pointer"
        />

        <NavItem
          icon={<ImagePlus size={20} />}
          label="Manage Media"
          active={activeSection === 'manage'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/manage-media')}
        />

        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={activeSection === 'settings'}
          collapsed={sidebarCollapsed}
          onClick={() => setActiveSection('settings')}
        />
      </nav>

      {/* User Profile */}
      <div className="relative p-4 border-t border-slate-700/50">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-200  group">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-semibold shadow-lg">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@example.com</p>
            </div>
            
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-semibold shadow-lg cursor-pointer hover:scale-110 transition-transform">
              A
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const NavItem = ({ icon, label, active, collapsed, onClick, hasSubmenu, submenuExpanded }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 group relative ${
        active
          ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-[1.01]'
      }`}
    >
      <div className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
        {icon}
      </div>
      {!collapsed && (
        <>
          <span className="flex-1 text-left font-medium">{label}</span>
          {hasSubmenu && (
            <div className={`transition-transform duration-200 ${submenuExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} />
            </div>
          )}
        </>
      )}
      
    </button>
  );

  const StatCard = ({ icon, value, label, color, delay }) => (
    <div 
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated linear background */}
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

      {/* Hover effect line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-2 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text ">
            Dashboard Overview
          </h2>
          <p className="text-slate-600 flex items-center gap-2">
            <span>Welcome back! Here's what's happening with SubDuxion</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Briefcase size={24} />}
              value={stats.openRoles}
              label="Open Roles"
              color="from-blue-500 to-blue-600"
              delay={0}
            />
            <StatCard
              icon={<Wrench size={24} />}
              value={stats.services}
              label="Total Services"
              color="from-purple-500 to-purple-600"
              delay={100}
            />
            <StatCard
              icon={<Building2 size={24} />}
              value={stats.useCases}
              label="Total Use Cases"
              color="from-orange-500 to-orange-600"
              delay={200}
            />
            <StatCard
              icon={<LucidePhoneCall size={24} />}
              value={bookingCount}
              label="Call Bookings"
              color="from-green-500 to-green-600"
              delay={300}
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                <button className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {logs.map((log, index) => (
                <div 
                  key={log._id} 
                  className="p-6 hover:bg-slate-50 transition-all duration-200 group cursor-pointer animate-slide-in-left"
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

  const PageContent = () => {
    const PresetComponent = pageComponentMap[activePage];

    if (PresetComponent) {
      return PresetComponent({ pageTitle: activePage });
    }

    if (activePage) {
      return (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="text-blue-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Dynamic Page Editor</h3>
            <p className="text-slate-600">Editing: <span className="font-semibold text-blue-600 capitalize">{activePage}</span></p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FileText className="text-slate-400" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Select a Page</h3>
          <p className="text-slate-600">Choose a page from the sidebar to start editing</p>
        </div>
      </div>
    );
  };

  const CareersContent = () => {
    const JobForm = ({ isEditing = false, job = null }) => (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {isEditing ? 'Edit Job Opening' : 'Add New Job Opening'}
            </h3>
            <p className="text-sm text-slate-600">Fill in the details below</p>
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                setEditingJob(null);
              } else {
                setShowAddForm(false);
              }
              resetJobForm();
            }}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Job Title *</label>
              <input
                type="text"
                name="title"
                value={jobFormData.title}
                onChange={handleJobInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                placeholder="e.g., AI Consultant"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Category *</label>
              <select
                name="category"
                value={jobFormData.category}
                onChange={handleJobInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              >
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Business Strategy">Business Strategy</option>
                <option value="Engineering & Development">Engineering & Development</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Location *</label>
              <input
                type="text"
                name="location"
                value={jobFormData.location}
                onChange={handleJobInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                placeholder="e.g., Remote / EU"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Employment Type *</label>
              <select
                name="type"
                value={jobFormData.type}
                onChange={handleJobInputChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Job Description *</label>
            <textarea
              name="description"
              value={jobFormData.description}
              onChange={handleJobInputChange}
              rows="5"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none"
              placeholder="Describe the role and responsibilities..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                if (isEditing) {
                  setEditingJob(null);
                } else {
                  setShowAddForm(false);
                }
                resetJobForm();
              }}
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => isEditing ? handleUpdateJob(job) : handleAddJob()}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 font-medium hover:scale-105"
            >
              <Save size={18} />
              {isEditing ? 'Update Job' : 'Add Job'}
            </button>
          </div>
        </div>
      </div>
    );

    if (jobsLoading) {
      return (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading career openings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text">
              Career Openings
            </h2>
            <p className="text-slate-600">Manage job postings displayed on your careers page</p>
          </div>
          {!showAddForm && !editingJob && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 font-medium hover:scale-105"
            >
              <Plus size={20} />
              Add New Opening
            </button>
          )}
        </div>

        {showAddForm && <JobForm />}
        {editingJob && <JobForm isEditing={true} job={jobs.find(j => j.id === editingJob)} />}

        {jobs.length === 0 && !showAddForm ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-blue-600" size={40} />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">No Job Openings</h4>
              <p className="text-slate-600 mb-6">Start by adding your first career opening</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 inline-flex items-center gap-2 font-medium hover:scale-105"
              >
                <Plus size={20} />
                Add Opening
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 animate-slide-in-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h4>
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                        {job.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                        <MapPin size={16} className="text-slate-400" />
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                        <Clock size={16} className="text-slate-400" />
                        <span className="font-medium">{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{job.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent />;
      case 'pages':
        return <PageContent />;
      case 'careers':
        return <CareersContent />;
      case 'inquiries':
        return <CallInquiries />;
      case 'analytics':
        return (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-4xl font-bold text-slate-900 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text ">
              Website Analytics
            </h2>
            <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="text-blue-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Analytics Dashboard</h3>
                <p className="text-slate-600">View detailed analytics and insights</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-4xl font-bold text-slate-900 bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text ">
              Settings
            </h2>
            <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Settings className="text-blue-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Settings</h3>
                <p className="text-slate-600">Configure your dashboard preferences</p>
              </div>
            </div>
          </div>
        );
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30" onClick={() => setShowPageMenu(null)}>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
          animation-fill-mode: both;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
      
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-400 mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}