import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Search, 
  SlidersHorizontal,
  Sparkles,
  Glasses,
  Sun,
  Eye,
  Cpu,
  Smile,
  Package,
  Layers,
  Circle,
  Square,
  Hexagon
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Helper component for Shape SVG Icons
const ShapeGlyph: React.FC<{ shape: string; className?: string }> = ({ shape, className = "w-4 h-4" }) => {
  const s = shape.toUpperCase();
  if (s.includes('AVIATOR')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
        <path d="M4 8c0 0 1.5-2 4-2s4 2 4 2v6c0 2-1.5 4-4 4S4 16 4 14V8z" />
        <path d="M12 8c0 0 1.5-2 4-2s4 2 4 2v6c0 2-1.5 4-4 4s-4-2-4-4V8z" />
        <line x1="8" y1="6" x2="16" y2="6" />
      </svg>
    );
  }
  if (s.includes('CAT EYE')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
        <path d="M3 9c3-4 7-2 8 0v4c0 3-3 4-6 4s-3-2-2-8z" />
        <path d="M21 9c-3-4-7-2-8 0v4c0 3 3 4 6 4s3-2 2-8z" />
        <line x1="11" y1="9" x2="13" y2="9" />
      </svg>
    );
  }
  if (s.includes('WAYFARER')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
        <rect x="3" y="7" width="8" height="9" rx="1.5" />
        <rect x="13" y="7" width="8" height="9" rx="1.5" />
        <line x1="11" y1="9" x2="13" y2="9" />
      </svg>
    );
  }
  if (s.includes('ROUND') || s.includes('OVAL')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
        <circle cx="7.5" cy="12" r="4.5" />
        <circle cx="16.5" cy="12" r="4.5" />
        <line x1="12" y1="12" x2="12" y2="12" />
      </svg>
    );
  }
  if (s.includes('HEXAG')) {
    return <Hexagon className={className} />;
  }
  return <Square className={className} />;
};

// Category Icon Mapper
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'spectacle-frames': return <Glasses size={14} />;
    case 'sunglasses': return <Sun size={14} />;
    case 'spectacle-lenses': return <Sparkles size={14} />;
    case 'contact-lenses': return <Eye size={14} />;
    case 'meta': return <Cpu size={14} />;
    case 'kids': return <Smile size={14} />;
    case 'accessories': return <Package size={14} />;
    default: return <Layers size={14} />;
  }
};

