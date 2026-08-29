import React, { useState } from 'react';
import { X, MessageCircle, ShoppingBag, Check, Sparkles, MapPin, Ruler, Zap, ShieldCheck, Share2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageError, FALLBACK_EYEWEAR_IMAGE } from '../utils/imageFallback';

export const ProductDetailModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    setLensProduct, 
    setTryOnProduct, 
    addToCart, 
    buyNow, 
    shareProduct,
    getCartItemQuantity,
    customerUser
  } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const qtyInCart = getCartItemQuantity(product.id, 'FRAME_ONLY');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 'FRAME_ONLY', 0);
    if (customerUser) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } else {
      setQuickViewProduct(null);
    }
  };

  const allImages = [
    product.primary_image || FALLBACK_EYEWEAR_IMAGE,
    ...(product.secondary_image ? [product.secondary_image] : []),
    ...(product.images ? product.images.map(img => img.image_url) : [])
  ].filter(Boolean);

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
      onClick={() => setQuickViewProduct(null)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:grid lg:grid-cols-12 max-h-[92vh] border border-[#C6A15B]/30 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Action Buttons (Share & Close) */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => shareProduct(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A0A0A]/80 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors shadow-md text-[10px] font-bold cursor-pointer"
            title="Share this frame via Link or Apps"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            onClick={() => setQuickViewProduct(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A]/80 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors shadow-md cursor-pointer"
            aria-label="Close product view"
          >
            <X size={16} />
          </button>
        </div>

        {/* Left: Gallery & Dimensions Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-[#F6F5F2] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#0A0A0A]/10 overflow-y-auto max-h-[92vh]">
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className="eyebrow rounded bg-[#0A0A0A] px-2.5 py-1 text-[9px] text-white">
                {product.brand?.name || 'Exclusive'}
              </span>
              <span className="eyebrow rounded border border-[#C6A15B]/40 bg-[#C6A15B]/15 px-2.5 py-1 text-[9px] text-[#A4813E] font-semibold">
                {product.category?.name || 'Eyewear'}
              </span>
              <span className="text-[10px] text-[#0A0A0A]/50 font-mono">
                SKU: {product.sku}
              </span>
            </div>

            {/* Main Stage Image with Error Fallback */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-white p-6 shadow-xs flex items-center justify-center">
              <img
                src={allImages[activeImageIndex] || product.primary_image || FALLBACK_EYEWEAR_IMAGE}
                alt={`${product.brand?.name || ''} ${product.name}`}
                onError={(e) => handleImageError(e, product.category?.slug)}
                className="max-h-full max-w-full object-contain transition-all duration-300"
              />
            </div>

            {/* Thumbnail Selectors */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2.5 mt-4 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-14 w-14 rounded-lg bg-white p-1 border transition-all overflow-hidden shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#C6A15B] ring-2 ring-[#C6A15B]/40'
                        : 'border-[#0A0A0A]/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      onError={(e) => handleImageError(e, product.category?.slug)}
                      className="h-full w-full object-contain" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Frame Dimensions Breakdown */}
          <div className="mt-6 pt-5 border-t border-[#0A0A0A]/10 bg-white/70 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0A] mb-2.5">
              <Ruler size={14} className="text-[#C6A15B]" />
              <span>Optical Dimensions Breakdown ({product.dimensions_str})</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#F6F5F2] p-2 rounded-md">
                <span className="text-[10px] text-[#0A0A0A]/60 uppercase block">Lens Width</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{product.lens_width || 53} mm</span>
              </div>
              <div className="bg-[#F6F5F2] p-2 rounded-md">
                <span className="text-[10px] text-[#0A0A0A]/60 uppercase block">Bridge</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{product.bridge_width || 18} mm</span>
              </div>
              <div className="bg-[#F6F5F2] p-2 rounded-md">
                <span className="text-[10px] text-[#0A0A0A]/60 uppercase block">Temple</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{product.temple_length || 140} mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Specs, Pricing, Buy Actions & Try-On Booking (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[92vh] pt-14 lg:pt-10 space-y-4">
          <div>
            <p className="eyebrow text-[10px] text-[#A4813E] font-bold tracking-wider">
              {product.brand?.name || 'Exclusive Eyewear'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#0A0A0A] leading-tight mt-1">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-[#0A0A0A]">
                {formatPrice(product.price)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-[#0A0A0A]/40 line-through">
                  {formatPrice(product.sale_price)}
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed text-[#0A0A0A]/70 mt-3">
              {product.description ||
                "Handcrafted precision eyewear silhouette designed for all-day comfort. Engineered for seamless pairing with custom Carl Zeiss optical lenses."}
            </p>

            {/* Technical Specifications Grid */}
            <div className="my-5 border-t border-b border-[#0A0A0A]/10 py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Material</span>
                <span className="font-medium text-[#0A0A0A]">{product.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Frame Type</span>
                <span className="font-medium text-[#0A0A0A]">{product.frame_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Frame Shape</span>
                <span className="font-medium text-[#0A0A0A]">{product.frame_shape}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Colour</span>
                <span className="font-medium text-[#0A0A0A] uppercase">{product.colour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Gender</span>
                <span className="font-medium text-[#0A0A0A]">{product.gender}</span>
              </div>
            </div>

            {/* PRIMARY PURCHASE OPTIONS */}
            <div className="space-y-2.5 bg-white p-4 rounded-xl border border-[#C6A15B]/30 shadow-xs mb-5">
              <div className="flex items-center justify-between text-xs font-bold text-[#0A0A0A]">
                <span>Purchase Options</span>
                {product.stock_quantity <= 0 ? (
                  <span className="text-red-600 font-semibold flex items-center gap-1 text-[11px]">
                    <X size={12} /> Currently Out of Stock
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                    <Check size={12} /> In Stock (Pune)
                  </span>
                )}
              </div>

              {product.stock_quantity <= 0 ? (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 rounded-xl text-xs font-bold bg-red-50 text-red-500 border border-red-200 cursor-not-allowed"
                  >
                    Out of Stock Online
                  </button>
                  <p className="text-[11px] text-[#0A0A0A]/60 text-center">
                    Reserve this frame below for an in-store trial at Kothrud or Sadashiv Peth.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-600 text-white scale-[0.99]'
                        : qtyInCart > 0
                        ? 'bg-[#0A0A0A] border border-[#C6A15B] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#0A0A0A]'
                        : 'bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A]'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check size={14} className="animate-bounce" />
                        <span>Added to Cart ({qtyInCart})</span>
                      </>
                    ) : qtyInCart > 0 ? (
                      <>
                        <ShoppingBag size={14} />
                        <span>+ Add Another to Bag ({qtyInCart} in bag) — {formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Add to Cart — {formatPrice(product.price)}</span>
                      </>
                    )}
                  </button>

                  {/* 2. Buy Now */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      buyNow(product, 'FRAME_ONLY', 0);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C6A15B] to-[#A4813E] hover:opacity-90 text-[#0A0A0A] py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    <Zap size={14} className="fill-current" />
                    <span>Buy Now (Direct Checkout)</span>
                  </button>

                  {/* 3. Customize with Zeiss Lenses */}
                  <button
                    type="button"
                    onClick={() => {
                      setQuickViewProduct(null);
                      setLensProduct(product);
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-[#C6A15B] bg-[#C6A15B]/10 hover:bg-[#C6A15B] text-[#0A0A0A] hover:text-white py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#C6A15B]" />
                    <span>+ Add Custom ZEISS Prescription Lenses</span>
                  </button>
                </>
              )}
            </div>

            {/* 1-Click WhatsApp In-Store Try-On Reservation */}
            <div className="bg-[#F6F5F2] p-4 rounded-xl space-y-3 border border-[#0A0A0A]/5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-[#25D366]" />
                  <span>Reserve Free In-Store Trial (Pune)</span>
                </div>
                <span className="text-[10px] text-[#A4813E] font-bold">Kothrud & Sadashiv Peth</span>
              </div>

              <p className="text-[11px] text-[#0A0A0A]/70 leading-relaxed font-light">
                Try this physical designer frame at either of our Pune optical boutiques with custom 3D digital centration by ZEISS specialists.
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuickViewProduct(null);
                  setTryOnProduct(product);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>Reserve Free Try-On & Consultation</span>
              </button>
            </div>

            {/* Share Frame Bar */}
            <div className="mt-4 pt-3 border-t border-[#0A0A0A]/10 flex items-center justify-between">
              <span className="text-[11px] text-[#0A0A0A]/60">Love this frame? Share with friends:</span>
              <button
                type="button"
                onClick={() => shareProduct(product)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0A0A0A]/15 hover:border-[#C6A15B] bg-[#F6F5F2] hover:bg-[#C6A15B]/10 text-xs font-semibold text-[#0A0A0A] transition-all cursor-pointer"
              >
                <Share2 size={12} className="text-[#C6A15B]" />
                <span>Share Link & Apps</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
