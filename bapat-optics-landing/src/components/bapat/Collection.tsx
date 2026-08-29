import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Eye, MessageCircle, Sparkles, Check, ArrowUpRight, ShoppingBag, Share2 } from "lucide-react";
import { inr, products as fallbackProducts } from "@/data/site";
import { usePrefersReducedMotion } from "./hooks";
import { LandingInquiryModal } from "./LandingInquiryModal";

const FALLBACK_FRAME_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23F6F5F2"/><circle cx="210" cy="200" r="65" stroke="%230A0A0A" stroke-width="8" fill="white"/><circle cx="390" cy="200" r="65" stroke="%230A0A0A" stroke-width="8" fill="white"/><path d="M275 190 Q300 175 325 190" stroke="%23C6A15B" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M145 195 L90 185" stroke="%230A0A0A" stroke-width="6" stroke-linecap="round"/><path d="M455 195 L510 185" stroke="%230A0A0A" stroke-width="6" stroke-linecap="round"/><text x="300" y="310" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="%23A4813E" letter-spacing="3">BAPAT OPTICS · PUNE</text><text x="300" y="335" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%23666666">Carl Zeiss Vision Center</text></svg>`;

export interface LandingProduct {
  id: string;
  sku?: string;
  name: string;
  brand: string;
  price: number;
  sale_price?: number;
  category: string;
  categorySlug?: string;
  image: string;
  imageAlt?: string;
  material: string;
  dimensions_str?: string;
}

