import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  MessageCircle,
  Download,
  Search,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import type { Order } from '../types/admin';
import { fetchAdminOrders, updateOrderStatus, downloadOrderInvoicePdf } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-amber-50 text-amber-700 border-amber-200',
  PROCESSING:       'bg-blue-50 text-blue-700 border-blue-200',
  READY_FOR_PICKUP: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED:          'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED:        'bg-red-50 text-red-700 border-red-200',
};
const PAYMENT_COLORS: Record<string, string> = {
  PAID:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  FAILED:  'bg-red-50 text-red-700 border-red-200',
};
const statusLabel = (s: string) =>
  s === 'READY_FOR_PICKUP' ? 'Ready Pickup' : s.charAt(0) + s.slice(1).toLowerCase();

/* ─── component ──────────────────────────────────────────────────────────── */
export const OrdersManager: React.FC = () => {
  const { showToast } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | '7DAYS' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  /* load */
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminOrders(statusFilter || undefined);
      setOrders(data);
    } catch {
      showToast('Error loading orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  /* close drawer on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setSelectedOrder(null);
      }
    };
    if (selectedOrder) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedOrder]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedOrder(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`);
      loadOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, order_status: newStatus as any } : prev);
      }
    } catch {
      showToast('Failed to update status');
    }
  };

  const handleDownloadInvoice = async (orderId: string, orderNumber: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDownloadingId(orderId);
    try {
      await downloadOrderInvoicePdf(orderId, orderNumber);
      showToast(`Invoice PDF downloaded for ${orderNumber}`);
    } catch {
      showToast('Failed to generate invoice PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatPrice = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  /* filter */
  const filteredOrders = orders.filter((ord) => {
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      const hit =
        ord.order_number?.toLowerCase().includes(t) ||
        ord.customer_name?.toLowerCase().includes(t) ||
        ord.customer_email?.toLowerCase().includes(t) ||
        ord.customer_phone?.includes(t) ||
        ord.items?.some((it: any) =>
          it.product_sku?.toLowerCase().includes(t) || it.product_name?.toLowerCase().includes(t)
        );
      if (!hit) return false;
    }
    if (paymentFilter && ord.payment_status !== paymentFilter) return false;
    if (ord.created_at) {
      const d = new Date(ord.created_at);
      const now = new Date();
      if (datePreset === 'TODAY' && d.toDateString() !== now.toDateString()) return false;
      if (datePreset === '7DAYS') { const w = new Date(); w.setDate(now.getDate() - 7); if (d < w) return false; }
      if (datePreset === 'MONTH' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
      if (datePreset === 'CUSTOM') {
        if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); if (d < s) return false; }
        if (endDate) { const en = new Date(endDate); en.setHours(23,59,59,999); if (d > en) return false; }
      }
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.payment_status === 'PAID' ? o.total_amount : 0), 0);
  const paidCount = filteredOrders.filter(o => o.payment_status === 'PAID').length;
  const processingCount = filteredOrders.filter(o => o.order_status === 'PROCESSING').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#A4813E]" />
            <h1 className="font-display text-xl text-slate-900 font-normal">Orders &amp; Razorpay</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Manage optical orders, lab status, GST invoices &amp; dispatch</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-xs text-[#A4813E] border border-slate-200 hover:border-[#C6A15B] rounded-xl transition-all font-medium self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders',  value: filteredOrders.length,       sub: 'In database',          icon: <ShoppingBag size={15} className="text-[#A4813E]"   />, color: 'text-slate-900'  },
          { label: 'Paid Orders',   value: paidCount,                    sub: 'Razorpay / POS',        icon: <CheckCircle2 size={15} className="text-emerald-600" />, color: 'text-emerald-600' },
          { label: 'In Lab',        value: processingCount,              sub: 'Zeiss surface cut',     icon: <Clock size={15} className="text-amber-600"         />, color: 'text-amber-600'  },
          { label: 'Net Revenue',   value: formatPrice(totalRevenue),    sub: 'INR paid',              icon: <Sparkles size={15} className="text-[#A4813E]"      />, color: 'text-[#A4813E]'  },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, customer, phone, SKU…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] focus:bg-white rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-900 outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <Calendar size={14} className="text-[#A4813E] shrink-0" />
            <select value={datePreset} onChange={(e: any) => setDatePreset(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer">
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="MONTH">This Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing / In Lab</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer">
              <option value="">All Payments</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        {datePreset === 'CUSTOM' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500">From:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#C6A15B]" />
            <span className="text-slate-500">To:</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#C6A15B]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[11px] text-red-600 hover:underline font-semibold">Clear</button>
            )}
          </div>
        )}
      </div>

      {/* Orders table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Column headers (desktop) */}
        <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1fr_1.2fr_28px] gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
          <span>Order / Date</span>
          <span>Customer</span>
          <span>Items</span>
          <span>Amount</span>
          <span>Status</span>
          <span />
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 animate-pulse">Loading orders…</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 italic">No orders match the selected filters.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((ord) => {
              const firstItem = ord.items?.[0];
              const extra = (ord.items?.length ?? 0) - 1;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_2fr_1fr_1.2fr_28px] gap-2 sm:gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  {/* Order # / date */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">{ord.order_number}</span>
                    <span className="text-[10px] text-slate-400">
                      {ord.created_at
                        ? new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                        : '—'}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate">{ord.customer_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{ord.customer_phone}</span>
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-col justify-center min-w-0">
                    {firstItem ? (
                      <>
                        <span className="text-xs text-slate-700 truncate">{firstItem.product_name}</span>
                        <span className="text-[10px] text-[#A4813E] font-mono">
                          {firstItem.product_sku}{extra > 0 ? ` +${extra} more` : ''}
                        </span>
                      </>
                    ) : <span className="text-xs text-slate-400 italic">—</span>}
                  </div>

                  {/* Amount + payment badge */}
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-900">{formatPrice(ord.total_amount)}</span>
                    <span className={`mt-0.5 inline-flex self-start px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${PAYMENT_COLORS[ord.payment_status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {ord.payment_status}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[ord.order_status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {statusLabel(ord.order_status)}
                    </span>
                  </div>

                  {/* Chevron */}
                  <div className="hidden sm:flex items-center justify-end">
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#C6A15B] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.25)' }}
        >
          <div
            ref={drawerRef}
            className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            {/* Drawer header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-[#A4813E]" />
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedOrder.order_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_COLORS[selectedOrder.order_status] ?? ''}`}>
                    {statusLabel(selectedOrder.order_status)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 ml-5">
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('en-IN') : '—'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Amount */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Order Total</p>
                  <p className="text-2xl font-bold text-slate-900">{formatPrice(selectedOrder.total_amount)}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${PAYMENT_COLORS[selectedOrder.payment_status] ?? ''}`}>
                  {selectedOrder.payment_status}
                </span>
              </div>

              {/* Customer */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#A4813E] uppercase font-bold tracking-wider">Customer</p>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5 space-y-1.5 text-xs">
                  <p className="font-semibold text-slate-900 text-sm">{selectedOrder.customer_name}</p>
                  <p className="flex items-center gap-2 text-slate-600"><Phone size={12} className="text-[#A4813E]" />{selectedOrder.customer_phone}</p>
                  <p className="flex items-center gap-2 text-slate-600"><Mail size={12} className="text-[#A4813E]" />{selectedOrder.customer_email}</p>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#A4813E] uppercase font-bold tracking-wider">Delivery</p>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5 text-xs space-y-1.5 text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.delivery_type === 'HOME_DELIVERY' ? '🚚 Home Delivery (Courier)' : '🏪 Clinic Pickup — Pune'}
                  </p>
                  <p className="flex items-start gap-1.5 text-slate-600">
                    <MapPin size={12} className="text-[#A4813E] mt-0.5 shrink-0" />
                    {selectedOrder.delivery_type === 'STORE_PICKUP'
                      ? selectedOrder.store_pickup_branch || 'Casablanca Kothrud'
                      : `${selectedOrder.shipping_address}, ${selectedOrder.city} - ${selectedOrder.pincode}, ${selectedOrder.state}`}
                  </p>
                </div>
              </div>

              {/* Optical Specs */}
              {(selectedOrder.lens_selection_type || selectedOrder.prescription_data) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-[#A4813E] uppercase font-bold tracking-wider">Optical Specs</p>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5 text-xs space-y-1 text-slate-700">
                    <p className="font-semibold text-slate-900">{selectedOrder.lens_selection_type || 'Frame Only'}</p>
                    {selectedOrder.prescription_data && (
                      <p className="text-slate-500 italic">Notes: {selectedOrder.prescription_data}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#A4813E] uppercase font-bold tracking-wider">Ordered Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                      {item.product_image && (
                        <img src={item.product_image} alt="" className="h-10 w-10 object-contain rounded-lg bg-white border border-slate-200 p-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.product_name}</p>
                        <p className="text-[10px] text-[#A4813E] font-mono">
                          SKU: {item.product_sku} · {item.lens_type} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status change */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#A4813E] uppercase font-bold tracking-wider">Update Status</p>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING (IN LAB)</option>
                  <option value="READY_FOR_PICKUP">READY FOR STORE PICKUP</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-3.5 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={(e) => handleDownloadInvoice(selectedOrder.id, selectedOrder.order_number, e)}
                disabled={downloadingId === selectedOrder.id}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-[#C6A15B] text-slate-700 hover:text-[#0A0A0A] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
              >
                <Download size={13} className={downloadingId === selectedOrder.id ? 'animate-bounce' : ''} />
                {downloadingId === selectedOrder.id ? 'Exporting…' : 'Invoice PDF'}
              </button>

              <a
                href={`https://wa.me/${selectedOrder.customer_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Namaste ${selectedOrder.customer_name}! Bapat Optics Pune – your order ${selectedOrder.order_number} status: ${selectedOrder.order_status}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <MessageCircle size={13} />
                WhatsApp Update
              </a>
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
