import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Glasses, 
  MessageCircle, 
  ShoppingBag, 
  Calendar, 
  Users,
  LogOut, 
  Sparkles, 
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  onRefresh: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  activeTab, 
  setActiveTab, 
  children,
  onRefresh
}) => {
  const { user, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Client CRM & History', icon: Users },
    { id: 'orders', label: 'Orders & Razorpay', icon: ShoppingBag },
    { id: 'inquiries', label: 'CRM Leads & WhatsApp', icon: MessageCircle },
    { id: 'appointments', label: 'Zeiss Eye Exams', icon: Calendar },
    { id: 'products', label: 'Inventory & Upload', icon: Glasses },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 overflow-hidden">
      {/* DESKTOP FIXED SIDEBAR (Non-scrollable with page) */}
      <aside className="hidden md:flex md:w-64 h-full bg-white border-r border-slate-200 p-4 flex-col justify-between shrink-0 shadow-xs overflow-y-auto">
        <div className="space-y-3.5">
          {/* Brand & Wordmark */}
          <div className="space-y-0.5 pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#C6A15B]" />
              <h1 className="font-display text-lg text-slate-900 font-normal tracking-tight">
                BAPAT OPTICS
              </h1>
            </div>
            <p className="eyebrow text-[8px] text-[#A4813E] tracking-[0.25em] font-semibold">
              Executive CRM Portal
            </p>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C6A15B] text-[#0A0A0A] font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-[#0A0A0A]' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Storefront Link */}
        <div className="pt-3 border-t border-slate-200 space-y-2.5">
          <a
            href={import.meta.env.VITE_STORE_URL || "http://localhost:5173"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#C6A15B] text-xs text-slate-600 hover:text-slate-900 transition-all shadow-2xs"
          >
            <span className="font-medium text-[11px]">View Public Storefront</span>
            <ExternalLink size={12} className="text-[#A4813E]" />
          </a>

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <span className="text-slate-900 text-xs font-semibold block truncate">{user?.full_name}</span>
              <span className="text-[10px] text-[#A4813E] uppercase font-mono font-semibold">{user?.role}</span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE SLIDE-OUT DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-white border-r border-slate-200 p-4 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-250">
            <div className="space-y-3.5">
              {/* Brand & Close Button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#C6A15B]" />
                    <h1 className="font-display text-lg text-slate-900 font-normal tracking-tight">
                      BAPAT OPTICS
                    </h1>
                  </div>
                  <p className="eyebrow text-[8px] text-[#A4813E] tracking-[0.25em] font-semibold">
                    Executive CRM Portal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Navigation"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C6A15B] text-[#0A0A0A] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-[#0A0A0A]' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile User Info & Storefront Link */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <a
                href={import.meta.env.VITE_STORE_URL || "http://localhost:5173"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:border-[#C6A15B] transition-all shadow-2xs font-medium"
              >
                <span className="text-[11px]">View Public Storefront</span>
                <ExternalLink size={13} className="text-[#A4813E]" />
              </a>

              <div className="flex items-center justify-between gap-2 p-1">
                <div className="min-w-0">
                  <span className="text-slate-900 text-xs font-semibold block truncate">{user?.full_name}</span>
                  <span className="text-[10px] text-[#A4813E] uppercase font-mono font-semibold">{user?.role}</span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile-Only Header Bar with 3-Lines Hamburger on the Left */}
        <div className="md:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#C6A15B]" />
              <span className="font-display text-base text-slate-900 font-medium tracking-tight">BAPAT OPTICS</span>
            </div>
          </div>

          <span className="eyebrow text-[8px] text-[#A4813E] tracking-[0.2em] font-bold">
            CRM PORTAL
          </span>
        </div>

        {/* Scrollable Page Content with sleek balanced padding */}
        <main className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
