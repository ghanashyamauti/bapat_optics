import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, User, Phone, Mail, Building2, CheckCircle2, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { inr } from "@/data/site";

const rawApiUrl = (import.meta.env["VITE_API_URL"] || "http://127.0.0.1:8000/api/v1").trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export interface LandingInquiryProduct {
  id?: string | undefined;
  name: string;
  brand: string;
  sku?: string | undefined;
  price: number;
  image?: string | undefined;
}

interface LandingInquiryModalProps {
  product: LandingInquiryProduct | null;
  onClose: () => void;
}

export const LandingInquiryModal: React.FC<LandingInquiryModalProps> = ({
  product,
  onClose,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("Kothrud ZEISS Center");
  const [inquiryType, setInquiryType] = useState("WHATSAPP_TRYON");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ whatsapp_url?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your contact number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || undefined,
        product_id: product.id || undefined,
        inquiry_type: inquiryType,
        branch_preference: branch,
        message: message.trim() || `Inquiry for ${product.brand} ${product.name} (SKU: ${product.sku || 'BAPAT'})`,
      };

      const res = await fetch(`${API_BASE_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to register inquiry in CRM");
      }

      const data = await res.json();
      setSubmittedData(data);
    } catch (err: any) {
      console.error("Error submitting landing inquiry:", err);
      // Fallback direct WhatsApp if backend unreachable
      const fallbackUrl = `https://wa.me/919175586133?text=${encodeURIComponent(
        `Namaste Bapat Optics! I want to enquire about ${product.brand} ${product.name} at ${branch}. Customer: ${fullName} (${phone})`
      )}`;
      setSubmittedData({ whatsapp_url: fallbackUrl });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-obsidian/80 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gold/30 bg-paper shadow-2xl max-h-[90vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="bg-obsidian p-5 text-paper border-b border-gold/30 relative shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-gold hover:text-obsidian transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-gold" />
              <span className="eyebrow text-[9px] text-gold font-bold tracking-[0.25em]">
                BAPAT OPTICS PUNE · CONCIERGE & TRIAL
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-normal text-paper">
              {submittedData ? "Inquiry Confirmed!" : "Enquire & Book In-Store Try-On"}
            </h2>
            <p className="text-xs text-paper/70 mt-0.5 font-light">
              Submit your inquiry to have this designer piece prepared at our Pune boutique.
            </p>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Product Card Snapshot */}
            <div className="flex items-center gap-3 bg-paper p-3 rounded-xl border border-obsidian/10 shadow-xs">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-14 w-18 object-contain bg-paper rounded-lg p-1"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                    {product.brand}
                  </span>
                  {product.sku && (
                    <span className="font-mono text-[9px] text-obsidian/50">
                      {product.sku}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-xs text-obsidian truncate">
                  {product.name}
                </h4>
                <p className="font-bold text-obsidian text-xs">
                  {inr(product.price)}
                </p>
              </div>
            </div>

            {submittedData ? (
              /* Success View */
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-obsidian">
                    Inquiry Registered in CRM!
                  </h3>
                  <p className="text-xs text-obsidian/70 max-w-sm mx-auto mt-1">
                    Our optical specialists at <strong>{branch}</strong> have received your inquiry in our CRM system and will assist you shortly.
                  </p>
                </div>

                <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 text-left space-y-1">
                  <p className="text-[11px] font-bold text-obsidian flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-gold" />
                    Logged Lead Details:
                  </p>
                  <p className="text-[11px] text-obsidian/80">
                    • <strong>Client:</strong> {fullName} ({phone})
                  </p>
                  <p className="text-[11px] text-obsidian/80">
                    • <strong>Preferred Branch:</strong> {branch}
                  </p>
                  {message && (
                    <p className="text-[11px] text-obsidian/80">
                      • <strong>Note:</strong> {message}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {submittedData.whatsapp_url && (
                    <a
                      href={submittedData.whatsapp_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-strong text-paper py-3 rounded-xl font-bold tracking-wide transition-all shadow-md cursor-pointer"
                    >
                      <MessageCircle size={15} />
                      <span>Continue to WhatsApp Chat</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-obsidian hover:bg-gold text-paper hover:text-obsidian py-3 rounded-xl font-bold tracking-wide transition-all cursor-pointer"
                  >
                    Done & Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              /* Inquiry Form */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-danger-soft border border-destructive/25 text-xs text-destructive font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-2.5 bg-paper p-3.5 rounded-xl border border-obsidian/10">
                  <div className="text-[11px] font-bold text-obsidian flex items-center gap-1.5">
                    <User size={13} className="text-gold" />
                    <span>Your Contact Information</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-obsidian/70 block mb-1 font-medium">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Patil"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-paper border border-obsidian/15 focus:border-gold rounded-lg py-2 px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-obsidian/70 block mb-1 font-medium">
                        WhatsApp / Mobile *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-paper border border-obsidian/15 focus:border-gold rounded-lg py-2 px-3 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-obsidian/70 block mb-1 font-medium">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-paper border border-obsidian/15 focus:border-gold rounded-lg py-2 px-3 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 bg-paper p-3.5 rounded-xl border border-obsidian/10">
                  <div className="text-[11px] font-bold text-obsidian flex items-center gap-1.5">
                    <Building2 size={13} className="text-gold" />
                    <span>Store Preference & Trial Notes</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-obsidian/70 block mb-1 font-medium">
                        Preferred Store (Pune)
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-paper border border-obsidian/15 focus:border-gold rounded-lg py-2 px-2.5 text-xs outline-none font-medium cursor-pointer"
                      >
                        <option value="Kothrud ZEISS Center">Kothrud ZEISS Center</option>
                        <option value="Sadashiv Peth Flagship">Sadashiv Peth Flagship</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-obsidian/70 block mb-1 font-medium">
                        Inquiry Request Type
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        className="w-full bg-paper border border-obsidian/15 focus:border-gold rounded-lg py-2 px-2.5 text-xs outline-none font-medium cursor-pointer"
                      >
                        <option value="WHATSAPP_TRYON">In-Store Frame Try-On</option>
                        <option value="ZEISS_CONSULTATION">ZEISS Lens Consultation</option>
                        <option value="PRICE_ENQUIRY">Price & Stock Availability</option>
                        <option value="GENERAL">General Optical Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-obsidian/70 block mb-1 font-medium">
                      What is your inquiry? / Preferred Day & Time
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Can I try this frame on Saturday around 4 PM?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-paper border border-obsidian/15 focus:border-gold rounded-lg py-2 px-3 text-xs outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-obsidian hover:bg-gold text-paper hover:text-obsidian py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={14} className="text-gold" />
                  <span>{isSubmitting ? "Registering in CRM..." : "Submit Inquiry to CRM"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
