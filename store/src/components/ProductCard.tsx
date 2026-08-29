import React, { useState } from 'react';
import { Eye, MessageCircle, ShoppingBag, Check, Zap, Sparkles, Share2, AlertCircle } from 'lucide-react';
import type { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { handleImageError, FALLBACK_EYEWEAR_IMAGE } from '../utils/imageFallback';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { 
    setQuickViewProduct, 
    setLensProduct, 
    setTryOnProduct, 
    addToCart, 
    buyNow, 
    shareProduct, 
    getCartItemQuantity,
    customerUser
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleOpenTryOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTryOnProduct(product);
  };

  const qtyInCart = getCartItemQuantity(product.id, 'FRAME_ONLY');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 'FRAME_ONLY', 0);
    if (customerUser) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <article 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-xs transition-all duration-500 ${
        isOutOfStock 
          ? 'border-red-200/80 hover:border-red-300 opacity-95' 
          : 'border-[#0A0A0A]/10 hover:border-[#C6A15B]/60 hover:shadow-xl hover:shadow-[#C6A15B]/10'
      }`}
    >
      {/* Visual Top Container */}
      <div className="relative">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          {isOutOfStock ? (
            <span className="eyebrow rounded bg-red-600 px-2 py-0.5 text-[8px] font-bold tracking-wider text-white shadow-xs">
              Out of Stock
            </span>
          ) : (
            <span className="eyebrow rounded bg-[#0A0A0A]/90 px-2 py-0.5 text-[8px] tracking-wider text-white backdrop-blur-xs">
              {product.brand?.name || 'Designer'}
            </span>
          )}

          {product.is_bestseller && !isOutOfStock && (
            <span className="eyebrow rounded border border-[#C6A15B]/40 bg-[#C6A15B]/15 px-2 py-0.5 text-[8px] tracking-wider text-[#A4813E] font-semibold">
              Bestseller
            </span>
          )}

          {product.category?.name && (
            <span className="eyebrow hidden sm:inline-block rounded bg-[#F6F5F2] px-2 py-0.5 text-[8px] tracking-wider text-[#0A0A0A]/70">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Top Right: Cart Count Badge & Quick Share */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
          {qtyInCart > 0 && (
            <span className="eyebrow inline-flex items-center gap-1 rounded-full bg-[#0A0A0A] border border-[#C6A15B]/60 px-2 py-0.5 text-[8px] font-bold text-[#C6A15B] shadow-md animate-in zoom-in-75 duration-200">
              <Check size={9} className="text-emerald-400" />
              <span>{qtyInCart} in bag</span>
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              shareProduct(product);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#0A0A0A] hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-all shadow-sm opacity-80 hover:opacity-100 cursor-pointer"
            title="Share product link"
          >
            <Share2 size={13} />
          </button>
        </div>

        {/* Product Images with Dual-Angle Swap & Image Error Fallback */}
        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          className="relative aspect-4/3 w-full overflow-hidden bg-[#F6F5F2]/70 p-4 block focus:outline-none cursor-pointer"
        >
          <img
            src={product.primary_image || FALLBACK_EYEWEAR_IMAGE}
            alt={`${product.brand?.name || ''} ${product.name}`}
            loading="lazy"
            onError={(e) => handleImageError(e, product.category?.slug)}
            className={`h-full w-full object-contain object-center transition-all duration-700 ease-out ${
              isOutOfStock ? 'grayscale-[30%]' : ''
            } ${
              isHovered && product.secondary_image ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          {product.secondary_image && (
            <img
              src={product.secondary_image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              onError={(e) => handleImageError(e, product.category?.slug)}
              className={`absolute inset-0 h-full w-full object-contain object-center p-4 transition-all duration-700 ease-out ${
                isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
              }`}
            />
          )}

          {/* Quick View Hover Pill */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/30 backdrop-blur-2xs transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="eyebrow flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[9px] font-bold text-[#0A0A0A] shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Eye size={12} className="text-[#C6A15B]" /> Quick View Details
            </span>
          </div>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow text-[9px] text-[#0A0A0A]/50">{product.brand?.name || 'Exclusive'}</p>
              <h3 
                onClick={() => setQuickViewProduct(product)}
                className="font-display mt-0.5 text-lg sm:text-xl font-normal text-[#0A0A0A] hover:text-[#C6A15B] transition-colors cursor-pointer line-clamp-1"
              >
                {product.name}
              </h3>
            </div>
            
            {/* Price */}
            <div className="text-right whitespace-nowrap">
              <p className="font-sans text-sm sm:text-base font-bold text-[#0A0A0A]">
                {formatPrice(product.price)}
              </p>
              {product.sale_price && (
                <p className="text-[10px] text-[#0A0A0A]/40 line-through">
                  {formatPrice(product.sale_price)}
                </p>
              )}
            </div>
          </div>

          {/* Specs & Dimensions */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-[#0A0A0A]/70">
            <span className="px-1.5 py-0.5 rounded bg-[#F6F5F2] font-mono text-[10px] text-[#0A0A0A]">
              {product.dimensions_str}
            </span>
            <span>•</span>
            <span className="truncate">{product.material}</span>
            <span>•</span>
            <span className="text-[10px] uppercase">{product.colour}</span>
          </div>

          {/* Pune Branch Trial / Stock Availability */}
          {isOutOfStock ? (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-red-600 font-semibold">
              <AlertCircle size={12} className="shrink-0" />
              <span>Currently Out of Stock online</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
              <Check size={12} className="shrink-0" />
              <span>{product.branch_stock ? Object.entries(product.branch_stock).filter(([, qty]) => qty > 0).map(([branch]) => branch.replace(' ZEISS Center','')).join(' · ') || 'Ready for Trial in Pune Stores' : 'Ready for Try-On at Kothrud & Sadashiv Peth'}</span>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="mt-4 pt-3.5 border-t border-[#0A0A0A]/10 space-y-2">
          {/* Primary Row: Add to Cart vs Buy Now or Out of Stock State */}
          {isOutOfStock ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled
                className="eyebrow inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-2.5 text-[9px] font-bold text-red-500 cursor-not-allowed"
              >
                <span>Out of Stock</span>
              </button>

              <button
                type="button"
                onClick={handleOpenTryOn}
                className="eyebrow inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C6A15B] bg-[#C6A15B]/15 hover:bg-[#C6A15B] text-[#A4813E] hover:text-[#0A0A0A] py-2.5 text-[9px] font-bold transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle size={12} />
                <span>Reserve in Store</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Add to Cart (Amazon-style in-place feedback) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`eyebrow inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[9px] font-bold transition-all shadow-xs cursor-pointer ${
                  justAdded
                    ? 'border border-emerald-600 bg-emerald-600 text-white scale-[0.98]'
                    : qtyInCart > 0
                    ? 'border border-[#C6A15B] bg-[#0A0A0A] text-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#0A0A0A]'
                    : 'border border-[#0A0A0A] bg-[#0A0A0A] text-white hover:bg-[#C6A15B] hover:border-[#C6A15B] hover:text-[#0A0A0A]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check size={12} className="animate-bounce" />
                    <span>Added ({qtyInCart})</span>
                  </>
                ) : qtyInCart > 0 ? (
                  <>
                    <ShoppingBag size={12} />
                    <span>+ Add More ({qtyInCart})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={12} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  buyNow(product, 'FRAME_ONLY', 0);
                }}
                className="eyebrow inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C6A15B] bg-gradient-to-r from-[#C6A15B] to-[#A4813E] py-2.5 text-[9px] font-bold text-[#0A0A0A] transition-all hover:opacity-90 shadow-xs cursor-pointer"
              >
                <Zap size={12} className="fill-current" />
                <span>Buy Now</span>
              </button>
            </div>
          )}

          {/* Secondary Row: Try In-Store (WhatsApp) & + Zeiss Lenses */}
          {!isOutOfStock && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenTryOn}
                className="eyebrow inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0A0A0A]/20 bg-white py-1.5 text-[9px] font-semibold text-[#0A0A0A] transition-all hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/5 cursor-pointer"
              >
                <MessageCircle size={11} className="text-[#25D366]" />
                <span>Try In-Store</span>
              </button>

              <button
                type="button"
                onClick={() => setLensProduct(product)}
                className="eyebrow inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C6A15B]/30 bg-[#C6A15B]/10 py-1.5 text-[9px] font-bold text-[#A4813E] transition-all hover:bg-[#C6A15B] hover:text-[#0A0A0A] cursor-pointer"
              >
                <Sparkles size={11} className="text-[#C6A15B]" />
                <span>+ Zeiss Lenses</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
