import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ImagePlus } from 'lucide-react';
import {
  LayoutDashboard, FileText, Briefcase, Users, TrendingUp, Settings,
  ChevronDown, ChevronRight, Wrench, MessageSquare, BarChart3,
  Bell, Save, Edit, Plus, Edit2, Trash2, X, Building2,  MapPin, Clock, DollarSign,
  MoreVertical, Menu, LogOut, User, LucidePhoneCall,
} from 'lucide-react';

const NavItem = ({
  icon,
  label,
  active,
  collapsed,
  onClick,
  hasSubmenu,
  submenuExpanded,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center 
    ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} 
    py-3 cursor-pointer rounded-lg transition-all duration-200 group relative
    ${active
        ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-[1.01]'
      }`}
  >
    <div
      className={`flex items-center justify-center 
      ${active ? 'scale-110' : 'group-hover:scale-110'} 
      transition-transform duration-200`}
    >
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

const Sidebar = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeSection,
  activePage,
  activeInquiry,
  pagesExpanded,
  setPagesExpanded,
  inquiriesExpanded,
  setInquiriesExpanded,
  companiesExpanded,
  setCompaniesExpanded,
  allPages,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`${sidebarCollapsed ? 'w-20' : 'w-72'
        } bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-slate-700/50 backdrop-blur-xl relative overflow-hidden`}
    >
      {/* Animated background */}
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
          onClick={() => navigate('/admin')}
        />

        {/* Pages */}
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
                  onClick={() => navigate(`/admin/${page.pageName}`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${activePage === page.pageName && activeSection === 'pages'
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

        {/* Inquiries */}
        <div className="relative">
          <NavItem
            icon={<MessageSquare size={20} />}
            label="Inquiries"
            collapsed={sidebarCollapsed}
            onClick={() => setInquiriesExpanded(!inquiriesExpanded)}
            hasSubmenu
            submenuExpanded={inquiriesExpanded}
          />
          {inquiriesExpanded && !sidebarCollapsed && (
            <div className="ml-4 mt-1 space-y-1 animate-slide-down">
              <button
                onClick={() => navigate('/admin/inquiries/call')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${activeInquiry === 'call' && activeSection === 'inquiries'
                  ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                <span>Call Inquiries</span>
              </button>
              <button
                onClick={() => navigate('/admin/inquiries/contact')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${activeInquiry === 'contact' && activeSection === 'inquiries'
                  ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                <span>General Inquiries</span>
              </button>
              <button
                onClick={() => navigate('/admin/inquiries/job')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${activeInquiry === 'job' && activeSection === 'inquiries'
                  ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                <span>Job Applications</span>
              </button>
            </div>
          )}
        </div>

        {/* Companies */}
        <div className="relative">
          <NavItem
            icon={<Users size={20} />}
            label="Customers"
            active={activeSection === 'newcompany' || activeSection === 'expense-inquiries'}
            collapsed={sidebarCollapsed}
            onClick={() => setCompaniesExpanded(!companiesExpanded)}
            hasSubmenu
            submenuExpanded={companiesExpanded}
          />
          {companiesExpanded && !sidebarCollapsed && (
            <div className="ml-4 mt-1 space-y-1 animate-slide-down">
              <button
                onClick={() => navigate('/admin/newcompany')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${activeSection === 'newcompany'
                  ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                <span>Company Inquiries</span>
              </button>
              <button
                onClick={() => navigate('/admin/expense-inquiries')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg text-sm transition-all duration-200 ${activeSection === 'expense-inquiries'
                  ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                <span>Expense Inquiries</span>
              </button>
            </div>
          )}
        </div>

        <NavItem
          icon={<Building2 size={20} />}
          label="Legal Entities"
          active={activeSection === 'legalentities'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/legalentities')}
        />

        {/* Masters */}
        <NavItem
          icon={<Target size={20} />}
          label="Masters"
          active={activeSection === 'masters'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/mainmasters')}
        />

        <NavItem
          icon={<BarChart3 size={20} />}
          label="Analytics"
          active={activeSection === 'analytics'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/analytics')}
        />
        
        <NavItem
          icon={<Briefcase size={20} />}
          label="Career Openings"
          active={activeSection === 'manage-jobs'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/manage-jobs')}
        />
        <NavItem
          icon={<ImagePlus size={20} />}
          label="Manage Media"
          active={activeSection === 'manage-media'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/manage-media')}
        />
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={activeSection === 'settings'}
          collapsed={sidebarCollapsed}
          onClick={() => navigate('/admin/settings')}
        />
      </nav>

      {/* User Profile */}
      <div className="relative p-4 border-t border-slate-700/50">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-semibold shadow-lg">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@subduxion.com</p>
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
};

export default Sidebar;