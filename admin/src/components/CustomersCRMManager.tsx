import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShoppingBag, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  UserCheck,
  Download,
  RefreshCw,
  X,
  ArrowRight
} from 'lucide-react';
import { fetchCRMCustomers, downloadOrderInvoicePdf } from '../services/adminApi';

export const CustomersCRMManager: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'spend' | 'orders' | 'recent'>('spend');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCRMCustomers();
      setCustomers(data);
      // If modal is open, refresh selected customer data as well
      if (selectedCustomer) {
        const updated = data.find((c: any) => c.id === selectedCustomer.id);
        if (updated) setSelectedCustomer(updated);
      }
    } catch (err) {
      console.error('Error fetching CRM customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleDownloadInvoice = async (orderId: string, orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingOrderId(orderId);
    try {
      await downloadOrderInvoicePdf(orderId, orderNumber);
    } catch (err) {
      console.error('Invoice download error:', err);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const filteredCustomers = customers.filter(c => {
    // 1. Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = c.full_name?.toLowerCase().includes(term);
      const matchEmail = c.email?.toLowerCase().includes(term);
      const matchPhone = c.phone?.includes(term);
      const matchOrder = c.orders?.some((o: any) => o.order_number?.toLowerCase().includes(term));
      if (!matchName && !matchEmail && !matchPhone && !matchOrder) return false;
    }

    // 2. Date Filter on customer created_at
    if (c.created_at) {
      const joinDate = new Date(c.created_at);
      const now = new Date();

      if (datePreset === 'TODAY') {
        const isToday = joinDate.toDateString() === now.toDateString();
        if (!isToday) return false;
      } else if (datePreset === '7DAYS') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (joinDate < sevenDaysAgo) return false;
      } else if (datePreset === 'MONTH') {
        const sameMonth = joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        if (!sameMonth) return false;
      } else if (datePreset === 'CUSTOM') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (joinDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (joinDate > end) return false;
        }
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'spend') return (b.total_spent || 0) - (a.total_spent || 0);
    if (sortBy === 'orders') return (b.total_orders || 0) - (a.total_orders || 0);
    if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    return 0;
  });

  const totalRegistered = customers.length;
  const totalCustomerSpend = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalOrdersPlaced = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header & Metric Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#A4813E]" />
            <h1 className="font-display text-xl text-slate-900 font-normal">
              Customer CRM Profiles & History
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-light">
            Complete client accounts, lifetime value, purchase history, and direct invoice PDF export.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-xs text-[#A4813E] border border-slate-200 hover:border-[#C6A15B] rounded-xl transition-all font-medium self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh CRM Records</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Registered Clients</span>
            <UserCheck size={16} className="text-[#A4813E]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalRegistered}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Authenticated Client Accounts</p>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Orders Placed</span>
            <ShoppingBag size={16} className="text-[#A4813E]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalOrdersPlaced}</p>
          <p className="text-[10px] text-[#A4813E] font-medium">Stored in CRM Database</p>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Client Spend</span>
            <Sparkles size={16} className="text-[#A4813E]" />
          </div>
          <p className="text-2xl font-bold text-[#A4813E]">{formatPrice(totalCustomerSpend)}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Verified Revenue via Razorpay & In-Store</p>
        </div>
      </div>

      {/* Advanced Filters & Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search clients by name, email, phone, or order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none placeholder:text-slate-400"
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Date Filter Preset */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Calendar size={15} className="text-[#A4813E] shrink-0" />
            <select
              value={datePreset}
              onChange={(e: any) => setDatePreset(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Registration Dates</option>
              <option value="TODAY">Joined Today</option>
              <option value="7DAYS">Joined Last 7 Days</option>
              <option value="MONTH">Joined This Month</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="spend">Sort: Highest Spend</option>
              <option value="orders">Sort: Most Orders</option>
              <option value="recent">Sort: Newest Members</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers */}
        {datePreset === 'CUSTOM' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-800">
            <span className="text-slate-500 font-medium">Joined From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#C6A15B]"
            />
            <span className="text-slate-500 font-medium">Joined To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#C6A15B]"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[11px] text-red-600 hover:underline font-semibold"
              >
                Reset Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-400 animate-pulse">
            Loading Customer CRM data...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-xs">
            No customer accounts found matching your search or date filter.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div 
              key={customer.id} 
              onClick={() => setSelectedCustomer(customer)}
              className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-4 transition-all shadow-xs hover:shadow-sm cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left: Avatar & Basic Info */}
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-full bg-[#C6A15B]/15 text-[#A4813E] flex items-center justify-center font-bold text-sm uppercase shrink-0 border border-[#C6A15B]/30 group-hover:bg-[#C6A15B] group-hover:text-[#0A0A0A] transition-colors">
                  {customer.full_name?.substring(0, 2) || 'CL'}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#A4813E] transition-colors">
                      {customer.full_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-[#C6A15B]/15 text-[#A4813E] text-[9px] font-bold">
                      Client
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-[#A4813E]" />
                      {customer.email}
                    </span>
                    {customer.phone && customer.phone !== 'N/A' && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-[#A4813E]" />
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Metrics & Click-to-open indicator */}
              <div className="flex items-center justify-between md:justify-end gap-5 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Lifetime Spend</p>
                  <p className="text-sm font-bold text-[#A4813E]">
                    {formatPrice(customer.total_spent)}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Orders</p>
                  <p className="text-sm font-bold text-slate-900">
                    {customer.total_orders}
                  </p>
                </div>

                {/* Quick WhatsApp Link if Phone Available */}
                {customer.phone && customer.phone !== 'N/A' && (
                  <a
                    href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-[#25D366] hover:text-white transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </a>
                )}

                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#C6A15B] text-slate-600 group-hover:text-[#0A0A0A] text-xs font-semibold transition-all">
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POPUP MODAL CARD FOR CLIENT DETAILS */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-[#C6A15B] text-[#0A0A0A] flex items-center justify-center font-bold text-base uppercase shrink-0 shadow-xs">
                  {selectedCustomer.full_name?.substring(0, 2) || 'CL'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-slate-900 font-semibold">
                      {selectedCustomer.full_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase">
                      Client Profile
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-[#A4813E]" />
                      {selectedCustomer.email}
                    </span>
                    {selectedCustomer.phone && selectedCustomer.phone !== 'N/A' && (
                      <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                        <Phone size={12} className="text-[#A4813E]" />
                        {selectedCustomer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedCustomer.phone && selectedCustomer.phone !== 'N/A' && (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-bold transition-all shadow-xs"
                    title="Direct WhatsApp Chat"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close Card"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Spent</span>
                  <span className="text-base font-bold text-[#A4813E]">{formatPrice(selectedCustomer.total_spent)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Orders</span>
                  <span className="text-base font-bold text-slate-900">{selectedCustomer.total_orders} Orders</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Member Since</span>
                  <span className="text-xs font-medium text-slate-700">
                    {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active Member'}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-[#A4813E]" />
                    Purchase Order History ({selectedCustomer.orders?.length || 0})
                  </h4>
                </div>

                {!selectedCustomer.orders || selectedCustomer.orders.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 italic">
                    No purchase orders recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((order: any) => (
                      <div 
                        key={order.id} 
                        className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {order.order_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              order.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.payment_status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] text-slate-600 uppercase font-medium">
                              {order.delivery_type}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#A4813E] text-xs">
                              {formatPrice(order.total_amount)}
                            </span>

                            {/* Download Invoice PDF Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDownloadInvoice(order.id, order.order_number, e)}
                              disabled={downloadingOrderId === order.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#C6A15B] text-slate-700 hover:text-[#0A0A0A] text-[11px] font-bold transition-all border border-slate-200 cursor-pointer shadow-2xs"
                              title="Download Official Tax Invoice PDF"
                            >
                              <Download size={12} className={downloadingOrderId === order.id ? 'animate-bounce' : ''} />
                              <span>{downloadingOrderId === order.id ? 'Exporting...' : 'Invoice (PDF)'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 bg-slate-50/70 p-2 rounded-lg">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                              <span>
                                {item.quantity}x {item.product_name} ({item.product_sku}) &bull; <span className="text-[#A4813E] font-medium">{item.lens_type}</span>
                              </span>
                              <span className="text-slate-900 font-mono font-semibold">
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Action */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
