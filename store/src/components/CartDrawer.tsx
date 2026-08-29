import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageError, FALLBACK_EYEWEAR_IMAGE } from '../utils/imageFallback';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount, 
    proceedToCheckout 
  } = useStore();

  if (!isCartOpen) return null;

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#0A0A0A]/10 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 bg-[#0A0A0A] text-white flex items-center justify-between border-b border-[#C6A15B]/30">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={18} className="text-[#C6A15B]" />
              <h2 className="font-display text-lg font-normal text-white">Your Eyewear Bag</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C6A15B] text-[10px] font-bold text-[#0A0A0A]">
                {cartCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F6F5F2]/40">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F5F2] text-[#0A0A0A]/30">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <p className="font-display text-lg text-[#0A0A0A]">Your bag is empty</p>
                  <p className="text-xs text-[#0A0A0A]/60 mt-1">Explore our curated collection of 65+ designer frames.</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="eyebrow inline-flex rounded-full bg-[#0A0A0A] px-6 py-2.5 text-[10px] font-bold text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemUnitTotal = item.product.price + item.lensPrice;
                return (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-xl bg-white border border-[#0A0A0A]/10 shadow-xs flex gap-3.5 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="h-20 w-20 rounded-lg bg-[#F6F5F2] p-1 border border-[#0A0A0A]/10 shrink-0 flex items-center justify-center">
                      <img 
                        src={item.product.primary_image || FALLBACK_EYEWEAR_IMAGE} 
                        alt="" 
                        onError={(e) => handleImageError(e, item.product.category?.slug)}
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="eyebrow text-[8px] text-[#0A0A0A]/50">{item.product.brand?.name}</p>
                      <h4 className="font-display text-sm text-[#0A0A0A] font-normal truncate">{item.product.name}</h4>
                      
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[11px] font-medium text-[#C6A15B] truncate">
                          {item.lensType || 'Frame Only'}
                        </p>
                        <p className="text-[10px] text-[#0A0A0A]/50 font-mono">
                          Dimensions: {item.product.dimensions_str}
                        </p>
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#0A0A0A]/5">
                        <div className="flex items-center gap-2 border border-[#0A0A0A]/15 rounded-md px-2 py-0.5 bg-[#F6F5F2]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-[#0A0A0A]/70 hover:text-black"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-[#0A0A0A]/70 hover:text-black"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#0A0A0A]">
                          {formatPrice(itemUnitTotal * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-3 right-3 text-[#0A0A0A]/30 hover:text-red-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#0A0A0A]/10 space-y-4">
              {/* Trust Badge */}
              <div className="flex items-center gap-2 rounded-lg bg-[#C6A15B]/10 p-2.5 text-[11px] text-[#A4813E]">
                <ShieldCheck size={14} className="shrink-0 text-[#C6A15B]" />
                <span>100% Zeiss Authentic Optics & Free Lifetime Fitting in Pune</span>
              </div>

              {/* Subtotal */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#0A0A0A]/70">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-[#0A0A0A]/70">
                  <span>Shipping & Clinic Fitting</span>
                  <span className="text-emerald-700 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#0A0A0A] pt-2 border-t border-[#0A0A0A]/10">
                  <span>Total Amount</span>
                  <span className="font-display text-lg">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => {
                  proceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
              >
                <span>Proceed to Razorpay Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
