import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  MessageCircle, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  UserCheck, 
  CheckCircle2,
  Package
} from 'lucide-react';
import type { CRMStats, Inquiry, Order, Appointment } from '../types/admin';

interface AdminDashboardProps {
  stats: CRMStats | null;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, onNavigateTab, onRefresh }) => {
  if (!stats) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-24 bg-white/5 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-white/5 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const conversionRate = stats.total_leads > 0 
    ? Math.round((stats.converted_leads / stats.total_leads) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-xs">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="eyebrow rounded-full bg-[#C6A15B]/15 text-[#A4813E] px-2.5 py-0.5 text-[9px] font-bold">
              Real-Time Pune Clinic CRM
            </span>
            <span className="text-xs text-slate-500 font-medium">• Live Synced</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl text-slate-900 font-normal">
            Bapat Optics Executive Dashboard
          </h2>
          <p className="text-xs text-slate-500 max-w-xl font-light">
            Monitor real-time omnichannel performance across Kothrud Zeiss Vision Center and Sadashiv Peth flagship store.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onNavigateTab('products')}
            className="eyebrow inline-flex items-center gap-2 bg-[#C6A15B] hover:bg-[#A4813E] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <span>+ Upload Product</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Revenue */}
        <div className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-4 space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Total Sales (INR)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C6A15B]/15 text-[#A4813E]">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <span className="font-display text-2xl text-slate-900 font-normal">
              {formatPrice(stats.total_revenue)}
            </span>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp size={11} />
              <span>Razorpay Live Verified Payments</span>
            </p>
          </div>
        </div>

        {/* Metric 2: CRM Leads */}
        <div className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-4 space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">WhatsApp Leads</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MessageCircle size={15} />
            </div>
          </div>
          <div>
            <span className="font-display text-2xl text-slate-900 font-normal">
              {stats.total_leads}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              <strong className="text-[#A4813E] font-mono font-bold">{stats.new_leads}</strong> New / Uncontacted Leads
            </p>
          </div>
        </div>

        {/* Metric 3: Orders */}
        <div className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-4 space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Total Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div>
            <span className="font-display text-2xl text-slate-900 font-normal">
              {stats.total_orders}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              <strong className="text-blue-600 font-mono font-bold">{stats.paid_orders}</strong> Paid · <strong className="text-amber-600 font-mono font-bold">{stats.pending_orders}</strong> Processing
            </p>
          </div>
        </div>

        {/* Metric 4: Eye Test Appointments */}
        <div className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-4 space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Zeiss Eye Exams</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Calendar size={15} />
            </div>
          </div>
          <div>
            <span className="font-display text-2xl text-slate-900 font-normal">
              {stats.total_appointments}
            </span>
            <p className="text-[10px] text-purple-600 mt-0.5 font-medium">
              Kothrud & Sadashiv Peth Clinics
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Inquiries & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Recent Inquiries / WhatsApp Leads (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-[#25D366]" />
              <h3 className="font-display text-base text-slate-900 font-medium">
                Recent CRM Leads & Try-On Requests
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs text-[#A4813E] hover:underline font-semibold cursor-pointer"
            >
              View All ({stats.total_leads})
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recent_inquiries.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3">No recent inquiries.</p>
            ) : (
              stats.recent_inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#C6A15B]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-xs font-semibold">{inq.customer_name}</strong>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        inq.status === 'NEW' ? 'bg-red-50 text-red-600 border border-red-200' :
                        inq.status === 'CONTACTED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        inq.status === 'CONVERTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-slate-500 text-[11px]">
                      Phone: <strong className="text-slate-800 font-mono">{inq.customer_phone}</strong> · Branch: {inq.branch_preference}
                    </p>

                    {inq.product && (
                      <p className="text-[10px] text-[#A4813E] font-medium">
                        Frame: {inq.product.brand?.name} {inq.product.name} (SKU: {inq.product.sku})
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${inq.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Namaste ${inq.customer_name}! This is Bapat Optics Pune regarding your inquiry.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                    >
                      <MessageCircle size={12} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Orders & Appointments (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recent Orders Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-[#C6A15B]" />
                <h3 className="font-display text-base text-slate-900 font-medium">Recent Orders</h3>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs text-[#A4813E] hover:underline font-semibold cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {stats.recent_orders.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3">No recent orders.</p>
              ) : (
                stats.recent_orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 block text-xs">{ord.order_number}</span>
                      <span className="text-[11px] text-slate-500">{ord.customer_name} ({ord.customer_phone})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block text-xs">{formatPrice(ord.total_amount)}</span>
                      <span className={`text-[9px] font-bold uppercase ${
                        ord.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {ord.payment_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Eye Tests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-purple-600" />
                <h3 className="font-display text-base text-slate-900 font-medium">Upcoming Eye Exams</h3>
              </div>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs text-[#A4813E] hover:underline font-semibold cursor-pointer"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-2">
              {stats.recent_appointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No scheduled appointments.</p>
              ) : (
                stats.recent_appointments.map((apt) => (
                  <div key={apt.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block text-xs">{apt.customer_name}</strong>
                      <span className="text-[10px] text-purple-600 font-medium">{apt.branch}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-slate-800 text-[11px] font-semibold block">{apt.appointment_date}</span>
                      <span className="text-[10px] text-slate-500">{apt.time_slot}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
