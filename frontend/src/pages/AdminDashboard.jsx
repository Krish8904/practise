import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CallInquiries from '../components/Callinquiries';
import EditCareer from './adminEdit/EditCareer';
import EditHome from './adminEdit/EditHome';
import EditServices from "./adminEdit/EditServices";
import EditCompany from "./adminEdit/EditCompany";
import EditUsecases from './adminEdit/EditUsecases';
import NewSectionEditor from './adminEdit/NewSectionEditor';
import ImageManager from './adminEdit/ImageManger';

import { LayoutDashboard, FileText, Briefcase, Users, TrendingUp, Settings, ChevronDown, ChevronRight, Wrench, Building2, MessageSquare, BarChart3, Bell, Save, Edit, Plus, Edit2, Trash2, X, MapPin, Clock, DollarSign, MoreVertical } from 'lucide-react';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [pagesExpanded, setPagesExpanded] = useState(false);
  const [activePage, setActivePage] = useState('');
  const [logs, setLogs] = useState([]);
  const [pageView, setPageView] = useState('list'); // 'list', 'edit-section', 'add-section'
  const [editMode, setEditMode] = useState(false);
  const [pageData, setPageData] = useState({
    title: '',
    metaDescription: '',
    status: 'published'
  });

  // NEW: State for all pages from database
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

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Career management state
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

  // NEW: Fetch all pages from database
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
        // Services
        if (page.pageName === 'services' && Array.isArray(page.sections?.services?.items)) {
          servicesCount = page.sections.services.items.length;
        }

        // Use Cases
        if (
          page.pageName === 'usecases' &&
          Array.isArray(page.sections?.usecases?.items)
        ) {
          useCasesCount = page.sections.usecases.items.length;
        }

        // Career Jobs
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

  const addLogToUI = (newLog) => {
    setLogs((prev) => [newLog, ...prev.slice(0, 5)]);
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/logs");
      setLogs(res.data.slice(0, 6)); // latest 6 logs
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

  // Updated: Include predefined pages and dynamic pages with navigation handler
  const pageComponentMap = {
    home: (props) => <EditHome {...props} onNavigate={setPageView} />,
    services: (props) => <EditServices {...props} onNavigate={setPageView} />,
    company: (props) => <EditCompany {...props} onNavigate={setPageView} />,
    career: (props) => <EditCareer {...props} onNavigate={setPageView} />,
    usecases: (props) => <EditUsecases {...props} onNavigate={setPageView} />,
  };

  // Handle page selection
  const handlePageSelect = (pageName) => {
    setActiveSection('pages');
    setActivePage(pageName);
    setPageView('list'); // Reset to list view when selecting a new page
    setEditMode(false);
    setPageData({
      title: pageName,
      metaDescription: '',
      status: 'published'
    });
  };

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-white h-screen p-4 flex flex-col overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">SubDuxion</h1>
        <p className="text-xs text-slate-400">Admin Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1">
        <button
          onClick={() => setActiveSection('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-colors ${activeSection === 'overview' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </button>

        <div>
          <button
            onClick={() => setPagesExpanded(!pagesExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} />
              <span>Pages</span>
            </div>
            {pagesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {pagesExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {allPages.map((page) => (
                <div
                  key={page._id}
                  className={`flex items-center justify-between group px-4 py-2 rounded-lg text-sm transition-colors ${activePage === page.pageName ? 'bg-slate-700' : 'hover:bg-slate-800'
                    }`}
                >
                  <button
                    onClick={() => handlePageSelect(page.pageName)}
                    className="flex-1 text-left cursor-pointer capitalize"
                  >
                    {page.pageName}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setActiveSection('inquiries')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeSection === 'inquiries' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
        >
          <MessageSquare size={20} />
          <span>Inquiries</span>
        </button>

        <button
          onClick={() => setActiveSection('analytics')}
          className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'analytics' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
        >
          <BarChart3 size={20} />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveSection('careers')}
          className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === 'careers' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
        >
          <Briefcase size={20} />
          <span>Career Openings</span>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeSection === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={() => setActiveSection('manage')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeSection === 'manage' ? 'bg-blue-600' : 'hover:bg-slate-800'

            }`}
        >
          <Settings size={20} />
          <span>Manage </span>
        </button>
      </nav>

      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
            A
          </div>
          <div className="text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">Welcome back! Here's what's happening with SubDuxion.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-slate-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stats.openRoles}</h3>
              <p className="text-sm text-slate-600">Open Roles</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wrench className="text-purple-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stats.services}</h3>
              <p className="text-sm text-slate-600">Total Services</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="text-orange-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stats.useCases}</h3>
              <p className="text-sm text-slate-600">Use Cases</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-green-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{allPages.length}</h3>
              <p className="text-sm text-slate-600">Total Pages</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>

            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log._id} className="flex items-start gap-4 pb-4 border-b border-slate-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{log.message}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()} • {log.type}
                    </p>
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
    // Check if it's a predefined page with custom component
    const PresetComponent = pageComponentMap[activePage];

    if (PresetComponent) {
      return PresetComponent({ pageTitle: activePage });
    }

    // Otherwise use the dynamic page editor
    if (activePage) {
      return <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
        <FileText className="mx-auto mb-4 text-slate-400" size={48} />
        <p className="text-slate-600">Dynamic page editor for: {activePage}</p>
      </div>;
    }

    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
        <FileText className="mx-auto mb-4 text-slate-400" size={48} />
        <p className="text-slate-600">Select a page from the sidebar to edit</p>
      </div>
    );
  };

  const CareersContent = () => {
    const JobForm = ({ isEditing = false, job = null }) => (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-800">
            {isEditing ? 'Edit Job Opening' : 'Add New Job Opening'}
          </h3>
          <button
            onClick={() => {
              if (isEditing) {
                setEditingJob(null);
              } else {
                setShowAddForm(false);
              }
              resetJobForm();
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={jobFormData.title}
              onChange={handleJobInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AI Consultant"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
            <select
              name="category"
              value={jobFormData.category}
              onChange={handleJobInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="AI & Data Science">AI & Data Science</option>
              <option value="Business Strategy">Business Strategy</option>
              <option value="Engineering & Development">Engineering & Development</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={jobFormData.location}
              onChange={handleJobInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Remote / EU"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Employment Type *</label>
            <select
              name="type"
              value={jobFormData.type}
              onChange={handleJobInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Job Description *</label>
          <textarea
            name="description"
            value={jobFormData.description}
            onChange={handleJobInputChange}
            rows="4"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the role..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              if (isEditing) {
                setEditingJob(null);
              } else {
                setShowAddForm(false);
              }
              resetJobForm();
            }}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => isEditing ? handleUpdateJob(job) : handleAddJob()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            {isEditing ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </div>
    );

    if (jobsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-slate-600">Loading career openings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Career Openings</h2>
            <p className="text-slate-600">Manage job postings displayed on your careers page</p>
          </div>
          {!showAddForm && !editingJob && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Opening
            </button>
          )}
        </div>

        {showAddForm && <JobForm />}
        {editingJob && <JobForm isEditing={true} job={jobs.find(j => j.id === editingJob)} />}

        {jobs.length === 0 && !showAddForm ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
            <Briefcase className="mx-auto mb-4 text-slate-400" size={48} />
            <h4 className="text-lg font-semibold text-slate-800 mb-2"> Job Openings</h4>
            <p className="text-slate-600 mb-4">Start by adding your career opening</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Opening
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-semibold text-slate-800">{job.title}</h4>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {job.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700">{job.description}</p>
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
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Website Analytics</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-600">View detailed analytics and insights.</p>
            </div>
          </div>
        );
      case 'team':
        return (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Team Management</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-600">Manage team members and permissions.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Settings</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-600">Configure your dashboard settings.</p>
            </div>
          </div>
        );

      case 'manage':
        return <ImageManager />;


      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50" onClick={() => setShowPageMenu(null)}>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">SubDuxion Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}