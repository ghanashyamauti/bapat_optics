import React from 'react';
import { 
  Sparkles, 
  X, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LensConfiguratorModal } from './components/LensConfiguratorModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { TryOnInquiryModal } from './components/TryOnInquiryModal';
import { EyeTestBookingModal } from './components/EyeTestBookingModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { Footer } from './components/Footer';

const CatalogContent: React.FC = () => {
  const {
    products,
    totalProducts,
    totalPages,
    isLoading,
    filterState,
    setSortBy,
    setPage,
    toggleFilter,
    resetFilters,
    activeFilterCount,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    setIsAppointmentOpen,
    isAccountModalOpen,
    setIsAccountModalOpen,
    accountModalTab
  } = useStore();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero / Catalog Showcase Banner (Compact spacing) */}
        <section className="relative bg-[#0A0A0A] text-white py-3 sm:py-4 px-4 sm:px-6 overflow-hidden border-b border-[#C6A15B]/30">
          {/* Subtle gold ambient glow */}
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#C6A15B]/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-[#C6A15B]/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-px w-6 bg-[#C6A15B]" />
                  <span className="eyebrow text-[9px] text-[#C6A15B] font-semibold tracking-[0.2em]">
                    Complete Optical Inventory
                  </span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-white font-light tracking-tight">
                  Designer Frames & Zeiss Optics
                </h1>
                <p className="text-[11px] sm:text-xs text-[#B8BCC2] max-w-2xl mt-0.5 leading-normal font-light">
                  Explore 65+ luxury eyewear houses, Ray-Ban Meta smart glasses & German Zeiss ophthalmic lenses in Pune.
                </p>
              </div>

              {/* Free eye test quick CTA (Compact) */}
              <div className="shrink-0 flex items-center gap-2.5 bg-white/5 border border-[#C6A15B]/30 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C6A15B]/20 text-[#C6A15B]">
                  <Sparkles size={13} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white leading-tight">Free Digital Eye Test</p>
                  <p className="text-[9px] text-[#B8BCC2]">Kothrud & Sadashiv Peth</p>
                </div>
                <button
                  onClick={() => setIsAppointmentOpen(true)}
                  className="eyebrow ml-1 rounded-lg bg-[#C6A15B] px-2.5 py-1 text-[9px] font-bold text-[#0A0A0A] hover:bg-white transition-colors cursor-pointer"
                >
                  Book Slot
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Catalog View Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Desktop Sticky Filter Sidebar (3 cols) */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white/60 p-5 rounded-2xl border border-[#0A0A0A]/10 shadow-xs backdrop-blur-xs">
              <FilterSidebar />
            </div>

            {/* Products Grid & Toolbar (9 cols) */}
            <div id="catalog-grid" className="lg:col-span-9 space-y-6">
              
              {/* Toolbar: Count, Active Filter Chips, Sort Selector */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#0A0A0A]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#0A0A0A]/80 font-medium">
                    Showing <strong className="text-[#0A0A0A] font-mono text-sm">{products.length}</strong> of{' '}
                    <strong className="text-[#0A0A0A] font-mono text-sm">{totalProducts}</strong> luxury eyewear styles
                  </p>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-[#0A0A0A]/50 shrink-0" />
                  <span className="text-xs text-[#0A0A0A]/70 whitespace-nowrap">Sort by:</span>
                  <select
                    value={filterState.sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-1.5 text-xs text-[#0A0A0A] font-semibold outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="bestseller">Bestsellers First</option>
                    <option value="newest">New Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips Bar */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#0A0A0A]/60 font-semibold uppercase tracking-wider">
                    Active Filters:
                  </span>

                  {filterState.categories.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 bg-white border border-[#0A0A0A]/20 px-2.5 py-1 rounded-full text-[11px] text-[#0A0A0A]"
                    >
                      <span>Category: {c}</span>
                      <button onClick={() => toggleFilter('categories', c)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {filterState.brands.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 bg-white border border-[#C6A15B] bg-[#C6A15B]/10 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#A4813E]"
                    >
                      <span>{b}</span>
                      <button onClick={() => toggleFilter('brands', b)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {filterState.colours.map((col) => (
                    <span
                      key={col}
                      className="inline-flex items-center gap-1 bg-white border border-[#0A0A0A]/20 px-2.5 py-1 rounded-full text-[11px] text-[#0A0A0A]"
                    >
                      <span>Color: {col}</span>
                      <button onClick={() => toggleFilter('colours', col)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {filterState.frame_shapes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 bg-white border border-[#0A0A0A]/20 px-2.5 py-1 rounded-full text-[11px] text-[#0A0A0A]"
                    >
                      <span>Shape: {s}</span>
                      <button onClick={() => toggleFilter('frame_shapes', s)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {filterState.materials.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 bg-white border border-[#0A0A0A]/20 px-2.5 py-1 rounded-full text-[11px] text-[#0A0A0A]"
                    >
                      <span>Material: {m}</span>
                      <button onClick={() => toggleFilter('materials', m)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-red-600 hover:underline font-semibold ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="h-80 bg-white/60 rounded-xl animate-pulse border border-[#0A0A0A]/5" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-[#0A0A0A]/10 text-center space-y-4 shadow-xs">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F5F2] text-[#0A0A0A]/30">
                    <Search size={28} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-[#0A0A0A]">No Matching Eyewear Found</h3>
                    <p className="text-xs text-[#0A0A0A]/60 mt-1 max-w-md mx-auto">
                      Try broadening your search filters or resetting brand selections. We have over 500+ physical frames across our Pune stores.
                    </p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="eyebrow inline-flex rounded-full bg-[#0A0A0A] px-6 py-2.5 text-[10px] font-bold text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={filterState.page <= 1}
                    onClick={() => setPage(filterState.page - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] disabled:opacity-30 hover:border-[#C6A15B]"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-mono font-bold transition-all ${
                        filterState.page === pg
                          ? 'bg-[#0A0A0A] text-white shadow-xs'
                          : 'border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] hover:border-[#C6A15B]'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    disabled={filterState.page >= totalPages}
                    onClick={() => setPage(filterState.page + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] disabled:opacity-30 hover:border-[#C6A15B]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Slide-over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div 
            className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#0A0A0A]/10 mb-4">
                  <h3 className="font-display text-lg text-[#0A0A0A]">Filter Catalog</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F5F2]"
                  >
                    <X size={16} />
                  </button>
                </div>
                <FilterSidebar />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full mt-6 bg-[#0A0A0A] text-white py-3 rounded-xl text-xs font-bold"
              >
                Apply Filters ({products.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <LensConfiguratorModal />
      <CartDrawer />
      <CheckoutModal />
      <CustomerAuthModal />
      <TryOnInquiryModal />
      <EyeTestBookingModal />
      <CustomerAccountModal
        isOpen={isAccountModalOpen}
        initialTab={accountModalTab}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <CatalogContent />
    </StoreProvider>
  );
}
