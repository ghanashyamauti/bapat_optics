import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Filter, 
  MessageCircle, 
  Sparkles,
  Search,
  RefreshCw,
  Mail
} from 'lucide-react';
import type { Appointment } from '../types/admin';
import { fetchAdminAppointments, updateAppointmentStatus } from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AppointmentsManager: React.FC = () => {
  const { showToast } = useAdminAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [datePreset, setDatePreset] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'PAST' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAppointments(branchFilter || undefined, statusFilter || undefined);
      setAppointments(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [branchFilter, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      showToast(`Appointment marked as ${newStatus}`);
      loadAppointments();
    } catch (err) {
      console.error(err);
      showToast('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    // 1. Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = apt.customer_name?.toLowerCase().includes(term);
      const matchPhone = apt.customer_phone?.includes(term);
      const matchEmail = apt.customer_email?.toLowerCase().includes(term);
      const matchTest = apt.test_type?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchEmail && !matchTest) return false;
    }

    // 2. Date presets
    if (apt.appointment_date) {
      const aptDateStr = apt.appointment_date;
      const todayStr = new Date().toISOString().split('T')[0];

      if (datePreset === 'TODAY') {
        if (aptDateStr !== todayStr) return false;
      } else if (datePreset === 'UPCOMING') {
        if (aptDateStr < todayStr) return false;
      } else if (datePreset === 'PAST') {
        if (aptDateStr > todayStr) return false;
      } else if (datePreset === 'CUSTOM' && customDate) {
        if (aptDateStr !== customDate) return false;
      }
    }

    return true;
  });

  const confirmedCount = filteredAppointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = filteredAppointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#A4813E]" />
            <h1 className="font-display text-xl text-slate-900 font-normal">
              Zeiss 3D Eye Examination Appointments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-light">
            Manage digital wavefront clinic bookings, automated customer confirmations, and branch schedules.
          </p>
        </div>

        <button
          onClick={loadAppointments}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-xs text-[#A4813E] border border-slate-200 hover:border-[#C6A15B] rounded-xl transition-all font-medium self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Appointments</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Filtered Appointments</span>
            <Calendar size={16} className="text-[#A4813E]" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{filteredAppointments.length}</p>
          <p className="text-[10px] text-slate-400">Scheduled Clinic Slots</p>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Confirmed & Active</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Awaiting Patient Arrival</p>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Examinations</span>
            <Sparkles size={16} className="text-[#A4813E]" />
          </div>
          <p className="text-2xl font-bold text-[#A4813E]">{completedCount}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Wavefront Scanned & Converted</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Search by Patient Name, Phone, Email..."
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
          <div className="md:col-span-3">
            <select
              value={datePreset}
              onChange={(e: any) => setDatePreset(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Appointment Dates</option>
              <option value="TODAY">Today's Clinic Slots</option>
              <option value="UPCOMING">Upcoming Appointments</option>
              <option value="PAST">Past Appointments</option>
              <option value="CUSTOM">Specific Date</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Pune Clinic Branches</option>
              <option value="Kothrud">Kothrud ZEISS Center</option>
              <option value="Sadashiv">Sadashiv Peth</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {datePreset === 'CUSTOM' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-800">
            <span className="text-slate-500 font-medium">Select Appointment Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#C6A15B]"
            />
            {customDate && (
              <button onClick={() => setCustomDate('')} className="text-[11px] text-red-600 hover:underline font-semibold">
                Clear Date
              </button>
            )}
          </div>
        )}
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading clinic appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 italic shadow-xs">
            No appointments scheduled for selected filters.
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white border border-slate-200 hover:border-[#C6A15B] rounded-2xl p-5 space-y-4 shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-base block">{apt.customer_name}</span>
                    <span className="text-[11px] text-[#A4813E] font-medium">{apt.test_type}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    apt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {apt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-600">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Date & Time:</span>
                    <strong className="text-slate-900 block font-mono">{apt.appointment_date}</strong>
                    <span className="text-[11px] text-[#A4813E] font-medium">{apt.time_slot}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Branch & Contact:</span>
                    <strong className="text-slate-900 block truncate">{apt.branch}</strong>
                    <span className="font-mono text-[11px] text-slate-800">{apt.customer_phone}</span>
                    {apt.customer_email && (
                      <span className="text-[10px] text-slate-500 block truncate">{apt.customer_email}</span>
                    )}
                  </div>
                </div>

                {apt.notes && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    Notes: {apt.notes}
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <select
                  value={apt.status}
                  onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <a
                  href={`https://wa.me/${apt.customer_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Namaste ${apt.customer_name}! This is a reminder for your Zeiss 3D eye checkup scheduled at Bapat Optics ${apt.branch} on ${apt.appointment_date} at ${apt.time_slot}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                >
                  <MessageCircle size={13} />
                  <span>Send Reminder</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
