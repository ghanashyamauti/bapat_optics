import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, Clock, CheckCircle2, User, Sparkles, Filter } from 'lucide-react';
import type { Inquiry } from '../types/admin';
import { fetchAdminInquiries, updateInquiryStatus } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const CRMLeadsManager: React.FC = () => {
  const { showToast } = useAdminAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminInquiries(statusFilter || undefined);
      setInquiries(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading CRM leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateInquiryStatus(id, newStatus);
      showToast(`Lead marked as ${newStatus}`);
      loadInquiries();
    } catch (err) {
      console.error(err);
      showToast('Failed to update lead status');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'NEW':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'CONTACTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'TRIAL_BOOKED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-display text-2xl text-slate-900 font-normal">WhatsApp CRM & Try-On Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer inquiries, consultation requests, and in-store try-on trials</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#A4813E]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:border-[#C6A15B] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none cursor-pointer"
          >
            <option value="">All Statuses ({inquiries.length})</option>
            <option value="NEW">New / Uncontacted</option>
            <option value="CONTACTED">Contacted</option>
            <option value="TRIAL_BOOKED">Trial Booked</option>
            <option value="CONVERTED">Converted to Sale</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading CRM Leads...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 italic shadow-xs">
            No inquiries found for selected status.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-5 space-y-4 shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-base block">{inq.customer_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Received: {new Date(inq.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(inq.status)}`}>
                    {inq.status}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone size={12} className="text-[#A4813E] shrink-0" />
                    <strong className="text-slate-900 font-mono">{inq.customer_phone}</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-medium">Trial Branch:</span>
                    <span className="text-slate-800 font-medium">{inq.branch_preference}</span>
                  </div>
                </div>

                {/* Inquired Product info */}
                {inq.product ? (
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="h-12 w-12 rounded bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                      <img src={inq.product.primary_image} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="text-xs min-w-0">
                      <strong className="text-slate-900 block truncate">{inq.product.name}</strong>
                      <span className="text-[11px] text-[#A4813E] font-mono font-medium">
                        SKU: {inq.product.sku} · ₹{inq.product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    General In-Store Try-On & Eye Test Consultation
                  </div>
                )}

                {/* Customer Message */}
                {inq.message && (
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-lg italic">
                    "{inq.message}"
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Status Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Status:</span>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="TRIAL_BOOKED">TRIAL BOOKED</option>
                    <option value="CONVERTED">CONVERTED (SALE)</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* 1-Click WhatsApp Direct Chat */}
                <a
                  href={`https://wa.me/${inq.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste ${inq.customer_name}! This is Dr. Shrikant Bapat from Bapat Optics Pune. We received your try-on inquiry for ${inq.product?.name || 'our eyewear collection'}. When would you like to visit our ${inq.branch_preference} store?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>Reply on WhatsApp</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
