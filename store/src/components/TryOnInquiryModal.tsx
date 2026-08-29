import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Glasses,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { submitInquiry } from '../services/api';
import { handleImageError, FALLBACK_EYEWEAR_IMAGE } from '../utils/imageFallback';

export const TryOnInquiryModal: React.FC = () => {
  const { tryOnProduct, setTryOnProduct, customerUser, showToast } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('Kothrud ZEISS Center');
  const [inquiryType, setInquiryType] = useState('WHATSAPP_TRYON');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ whatsapp_url?: string } | null>(null);

  // Auto pre-fill if customer is already logged in
  useEffect(() => {
    if (customerUser) {
      setFullName(customerUser.full_name || '');
      setPhone(customerUser.phone || '');
      setEmail(customerUser.email || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
    }
    setSubmittedData(null);
    setMessage('');
  }, [customerUser, tryOnProduct]);

  if (!tryOnProduct) return null;

  const handleClose = () => {
    setTryOnProduct(null);
    setSubmittedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      showToast('Please enter your contact number');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitInquiry({
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || undefined,
        product_id: tryOnProduct.id,
        inquiry_type: inquiryType,
        branch_preference: branch,
        message: message.trim() || undefined,
      });

      showToast('Inquiry & Try-On successfully registered in CRM!');
      setSubmittedData(response);
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      showToast(err.response?.data?.detail || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getProductImageUrl = (p: any) => {
    if (p.primary_image) return p.primary_image;
    if (p.images && p.images.length > 0) {
      const first = p.images[0];
      return typeof first === 'string' ? first : first.image_url;
    }
    return FALLBACK_EYEWEAR_IMAGE;
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0A0A0A]/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#C6A15B]/30 bg-[#F6F5F2] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="bg-[#0A0A0A] p-5 text-white border-b border-[#C6A15B]/30 relative shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-6 bg-[#C6A15B]" />
            <span className="eyebrow text-[9px] text-[#C6A15B] font-bold tracking-[0.25em]">
              BAPAT OPTICS CONCIERGE & TRIAL
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-normal text-white">
            {submittedData ? 'Inquiry Confirmed!' : 'Reserve In-Store Try-On'}
          </h2>
          <p className="text-xs text-[#B8BCC2] mt-0.5 font-light">
            Experience this frame in person at our Pune stores with digital Zeiss fitting.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Selected Product Summary Card */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#0A0A0A]/10 shadow-xs">
            <img
              src={getProductImageUrl(tryOnProduct)}
              alt={tryOnProduct.name}
              onError={handleImageError}
              className="h-14 w-18 object-contain bg-[#F6F5F2] rounded-lg p-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#C6A15B] uppercase tracking-wider">
                  {tryOnProduct.brand?.name}
                </span>
                <span className="font-mono text-[9px] text-[#0A0A0A]/50">
                  {tryOnProduct.sku}
                </span>
              </div>
              <h4 className="font-semibold text-xs text-[#0A0A0A] truncate">
                {tryOnProduct.name}
              </h4>
              <p className="font-bold text-[#0A0A0A] text-xs">
                {formatPrice(tryOnProduct.price)}
              </p>
            </div>
          </div>

          {submittedData ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0A0A0A]">
                  Your Request Has Been Logged!
                </h3>
                <p className="text-xs text-[#0A0A0A]/70 max-w-sm mx-auto mt-1">
                  Our optical specialist at <strong>{branch}</strong> has received your trial booking in our CRM pipeline and will keep the frame ready for you.
                </p>
              </div>

              <div className="bg-[#C6A15B]/10 border border-[#C6A15B]/30 rounded-xl p-3 text-left space-y-1">
                <p className="text-[11px] font-bold text-[#8B6B23] flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Confirmed Details:
                </p>
                <p className="text-[11px] text-[#0A0A0A]/80">
                  • <strong>Client:</strong> {fullName} ({phone})
                </p>
                <p className="text-[11px] text-[#0A0A0A]/80">
                  • <strong>Branch:</strong> {branch}
                </p>
                {message && (
                  <p className="text-[11px] text-[#0A0A0A]/80">
                    • <strong>Notes:</strong> {message}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {submittedData.whatsapp_url && (
                  <a
                    href={submittedData.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3 rounded-xl font-bold tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Open WhatsApp Chat</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] py-3 rounded-xl font-bold tracking-wide transition-all cursor-pointer"
                >
                  Done & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* INQUIRY & TRY-ON FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* If existing customer: show smart welcome badge */}
              {customerUser ? (
                <div className="p-2.5 rounded-xl bg-[#C6A15B]/15 border border-[#C6A15B]/40 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#C6A15B] text-[#0A0A0A] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {customerUser.full_name?.substring(0, 2) || 'CL'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#0A0A0A] truncate">
                      Welcome back, {customerUser.full_name}
                    </p>
                    <p className="text-[10px] text-[#8B6B23] truncate">
                      Using your saved profile ({customerUser.phone || customerUser.email})
                    </p>
                  </div>
                </div>
              ) : (
                /* Unauthenticated: ask for basic contact details */
                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-[#0A0A0A]/10">
                  <div className="text-[11px] font-bold text-[#0A0A0A] flex items-center gap-1.5">
                    <User size={13} className="text-[#C6A15B]" />
                    <span>Your Contact Information</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#0A0A0A]/70 block mb-1 font-medium">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Patil"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-lg py-2 px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#0A0A0A]/70 block mb-1 font-medium">
                        WhatsApp / Mobile *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-lg py-2 px-3 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#0A0A0A]/70 block mb-1 font-medium">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-lg py-2 px-3 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Inquiry & Branch Options */}
              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-[#0A0A0A]/10">
                <div className="text-[11px] font-bold text-[#0A0A0A] flex items-center gap-1.5">
                  <Building2 size={13} className="text-[#C6A15B]" />
                  <span>Trial Details & Store Preference</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#0A0A0A]/70 block mb-1 font-medium">
                      Preferred Store (Pune)
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-lg py-2 px-2.5 text-xs outline-none font-medium cursor-pointer"
                    >
                      <option value="Kothrud ZEISS Center">Kothrud ZEISS Center</option>
                      <option value="Sadashiv Peth Flagship">Sadashiv Peth Flagship</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#0A0A0A]/70 block mb-1 font-medium">
                      Inquiry Request Type
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-lg py-2 px-2.5 text-xs outline-none font-medium cursor-pointer"
                    >
                      <option value="WHATSAPP_TRYON">In-Store Frame Try-On</option>
                      <option value="ZEISS_CONSULTATION">ZEISS Lens Consultation</option>
                      <option value="PRICE_ENQUIRY">Price & Stock Availability</option>
                      <option value="GENERAL">General Optical Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#0A0A0A]/70 block mb-1 font-medium">
                    What is your inquiry? / Preferred Day & Time
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. I want to try this frame on Saturday around 4 PM, please keep it ready."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-lg py-2 px-3 text-xs outline-none resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} className="text-[#C6A15B]" />
                <span>{isSubmitting ? 'Registering in CRM...' : 'Submit Inquiry & Reserve Try-On'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
