import React, { useState } from 'react';
import { X, Check, Sparkles, ShoppingBag, Upload, ShieldCheck, Eye, Sun, Cpu } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { LensPackage } from '../types/store';

const LENS_PACKAGES: LensPackage[] = [
  {
    id: 'FRAME_ONLY',
    name: 'Frame Only (Zero Power Demo Lenses)',
    brand: 'Standard',
    price: 0,
    description: 'Receive frame as-is with factory demo lenses. Perfect if you plan to fit lenses locally or wear as a style accessory.',
    features: ['Original designer frame & luxury case', 'Factory acrylic demo lenses', 'Free in-store fitting in Pune anytime']
  },
  {
    id: 'SINGLE_VISION_CLEAR',
    name: 'Single Vision Clear + Anti-Reflective Coating',
    brand: 'Carl Zeiss / Essilor',
    price: 1900,
    badge: 'Popular Everyday',
    description: 'Crystal-clear index 1.56 optical lenses with multi-layer green anti-glare, scratch resistance, and hydrophobic clean coat.',
    features: ['Anti-Reflective ARC Coating', 'Scratch Resistant Hard Coat', 'UV400 100% Protection', 'Ultra-easy to clean']
  },
  {
    id: 'SINGLE_VISION_BLUEBLOCK',
    name: 'Single Vision BlueGuard™ Digital Screen Shield',
    brand: 'Zeiss BlueGuard',
    price: 2900,
    badge: 'Recommended for Screens',
    description: 'Engineered specifically for heavy laptop and smartphone users. Filters 40% of harmful blue-violet light with minimal residual yellow tint.',
    features: ['High-energy visible (HEV) blue light absorption', 'Reduced digital eye strain & headache relief', 'Premium anti-static coating', 'Night driving glare reduction']
  },
  {
    id: 'ZEISS_PHOTOFUSION_X',
    name: 'ZEISS PhotoFusion® X Adaptive Self-Tinting',
    brand: 'Carl Zeiss Germany',
    price: 6500,
    badge: 'Smart Transition',
    description: 'Latest generation fast light-adaptive lenses. Clears indoors 2.5x faster and darkens to rich sunglass tint within seconds in Pune sunlight.',
    features: ['100% UV400 Protection in all states', 'BlueGuard blue light filtration indoors', 'Turns dark grey in sunlight', 'Zeiss laser engraving authenticity']
  },
  {
    id: 'ZEISS_SMARTLIFE_PROGRESSIVE',
    name: 'ZEISS SmartLife® Individual Progressive (Multifocal)',
    brand: 'Carl Zeiss Germany',
    price: 9800,
    badge: 'Master Optical Craft',
    description: 'Digital freeform customized progressive lenses for smooth seamless vision from reading phone to driving distance without head straining.',
    features: ['Ultra-wide corridor for reading & desktop', 'Visufit 1000 3D sub-millimetre centration', 'Zero distortion peripheral gaze', 'Lifetime Zeiss optical warranty']
  }
];

