import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  SlidersHorizontal, 
  User as UserIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const { 
    cartCount, 
    setIsCartOpen, 
    setIsAppointmentOpen, 
    filterState, 
    setSearch, 
    activeFilterCount, 
    setIsMobileFilterOpen,
    customerUser,
    setIsAuthModalOpen,
    customerLogout,
    openAccountModal
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#F6F5F2]/90 backdrop-blur-md border-b border-[#0A0A0A]/10 transition-all duration-300">
      {/* Main Luxury Navigation Bar (Sleek Compact Spacing) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Editorial Heritage */}
        <div className="flex items-center gap-3">
          <a href="/" className="group flex flex-col">
            <span className="font-display text-xl sm:text-2xl font-normal tracking-tight text-[#0A0A0A] group-hover:text-[#C6A15B] transition-colors leading-tight">
              BAPAT OPTICS
            </span>
            <span className="eyebrow text-[8px] sm:text-[9px] text-[#A4813E] font-medium tracking-[0.25em] -mt-0.5">
              Pune · Est. 2011 · Zeiss Center
            </span>
          </a>
        </div>

        {/* Global Catalog Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
          <div className="relative w-full">
            <input
              type="text"
              value={filterState.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 65+ brands, Ray-Ban Meta, Titanium frames, SKU..."
              className="w-full bg-white/80 border border-[#0A0A0A]/15 focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] rounded-full py-1.5 pl-9 pr-4 text-xs placeholder:text-[#0A0A0A]/40 outline-none transition-all shadow-xs"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
            {filterState.search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#0A0A0A]/40 hover:text-[#0A0A0A]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls: Eye Test, User Auth, Cart, Mobile Filter */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#0A0A0A]/20 bg-white text-xs font-medium text-[#0A0A0A] hover:border-[#C6A15B]"
          >
            <SlidersHorizontal size={13} className="text-[#C6A15B]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0A0A0A] text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Book Eye Test Modal Trigger */}
          <button
            onClick={() => setIsAppointmentOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C6A15B] bg-[#C6A15B]/10 hover:bg-[#C6A15B] text-[#0A0A0A] hover:text-white transition-all text-xs font-medium tracking-wide shadow-xs cursor-pointer"
          >
            <Calendar size={12} />
            <span>Book Zeiss Eye Test</span>
          </button>

          {/* Sign In / Customer Account Button */}
          {customerUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#0A0A0A]/15 bg-white hover:border-[#C6A15B] text-xs font-medium text-[#0A0A0A] transition-all shadow-xs cursor-pointer"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C6A15B] text-[#0A0A0A] font-bold text-[10px]">
                  {customerUser.full_name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{customerUser.full_name}</span>
                <ChevronDown size={11} className="text-[#0A0A0A]/50" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#0A0A0A]/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2.5 mb-2 border-b border-[#0A0A0A]/10">
                    <p className="text-xs font-bold text-[#0A0A0A] truncate">{customerUser.full_name}</p>
                    <p className="text-[11px] text-[#0A0A0A]/60 truncate">{customerUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#C6A15B]/15 text-[#A4813E] text-[9px] font-semibold">
                      VIP Client Account
                    </span>
                  </div>

                  <div className="space-y-1 mb-2">
                    <button
                      onClick={() => {
                        openAccountModal('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[#0A0A0A] hover:bg-[#F6F5F2] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-[#C6A15B]" />
                        <span className="font-medium">My Orders & Invoices</span>
                      </div>
                      <span className="text-[10px] text-[#A4813E] font-semibold">PDF</span>
                    </button>

                    <button
                      onClick={() => {
                        openAccountModal('appointments');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-[#0A0A0A] hover:bg-[#F6F5F2] transition-colors text-left"
                    >
                      <Calendar size={14} className="text-[#C6A15B]" />
                      <span className="font-medium">Eye Test Bookings</span>
                    </button>

                    <button
                      onClick={() => {
                        openAccountModal('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-[#0A0A0A] hover:bg-[#F6F5F2] transition-colors text-left"
                    >
                      <UserIcon size={14} className="text-[#C6A15B]" />
                      <span className="font-medium">Profile & Password</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#0A0A0A]/10">
                    <button
                      onClick={() => {
                        customerLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0A0A0A]/20 bg-white hover:border-[#C6A15B] hover:text-[#C6A15B] text-[#0A0A0A] transition-all text-xs font-semibold shadow-xs cursor-pointer"
            >
              <UserIcon size={12} className="text-[#C6A15B]" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Slide-over Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-[#F6F5F2] hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-all text-xs font-medium shadow-md group cursor-pointer"
          >
            <ShoppingBag size={13} className="transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Bag</span>
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#C6A15B] group-hover:bg-[#0A0A0A] text-[9px] font-bold text-[#0A0A0A] group-hover:text-white transition-colors">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative w-full">
          <input
            type="text"
            value={filterState.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frames, sunglasses, brands..."
            className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-full py-2 pl-9 pr-4 text-xs placeholder:text-[#0A0A0A]/40 outline-none"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
        </div>
      </div>
    </header>
  );
};
