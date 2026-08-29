import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Calendar, 
  User as UserIcon, 
  Lock, 
  FileText, 
  Download, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { 
  fetchMyOrders, 
  fetchMyAppointments, 
  updateUserProfile, 
  changePassword, 
  downloadInvoicePdf 
} from '../services/api';

interface CustomerAccountModalProps {
  initialTab?: 'orders' | 'appointments' | 'settings';
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  initialTab = 'orders',
  isOpen,
  onClose
}) => {
  const { customerUser, customerLogout, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'appointments' | 'settings'>(initialTab);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Appointments State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState(customerUser?.full_name || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (customerUser) {
      setFullName(customerUser.full_name || '');
      setPhone(customerUser.phone || '');
    }
  }, [customerUser]);

  // Load orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load appointments
  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const data = await fetchMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching customer appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerUser) {
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'appointments') loadAppointments();
    }
  }, [isOpen, activeTab, customerUser]);

  if (!isOpen || !customerUser) return null;

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    setDownloadingId(orderId);
    try {
      await downloadInvoicePdf(orderId, orderNumber);
      showToast(`Invoice for order ${orderNumber} downloaded successfully!`);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      showToast('Error downloading invoice. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please provide your full name');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const updated = await updateUserProfile({ full_name: fullName, phone });
      showToast('Profile updated successfully!');
      // Update local storage
      const existing = localStorage.getItem('bapat_customer_user');
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.full_name = updated.full_name;
        parsed.phone = updated.phone;
        localStorage.setItem('bapat_customer_user', JSON.stringify(parsed));
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Please enter your current and new password');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      showToast('Password changed successfully! Please use your new password next time.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#C6A15B]/30 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] text-white border-b border-[#C6A15B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B]/40 flex items-center justify-center font-bold text-[#C6A15B]">
              {customerUser.full_name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-normal text-white">{customerUser.full_name}</h2>
                <span className="px-2 py-0.5 rounded bg-[#C6A15B]/20 text-[#C6A15B] text-[9px] font-bold tracking-wider uppercase">
                  VIP Client
                </span>
              </div>
              <p className="text-[11px] text-[#B8BCC2]">{customerUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#0A0A0A]/10 bg-[#F6F5F2] px-6 text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#0A0A0A] text-[#0A0A0A] font-bold'
                : 'border-transparent text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
            }`}
          >
            <ShoppingBag size={15} className={activeTab === 'orders' ? 'text-[#C6A15B]' : ''} />
            <span>My Orders & Invoices ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-[#0A0A0A] text-[#0A0A0A] font-bold'
                : 'border-transparent text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
            }`}
          >
            <Calendar size={15} className={activeTab === 'appointments' ? 'text-[#C6A15B]' : ''} />
            <span>Eye Test Bookings ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#0A0A0A] text-[#0A0A0A] font-bold'
                : 'border-transparent text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
            }`}
          >
            <Lock size={15} className={activeTab === 'settings' ? 'text-[#C6A15B]' : ''} />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F6F5F2]/40 text-[#0A0A0A]">
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg text-[#0A0A0A]">Order Purchase History</h3>
                  <p className="text-xs text-[#0A0A0A]/60">Download official GST tax invoices and track laboratory fulfillment.</p>
                </div>
                <button
                  onClick={loadOrders}
                  className="flex items-center gap-1.5 text-xs text-[#A4813E] hover:underline font-semibold"
                >
                  <RefreshCw size={13} className={loadingOrders ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingOrders ? (
                <div className="text-center py-12 text-xs text-[#0A0A0A]/50 animate-pulse">
                  Loading your luxury orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#0A0A0A]/10 p-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] flex items-center justify-center mx-auto">
                    <ShoppingBag size={22} />
                  </div>
                  <h4 className="font-display text-base text-[#0A0A0A]">No Orders Placed Yet</h4>
                  <p className="text-xs text-[#0A0A0A]/60 max-w-sm mx-auto">
                    Discover our luxury eyewear catalog with Zeiss digital wavefront lenses.
                  </p>
                  <button
                    onClick={onClose}
                    className="eyebrow inline-flex items-center rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
                  >
                    Browse Eyewear Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="bg-white border border-[#0A0A0A]/10 hover:border-[#C6A15B]/40 rounded-xl p-5 space-y-4 shadow-xs transition-all"
                    >
                      {/* Top Row: Order Number, Date, Status Badge, Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#0A0A0A]/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#0A0A0A]">{ord.order_number}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              ord.payment_status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {ord.payment_status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#0A0A0A]/5 text-[#0A0A0A] text-[9px] font-semibold uppercase">
                              Status: {ord.order_status}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#0A0A0A]/50 block mt-0.5">
                            Placed on {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg font-bold text-[#0A0A0A]">
                            {formatPrice(ord.total_amount)}
                          </span>
                          
                          {/* Download Invoice PDF Button */}
                          <button
                            onClick={() => handleDownloadInvoice(ord.id, ord.order_number)}
                            disabled={downloadingId === ord.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] text-xs font-bold transition-all shadow-xs"
                            title="Download official GST tax invoice PDF"
                          >
                            <Download size={13} className={downloadingId === ord.id ? 'animate-bounce' : ''} />
                            <span>{downloadingId === ord.id ? 'Generating...' : 'Invoice (PDF)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {ord.items?.map((it: any) => (
                          <div key={it.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F6F5F2] text-xs">
                            <div className="flex items-center gap-3">
                              {it.product_image && (
                                <img src={it.product_image} alt="" className="h-10 w-10 object-contain rounded bg-white p-1 border border-[#0A0A0A]/10" />
                              )}
                              <div>
                                <strong className="text-[#0A0A0A] block">{it.product_name}</strong>
                                <span className="text-[11px] text-[#A4813E] font-mono">
                                  SKU: {it.product_sku} &bull; Lens: {it.lens_type || 'Frame Only'} &bull; Qty: {it.quantity}
                                </span>
                              </div>
                            </div>

                            <span className="font-mono font-bold text-[#0A0A0A]">
                              {formatPrice(it.total_price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery & Specs Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-[#0A0A0A]/70">
                        <div className="bg-[#F6F5F2] p-2.5 rounded-lg">
                          <span className="font-bold text-[#0A0A0A] block mb-0.5">Fulfillment:</span>
                          <p>
                            {ord.delivery_type === 'HOME_DELIVERY' 
                              ? `Free Express Courier to: ${ord.shipping_address || ''}, ${ord.city} - ${ord.pincode}`
                              : `Store Pickup at: ${ord.store_pickup_branch || 'Casablanca Kothrud'}`}
                          </p>
                        </div>

                        <div className="bg-[#F6F5F2] p-2.5 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#0A0A0A] block mb-0.5">Need Optical Support?</span>
                            <span>Prescription consultation with Pune optometrists.</span>
                          </div>
                          <a
                            href={`https://wa.me/919175586133?text=${encodeURIComponent(
                              `Namaste Bapat Optics, I have a question regarding my order ${ord.order_number}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-[#25D366] text-white hover:bg-[#1EBE5B] transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EYE TEST BOOKINGS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg text-[#0A0A0A]">Zeiss 3D Eye Examination Appointments</h3>
                  <p className="text-xs text-[#0A0A0A]/60">Complimentary digital wavefront scans at our Kothrud & Sadashiv Peth clinics.</p>
                </div>
                <button
                  onClick={loadAppointments}
                  className="flex items-center gap-1.5 text-xs text-[#A4813E] hover:underline font-semibold"
                >
                  <RefreshCw size={13} className={loadingAppointments ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingAppointments ? (
                <div className="text-center py-12 text-xs text-[#0A0A0A]/50 animate-pulse">
                  Loading clinic appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#0A0A0A]/10 p-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] flex items-center justify-center mx-auto">
                    <Calendar size={22} />
                  </div>
                  <h4 className="font-display text-base text-[#0A0A0A]">No Eye Test Appointments Scheduled</h4>
                  <p className="text-xs text-[#0A0A0A]/60 max-w-sm mx-auto">
                    Book a free Zeiss 3D Digital Wavefront Scan with our senior certified optometrists in Pune.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white border border-[#0A0A0A]/10 hover:border-[#C6A15B]/40 rounded-xl p-5 space-y-3.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm text-[#0A0A0A] block">{apt.test_type}</span>
                          <span className="text-[11px] text-[#A4813E] font-medium">{apt.branch}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="bg-[#F6F5F2] p-3 rounded-lg text-xs space-y-1.5 text-[#0A0A0A]/80">
                        <div className="flex justify-between">
                          <span className="text-[#0A0A0A]/50">Date:</span>
                          <strong className="font-mono text-[#0A0A0A]">{apt.appointment_date}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#0A0A0A]/50">Time Slot:</span>
                          <strong className="text-[#A4813E]">{apt.time_slot}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#0A0A0A]/50">Fee:</span>
                          <span className="text-emerald-600 font-bold">100% Free</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#0A0A0A]/50">
                          {apt.branch.includes('Kothrud') ? 'Casablanca, Kothrud' : 'Mulay Arcade, Sadashiv Peth'}
                        </span>

                        <a
                          href={`https://wa.me/919175586133?text=${encodeURIComponent(
                            `Namaste Bapat Optics, regarding my eye test appointment on ${apt.appointment_date} at ${apt.time_slot}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#25D366] hover:underline font-bold"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp Clinic</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & SECURITY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              {/* Profile Details Form */}
              <form onSubmit={handleProfileSubmit} className="bg-white p-5 rounded-xl border border-[#0A0A0A]/10 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#0A0A0A]/10">
                  <UserIcon size={16} className="text-[#C6A15B]" />
                  <h4 className="font-bold text-sm text-[#0A0A0A]">Contact & Profile Information</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0A0A0A]/70 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0A0A0A]/70 mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={customerUser.email}
                        className="w-full bg-[#F6F5F2]/60 border border-[#0A0A0A]/10 rounded-lg px-3 py-2 text-xs text-[#0A0A0A]/60 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0A0A0A]/70 mb-1">Phone Number (WhatsApp)</label>
                      <input
                        type="tel"
                        placeholder="+91 98220 XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] text-xs font-bold transition-all shadow-xs"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>

              {/* Password Change Form */}
              <form onSubmit={handleChangePasswordSubmit} className="bg-white p-5 rounded-xl border border-[#0A0A0A]/10 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#0A0A0A]/10">
                  <Lock size={16} className="text-[#C6A15B]" />
                  <h4 className="font-bold text-sm text-[#0A0A0A]">Change Account Password</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0A0A0A]/70 mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0A0A0A]/70 mb-1">New Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#0A0A0A]/70 mb-1">Confirm New Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] text-xs font-bold transition-all shadow-xs"
                >
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