export const LensConfiguratorModal: React.FC = () => {
  const { lensProduct, setLensProduct, addToCart } = useStore();
  const [selectedLensId, setSelectedLensId] = useState<string>('FRAME_ONLY');
  const [prescriptionOption, setPrescriptionOption] = useState<'upload' | 'whatsapp' | 'manual'>('whatsapp');
  const [rxNotes, setRxNotes] = useState('');

  if (!lensProduct) return null;

  const product = lensProduct;
  const currentLens = LENS_PACKAGES.find(p => p.id === selectedLensId) || LENS_PACKAGES[0];
  const totalPrice = product.price + currentLens.price;

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleAddWithLenses = () => {
    addToCart(
      product,
      currentLens.name,
      currentLens.price,
      `Rx Method: ${prescriptionOption.toUpperCase()}${rxNotes ? ` | Notes: ${rxNotes}` : ''}`
    );
    setLensProduct(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
      onClick={() => setLensProduct(null)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#C6A15B]/40 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] text-white border-b border-[#C6A15B]/30">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[#C6A15B]" />
            <div>
              <h2 className="font-display text-lg sm:text-xl font-normal text-white">
                Zeiss Precision Lens Configurator
              </h2>
              <p className="text-[11px] text-[#B8BCC2]">
                Customizing: <strong className="text-white">{product.brand?.name} {product.name}</strong> ({product.dimensions_str})
              </p>
            </div>
          </div>
          <button
            onClick={() => setLensProduct(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F6F5F2]/50 text-[#0A0A0A]">
          {/* Step 1: Select Lens Package */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                Step 1: Choose Your Optical Lenses
              </h3>
              <span className="text-[11px] text-[#A4813E] font-medium">All lenses fitted in Pune Zeiss Lab</span>
            </div>

            <div className="space-y-3">
              {LENS_PACKAGES.map((pkg) => {
                const isSelected = selectedLensId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedLensId(pkg.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-[#C6A15B] shadow-md ring-2 ring-[#C6A15B]/20'
                        : 'border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0A0A0A]' : 'border-[#0A0A0A]/30'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#0A0A0A]">{pkg.name}</span>
                            {pkg.badge && (
                              <span className="eyebrow rounded-full bg-[#C6A15B]/15 px-2 py-0.5 text-[8px] font-bold text-[#A4813E]">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#0A0A0A]/70 mt-1 leading-relaxed">{pkg.description}</p>
                        </div>
                      </div>

                      <div className="text-right sm:pl-4">
                        <span className="text-sm font-bold text-[#0A0A0A]">
                          {pkg.price === 0 ? 'Included' : `+${formatPrice(pkg.price)}`}
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-[#0A0A0A]/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[#0A0A0A]/80">
                        {pkg.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-[#C6A15B] shrink-0" />
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Prescription Method (Only if not frame only) */}
          {selectedLensId !== 'FRAME_ONLY' && (
            <div className="bg-white p-5 rounded-xl border border-[#0A0A0A]/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                Step 2: How would you like to provide your Prescription?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPrescriptionOption('whatsapp')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    prescriptionOption === 'whatsapp'
                      ? 'border-[#25D366] bg-[#25D366]/10 font-semibold text-[#0A0A0A]'
                      : 'border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40'
                  }`}
                >
                  <span className="block font-bold text-emerald-800">📱 WhatsApp Later</span>
                  <span className="text-[11px] text-[#0A0A0A]/70">Send Rx photo after checkout to our optometrist</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrescriptionOption('upload')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    prescriptionOption === 'upload'
                      ? 'border-[#C6A15B] bg-[#C6A15B]/10 font-semibold text-[#0A0A0A]'
                      : 'border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40'
                  }`}
                >
                  <span className="block font-bold text-[#A4813E]">📷 Upload Photo</span>
                  <span className="text-[11px] text-[#0A0A0A]/70">Attach prescription image during checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrescriptionOption('manual')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    prescriptionOption === 'manual'
                      ? 'border-[#C6A15B] bg-[#C6A15B]/10 font-semibold text-[#0A0A0A]'
                      : 'border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40'
                  }`}
                >
                  <span className="block font-bold text-[#0A0A0A]">🏥 Free Eye Test in Pune</span>
                  <span className="text-[11px] text-[#0A0A0A]/70">Get tested for free at Kothrud or Sadashiv Peth</span>
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional power specs or special requests (e.g. SPH -1.50, CYL -0.50 Axis 90)..."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="px-6 py-4 bg-white border-t border-[#0A0A0A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#F6F5F2] p-1 border border-[#0A0A0A]/10 shrink-0">
              <img src={product.primary_image} alt="" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[11px] text-[#0A0A0A]/60">Total Estimated Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#0A0A0A]">{formatPrice(totalPrice)}</span>
                <span className="text-xs text-[#0A0A0A]/50">
                  (Frame {formatPrice(product.price)} + Lenses {formatPrice(currentLens.price)})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddWithLenses}
            className="flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] px-8 py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md"
          >
            <ShoppingBag size={14} />
            <span>Confirm & Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