export const FilterSidebar: React.FC = () => {
  const { 
    filters, 
    filterState, 
    toggleFilter, 
    setPriceRange, 
    resetFilters, 
    activeFilterCount 
  } = useStore();

  const [brandSearch, setBrandSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');

  // Accordion open/collapse states
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    gender: true,
    brands: true,
    shapes: true,
    colours: true,
    materials: false,
    frameTypes: false,
    price: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!filters) {
    return (
      <div className="w-full p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-[#0A0A0A]/10 rounded w-1/2"></div>
        <div className="h-20 bg-[#0A0A0A]/5 rounded"></div>
        <div className="h-40 bg-[#0A0A0A]/5 rounded"></div>
      </div>
    );
  }

  // Filtered brands list
  const filteredBrands = filters.brands.filter(b => 
    b.label.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Filtered materials list
  const filteredMaterials = filters.materials.filter(m =>
    m.label.toLowerCase().includes(materialSearch.toLowerCase())
  );

  return (
    <aside className="w-full space-y-6 text-xs text-[#0A0A0A]">
      {/* Sidebar Header & Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0A0A0A]/15">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#C6A15B]" />
          <h2 className="font-display text-base tracking-normal uppercase font-medium text-[#0A0A0A]">
            Refine Catalog
          </h2>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#A4813E] hover:text-[#0A0A0A] transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* 1. PRODUCT CATEGORIES (8) */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Product Categories</span>
            {filterState.categories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white text-[9px]">
                {filterState.categories.length}
              </span>
            )}
          </span>
          {expandedSections.categories ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.categories && (
          <div className="mt-3 space-y-1.5">
            {filters.categories.map((cat) => {
              const isSelected = filterState.categories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleFilter('categories', cat.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                    isSelected 
                      ? 'border-[#C6A15B] bg-[#C6A15B]/10 font-semibold text-[#0A0A0A] shadow-xs' 
                      : 'border-transparent hover:border-[#0A0A0A]/10 hover:bg-white text-[#0A0A0A]/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`${isSelected ? 'text-[#C6A15B]' : 'text-[#0A0A0A]/50'}`}>
                      {getCategoryIcon(cat.value)}
                    </span>
                    <span className="text-xs">{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-[#0A0A0A]/40 font-mono">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. GENDER (4) */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('gender')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span>Gender</span>
          {expandedSections.gender ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.gender && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {filters.genders.map((g) => {
              const isSelected = filterState.genders.includes(g.value);
              return (
                <button
                  key={g.value}
                  onClick={() => toggleFilter('genders', g.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md border text-xs transition-all ${
                    isSelected
                      ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white font-medium shadow-xs'
                      : 'border-[#0A0A0A]/15 bg-white text-[#0A0A0A] hover:border-[#C6A15B]'
                  }`}
                >
                  <span>{g.label}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#0A0A0A]/40'}`}>
                    {g.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. FRAME SHAPE (8) */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('shapes')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span>Frame Shape</span>
          {expandedSections.shapes ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.shapes && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {filters.frame_shapes.map((s) => {
              const isSelected = filterState.frame_shapes.includes(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => toggleFilter('frame_shapes', s.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs transition-all ${
                    isSelected
                      ? 'border-[#C6A15B] bg-[#C6A15B]/15 text-[#0A0A0A] font-semibold'
                      : 'border-[#0A0A0A]/15 bg-white hover:border-[#C6A15B] text-[#0A0A0A]/80'
                  }`}
                >
                  <ShapeGlyph shape={s.value} className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C6A15B]' : 'text-[#0A0A0A]/60'}`} />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. COLOUR SWATCHES (29) */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('colours')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Colour Palette</span>
            {filterState.colours.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white text-[9px]">
                {filterState.colours.length}
              </span>
            )}
          </span>
          {expandedSections.colours ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.colours && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {filters.colours.map((col) => {
                const isSelected = filterState.colours.includes(col.value);
                const hex = col.hex_color || '#94A3B8';
                return (
                  <button
                    key={col.value}
                    onClick={() => toggleFilter('colours', col.value)}
                    title={`${col.label} (${col.count})`}
                    className={`group relative flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                      isSelected 
                        ? 'ring-2 ring-[#0A0A0A] ring-offset-2 scale-110' 
                        : 'border-[#0A0A0A]/20 hover:scale-110'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <Check size={12} className={hex === '#F9FAFB' || hex === '#FFFFFF' || hex === '#E2E8F0' ? 'text-black' : 'text-white'} />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-[#0A0A0A]/50 italic">
              Hover over color swatches to preview shades (Solid, Matte, Havana, Titanium Gold).
            </p>
          </div>
        )}
      </div>

      {/* 5. 65+ BRANDS WITH SEARCH */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Brands (65+)</span>
            {filterState.brands.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white text-[9px]">
                {filterState.brands.length}
              </span>
            )}
          </span>
          {expandedSections.brands ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.brands && (
          <div className="mt-3 space-y-2">
            {/* Quick Search inside Brands */}
            <div className="relative">
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Find brand (e.g. Ray-Ban, Versace)..."
                className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-md py-1.5 pl-7 pr-3 text-[11px] outline-none"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredBrands.length === 0 ? (
                <p className="py-2 text-[11px] text-[#0A0A0A]/50 italic">No brand matches found.</p>
              ) : (
                filteredBrands.map((b) => {
                  const isSelected = filterState.brands.includes(b.value);
                  return (
                    <label
                      key={b.value}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilter('brands', b.value)}
                          className="h-3.5 w-3.5 rounded border-[#0A0A0A]/30 text-[#0A0A0A] focus:ring-[#C6A15B] accent-[#0A0A0A]"
                        />
                        <span className={`text-xs ${isSelected ? 'font-semibold text-[#0A0A0A]' : 'text-[#0A0A0A]/80'}`}>
                          {b.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#0A0A0A]/40 font-mono">
                        {b.count}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. 22+ MATERIALS */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('materials')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>Material (22+)</span>
            {filterState.materials.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white text-[9px]">
                {filterState.materials.length}
              </span>
            )}
          </span>
          {expandedSections.materials ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.materials && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search Titanium, Acetate, TR..."
                className="w-full bg-white border border-[#0A0A0A]/15 focus:border-[#C6A15B] rounded-md py-1.5 pl-7 pr-3 text-[11px] outline-none"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40" />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {filteredMaterials.map((m) => {
                const isSelected = filterState.materials.includes(m.value);
                return (
                  <label
                    key={m.value}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFilter('materials', m.value)}
                        className="h-3.5 w-3.5 rounded border-[#0A0A0A]/30 text-[#0A0A0A] focus:ring-[#C6A15B] accent-[#0A0A0A]"
                      />
                      <span className={`text-xs ${isSelected ? 'font-semibold text-[#0A0A0A]' : 'text-[#0A0A0A]/80'}`}>
                        {m.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#0A0A0A]/40 font-mono">{m.count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7. FRAME TYPE (FULL FRAME, SUPRA, RIMLESS, MFULL) */}
      <div className="border-b border-[#0A0A0A]/10 pb-5">
        <button
          onClick={() => toggleSection('frameTypes')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span>Frame Type</span>
          {expandedSections.frameTypes ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.frameTypes && (
          <div className="mt-3 space-y-1.5">
            {filters.frame_types.map((ft) => {
              const isSelected = filterState.frame_types.includes(ft.value);
              return (
                <label
                  key={ft.value}
                  className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFilter('frame_types', ft.value)}
                      className="h-3.5 w-3.5 rounded border-[#0A0A0A]/30 text-[#0A0A0A] focus:ring-[#C6A15B] accent-[#0A0A0A]"
                    />
                    <span className={`text-xs ${isSelected ? 'font-semibold text-[#0A0A0A]' : 'text-[#0A0A0A]/80'}`}>
                      {ft.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#0A0A0A]/40 font-mono">{ft.count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. PRICE RANGE */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-left font-semibold text-[13px] tracking-wide text-[#0A0A0A] hover:text-[#C6A15B] transition-colors"
        >
          <span>Price Range</span>
          {expandedSections.price ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#0A0A0A]">
              <span>₹{filterState.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{filterState.priceRange[1].toLocaleString('en-IN')}</span>
            </div>

            <input
              type="range"
              min={filters.min_price}
              max={filters.max_price}
              step={500}
              value={filterState.priceRange[1]}
              onChange={(e) => setPriceRange([filterState.priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#0A0A0A] cursor-pointer"
            />
            
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setPriceRange([0, 15000])}
                className="flex-1 py-1 px-2 rounded border border-[#0A0A0A]/15 bg-white text-[10px] font-medium hover:border-[#C6A15B]"
              >
                Under ₹15k
              </button>
              <button
                onClick={() => setPriceRange([15000, 30000])}
                className="flex-1 py-1 px-2 rounded border border-[#0A0A0A]/15 bg-white text-[10px] font-medium hover:border-[#C6A15B]"
              >
                ₹15k – ₹30k
              </button>
              <button
                onClick={() => setPriceRange([30000, filters.max_price])}
                className="flex-1 py-1 px-2 rounded border border-[#0A0A0A]/15 bg-white text-[10px] font-medium hover:border-[#C6A15B]"
              >
                ₹30k+
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