function ProductVisual({ product, hovered }: { product: LandingProduct; hovered: boolean }) {
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_FRAME_SVG;
  };

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-bone/60 p-4 transition-colors group-hover:bg-bone">
      <img
        src={product.image || FALLBACK_FRAME_SVG}
        alt={`${product.brand} ${product.name}`}
        loading="lazy"
        decoding="async"
        onError={handleImgError}
        className={`h-full w-full object-contain object-center transition-all duration-700 ease-out ${
          hovered && product.imageAlt ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      {product.imageAlt && (
        <img
          src={product.imageAlt}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={handleImgError}
          className={`absolute inset-0 h-full w-full object-contain object-center p-4 transition-all duration-700 ease-out ${
            hovered ? "scale-105 opacity-100" : "scale-100 opacity-0"
          }`}
        />
      )}
    </div>
  );
}

function ProductCard({
  product,
  onOpen,
  onEnquire,
  onShare,
  storeUrl,
}: {
  product: LandingProduct;
  onOpen: (p: LandingProduct) => void;
  onEnquire: (p: LandingProduct) => void;
  onShare: (p: LandingProduct) => void;
  storeUrl: string;
}) {
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReducedMotion();
  const directStoreProductUrl = `${storeUrl}/?product=${encodeURIComponent(product.id)}`;

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-obsidian/10 bg-paper shadow-sm transition-all duration-500 hover:border-gold/60 hover:shadow-xl hover:shadow-gold/5"
    >
      <div className="relative">
        {/* Badges */}
        <div className="absolute left-3.5 top-3.5 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="eyebrow rounded bg-obsidian/90 px-2.5 py-1 text-[8px] tracking-wider text-paper backdrop-blur-md">
            {product.brand}
          </span>
          <span className="eyebrow rounded border border-gold/40 bg-gold/15 px-2 py-0.5 text-[8px] tracking-wider text-gold font-bold">
            New Arrival
          </span>
          <span className="eyebrow rounded bg-bone px-2 py-0.5 text-[8px] tracking-wider text-obsidian/70">
            {product.category}
          </span>
        </div>

        {/* Share Button on Card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShare(product);
          }}
          className="absolute right-3.5 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90 text-obsidian shadow-sm hover:bg-gold hover:text-obsidian transition-colors cursor-pointer"
          title="Share frame link"
        >
          <Share2 size={12} />
        </button>

        {/* Visual Frame Container */}
        <button
          type="button"
          data-cursor="VIEW"
          onClick={() => onOpen(product)}
          aria-label={`View details for ${product.brand} ${product.name}`}
          className="relative block w-full focus:outline-none cursor-pointer"
        >
          <ProductVisual product={product} hovered={hovered} />
          
          {/* Hover Overlay Button */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-obsidian/30 backdrop-blur-[2px] transition-opacity duration-300 ${
              hovered ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <span className="eyebrow flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-[9px] font-semibold text-obsidian shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Eye size={12} className="text-gold" /> Quick View
            </span>
          </div>
        </button>
      </div>

      {/* Frame Details & Info */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-[9px] text-muted-foreground">{product.brand}</p>
              <h3 
                onClick={() => onOpen(product)}
                className="display mt-1 text-2xl text-obsidian sm:text-[1.65rem] hover:text-gold transition-colors cursor-pointer line-clamp-1"
              >
                {product.name}
              </h3>
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="font-sans text-sm font-semibold text-obsidian">
                {inr(product.price)}
              </p>
              {product.sale_price && product.sale_price < product.price && (
                <p className="text-[10px] text-muted-foreground line-through">
                  {inr(product.sale_price)}
                </p>
              )}
            </div>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {product.material}
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
            <Check size={12} className="shrink-0" />
            <span>Available for Try-On at Kothrud & Sadashiv Peth</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-obsidian/10 pt-4">
          <a
            href={directStoreProductUrl}
            target="_blank"
            rel="noreferrer"
            className="eyebrow inline-flex items-center justify-center gap-1.5 rounded border border-obsidian bg-obsidian py-2.5 text-[9px] font-bold text-paper transition-all hover:bg-gold hover:border-gold hover:text-obsidian shadow-xs"
          >
            <ShoppingBag size={12} /> Buy Now
          </a>
          <button
            type="button"
            onClick={() => onEnquire(product)}
            className="eyebrow inline-flex items-center justify-center gap-1.5 rounded border border-obsidian/20 bg-transparent py-2.5 text-[9px] font-bold text-obsidian transition-colors hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/5 cursor-pointer"
          >
            <MessageCircle size={12} className="text-[#25D366]" /> Enquire
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function Collection() {
  const [active, setActive] = useState<LandingProduct | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<LandingProduct | null>(null);
  const [newArrivals, setNewArrivals] = useState<LandingProduct[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState(26);
  const [totalBrandsCount, setTotalBrandsCount] = useState(65);
  const [topBrandsText, setTopBrandsText] = useState("Ray-Ban Meta, Tom Ford, Armani Exchange, Versace, Oakley & Mont Blanc");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const storeUrl = import.meta.env["VITE_STORE_URL"] || "http://localhost:5173";
  const rawApiUrl = (import.meta.env["VITE_API_URL"] || "http://127.0.0.1:8000/api/v1").trim().replace(/\/+$/, '');
  const apiUrl = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

  const handleShareProduct = async (product: LandingProduct) => {
    const directUrl = `${storeUrl}/?product=${encodeURIComponent(product.id)}`;
    const shareTitle = `${product.brand} ${product.name} | Bapat Optics Pune`;
    const shareText = `Check out the ${product.brand} ${product.name} (${inr(product.price)}) at Bapat Optics Pune — Carl Zeiss Vision Center!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: directUrl,
        });
        showToast("Product link shared successfully!");
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(directUrl);
      showToast("Product direct link copied to clipboard!");
    } catch {
      showToast(`Direct Link: ${directUrl}`);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    // 1. Fetch exactly top 6 newest arrivals from the live backend catalog
    fetch(`${apiUrl}/products?sort_by=newest&page_size=6`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (!Array.isArray(data.items) || data.items.length === 0) {
          throw new Error("No items returned");
        }
        if (data.total) {
          setTotalProductsCount(data.total);
        }

        const origin = apiUrl.startsWith("http") ? new URL(apiUrl).origin : "";
        const mapped: LandingProduct[] = data.items.slice(0, 6).map((item: any) => {
          let catName = item.category?.name || "Eyewear";
          if (item.category?.slug === "meta" || item.name.toLowerCase().includes("meta") || item.name.toLowerCase().includes("smart")) {
            catName = "Smart Glasses";
          }

          return {
            id: item.id,
            sku: item.sku,
            name: item.name,
            brand: item.brand?.name || "Designer",
            price: item.price,
            sale_price: item.sale_price,
            category: catName,
            categorySlug: item.category?.slug,
            image: item.primary_image?.startsWith("http") ? item.primary_image : `${origin}${item.primary_image}`,
            imageAlt: item.secondary_image
              ? item.secondary_image.startsWith("http")
                ? item.secondary_image
                : `${origin}${item.secondary_image}`
              : undefined,
            material: item.material ? `${item.material} · ${item.dimensions_str || ''}` : "Precision Zeiss optical finish",
            dimensions_str: item.dimensions_str,
          };
        });
        setNewArrivals(mapped);
      })
      .catch(() => {
        // Fallback to static data (exactly 6 items)
        setNewArrivals(
          fallbackProducts.slice(0, 6).map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            category: p.category === "Sunglasses" ? "Sunglasses" : "Eyeglasses",
            image: p.image,
            imageAlt: p.imageAlt,
            material: p.material,
          }))
        );
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Fetch live master filters and brand taxonomy
    fetch(`${apiUrl}/filters`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((filterData) => {
        if (filterData.brands && Array.isArray(filterData.brands)) {
          setTotalBrandsCount(filterData.brands.length);
          const topList = filterData.brands
            .slice(0, 6)
            .map((b: any) => b.label)
            .join(", ");
          if (topList) {
            setTopBrandsText(`${topList} & many more`);
          }
        }
      })
      .catch(() => undefined);
  }, [apiUrl]);

  return (
    <section id="collection" className="relative bg-paper py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-obsidian/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-px w-8 bg-gold sm:w-10" />
              <p className="eyebrow text-[9px] tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.2em]">
                Live Storefront · Newly Arrived Silhouettes
              </p>
            </div>
            <h2 className="display mt-1.5 text-[10vw] text-obsidian sm:text-[7vw] md:text-[5vw]">
              New Arrivals
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Discover our latest 6 newly arrived designer frames, Ray-Ban Meta AI smart glasses, and precision optical pieces. Fitted with precision Zeiss optics in our Pune stores.
            </p>
          </div>

          <div className="hidden sm:block">
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="eyebrow inline-flex items-center gap-2 rounded-full border border-obsidian/20 bg-paper px-5 py-2.5 text-[9px] font-bold tracking-wider text-obsidian hover:border-gold hover:text-gold transition-colors"
            >
              <span>View All Store Products</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        {/* 6 Newly Arrived Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-paper/60 border border-obsidian/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {newArrivals.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onOpen={setActive} 
                onEnquire={setInquiryProduct}
                onShare={handleShareProduct}
                storeUrl={storeUrl}
              />
            ))}
          </div>
        )}

        {/* In-Store Consultation & Full Catalog Banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-gold/30 bg-paper p-6 sm:mt-16 sm:flex-row sm:p-8 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="display text-xl text-obsidian sm:text-2xl">
                Looking for our complete catalog of {totalBrandsCount}+ brands?
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                We carry over {totalProductsCount}+ physical styles across {topBrandsText} in Pune.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="eyebrow inline-flex items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-3 text-[10px] font-bold tracking-wider text-paper hover:bg-gold hover:text-obsidian transition-colors shadow-md"
            >
              <span>Explore Full {totalProductsCount}+ Store Catalog</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 p-4 backdrop-blur-md"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/30 bg-paper shadow-2xl"
            >
              <div className="aspect-[4/3] w-full bg-bone/60 p-6 flex items-center justify-center">
                <img
                  src={active.image || FALLBACK_FRAME_SVG}
                  alt={active.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[9px] text-gold font-bold">{active.brand}</span>
                  <span className="eyebrow text-[9px] text-muted-foreground">{active.sku || 'BAPAT-OPTICS'}</span>
                </div>
                <h3 className="display mt-1 text-2xl text-obsidian sm:text-3xl">
                  {active.name}
                </h3>
                
                <div className="mt-4 border-t border-obsidian/10 pt-4">
                  <dl className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <dt>Category</dt>
                      <dd className="text-obsidian font-medium">{active.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Specifications</dt>
                      <dd className="text-obsidian font-medium truncate max-w-[160px]">{active.material}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Price</dt>
                      <dd className="text-obsidian font-bold text-sm">{inr(active.price)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 space-y-2.5">
                  {/* Direct Buy Now in Storefront */}
                  <a
                    href={`${storeUrl}/?product=${encodeURIComponent(active.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="eyebrow block w-full rounded bg-obsidian py-3 text-center text-[10px] font-bold text-paper transition-all hover:bg-gold hover:text-obsidian shadow-md"
                  >
                    Buy in Storefront — {inr(active.price)}
                  </a>

                  {/* Share Option */}
                  <button
                    type="button"
                    onClick={() => handleShareProduct(active)}
                    className="eyebrow block w-full rounded border border-obsidian/20 bg-transparent py-2.5 text-center text-[10px] font-bold text-obsidian hover:border-gold hover:text-gold transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Share2 size={12} /> Share Product Link & Apps
                    </span>
                  </button>

                  {/* In-Store Try-On Lead Capture */}
                  <button
                    type="button"
                    onClick={() => {
                      const p = active;
                      setActive(null);
                      setInquiryProduct(p);
                    }}
                    className="eyebrow block w-full rounded border border-[#25D366] py-2.5 text-center text-[10px] font-bold text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer"
                  >
                    📱 Book In-Store Try-On & Consultation
                  </button>
                </div>
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close quick view"
                className="absolute right-3 top-3 rounded-full bg-obsidian/80 p-1.5 text-paper backdrop-blur-md transition-colors hover:bg-gold hover:text-obsidian cursor-pointer"
              >
                <X size={15} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification for Link Copy / Share */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 rounded-xl bg-obsidian px-5 py-3.5 text-paper shadow-2xl border border-gold/40"
          >
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <p className="eyebrow text-xs font-semibold tracking-wide">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRM Lead Inquiry & Try-On Modal */}
      <LandingInquiryModal
        product={inquiryProduct}
        onClose={() => setInquiryProduct(null)}
      />
    </section>
  );
}
