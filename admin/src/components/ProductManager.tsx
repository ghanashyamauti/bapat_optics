import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Check, 
  X, 
  Sparkles, 
  UploadCloud, 
  Film, 
  Star,
  Layers, 
  RotateCcw,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Video
} from 'lucide-react';
import type { Product } from '../types/admin';
import { 
  fetchAdminProducts, 
  createAdminProduct, 
  updateAdminProduct, 
  deleteAdminProduct, 
  fetchMasterFilters,
  uploadProductImage,
  uploadProductVideo,
  updateProductStock
} from '../services/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ProductManager: React.FC = () => {
  const { showToast } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [masterFilters, setMasterFilters] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Quick Refill Modal State
  const [refillProduct, setRefillProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(10);
  const [isRefilling, setIsRefilling] = useState(false);

  // Modal State for Add / Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState('UNISEX');
  const [material, setMaterial] = useState('ACETATE');
  const [frameType, setFrameType] = useState('FULL FRAME');
  const [colour, setColour] = useState('SOLID BLACK');
  const [frameShape, setFrameShape] = useState('WAYFARER');
  const [price, setPrice] = useState<number>(12500);
  const [salePrice, setSalePrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lensWidth, setLensWidth] = useState<number>(53);
  const [bridgeWidth, setBridgeWidth] = useState<number>(18);
  const [templeLength, setTempleLength] = useState<number>(140);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);

  // Media States (Upload Only, Max 8 Photos, 1 Video)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, filterRes] = await Promise.all([
        fetchAdminProducts(search || undefined, selectedCategory || undefined),
        fetchMasterFilters()
      ]);
      setProducts(prodRes.items);
      setMasterFilters(filterRes);

      if (filterRes.categories?.length && !categoryId) {
        setCategoryId(filterRes.categories[0].value);
      }
      if (filterRes.brands?.length && !brandId) {
        setBrandId(filterRes.brands[0].value);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading products list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory]);

  const handleGenerateSku = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = brandId ? brandId.substring(0, 3).toUpperCase() : 'BPT';
    setSku(`BPT-${prefix}-${randomCode}`);
  };

  const handleStartAdd = () => {
    setEditingProduct(null);
    setName('');
    handleGenerateSku();
    if (masterFilters?.categories?.length) setCategoryId(masterFilters.categories[0].value);
    if (masterFilters?.brands?.length) setBrandId(masterFilters.brands[0].value);
    setGender('UNISEX');
    setMaterial('ACETATE');
    setFrameType('FULL FRAME');
    setColour('SOLID BLACK');
    setFrameShape('WAYFARER');
    setPrice(12500);
    setSalePrice('');
    setStockQuantity(10);
    setLensWidth(53);
    setBridgeWidth(18);
    setTempleLength(140);
    setUploadedPhotos([]);
    setUploadedVideo(null);
    setDescription('');
    setIsFeatured(false);
    setIsBestseller(false);
    setIsModalOpen(true);
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name || '');
    setSku(p.sku || '');
    setBrandId(p.brand_id || (p as any).brand?.id || '');
    setCategoryId(p.category_id || (p as any).category?.id || '');
    setGender(p.gender || 'UNISEX');
    setMaterial(p.material || 'ACETATE');
    setFrameType(p.frame_type || 'FULL FRAME');
    setColour(p.colour || 'SOLID BLACK');
    setFrameShape(p.frame_shape || 'WAYFARER');
    setPrice(p.price || 0);
    setSalePrice(p.sale_price ? String(p.sale_price) : '');
    setStockQuantity(p.stock_quantity ?? 10);
    setLensWidth(p.lens_width || 53);
    setBridgeWidth(p.bridge_width || 18);
    setTempleLength(p.temple_length || 140);
    setDescription(p.description || '');
    setIsFeatured(Boolean(p.is_featured));
    setIsBestseller(Boolean(p.is_bestseller));

    // Extract all existing photos
    const photos: string[] = [];
    if (p.primary_image) photos.push(p.primary_image);
    if (p.secondary_image && !photos.includes(p.secondary_image)) photos.push(p.secondary_image);
    if (p.images && p.images.length > 0) {
      p.images.forEach(img => {
        if (img.image_url && !photos.includes(img.image_url)) {
          photos.push(img.image_url);
        }
      });
    }
    setUploadedPhotos(photos.slice(0, 8));
    setUploadedVideo(p.video_url || null);
    setIsModalOpen(true);
  };

  // Multiple Photos Upload Handler (Max 8)
  const handlePhotoFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const remainingSlots = 8 - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      showToast('Maximum 8 photos reached. Please remove an existing photo first.');
      return;
    }

    const filesToUpload = fileArray.slice(0, remainingSlots);
    if (fileArray.length > remainingSlots) {
      showToast(`Uploading ${remainingSlots} photos (maximum 8 allowed).`);
    }

    setIsUploadingMedia(true);
    try {
      const uploadPromises = filesToUpload.map(f => uploadProductImage(f));
      const newUrls = await Promise.all(uploadPromises);
      setUploadedPhotos(prev => [...prev, ...newUrls].slice(0, 8));
      showToast(`Uploaded ${newUrls.length} photo(s) successfully!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Photo upload failed');
    } finally {
      setIsUploadingMedia(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Video Upload Handler (Max 1)
  const handleVideoFile = async (files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('video/'));
    if (!file) {
      showToast('Please select a valid video file (MP4, WebM or MOV up to 50MB)');
      return;
    }

    setIsUploadingMedia(true);
    try {
      const videoUrl = await uploadProductVideo(file);
      setUploadedVideo(videoUrl);
      showToast('Showcase video uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Video upload failed');
    } finally {
      setIsUploadingMedia(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setUploadedPhotos(prev => {
      const selected = prev[index];
      const others = prev.filter((_, i) => i !== index);
      return [selected, ...others];
    });
    showToast('Cover photo updated');
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    showToast('Photo removed');
  };

  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    showToast('Video removed');
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedPhotos.length === 0) {
      showToast('Please upload at least 1 product photo (Cover Image)');
      return;
    }

    if (!name || !sku || !brandId || !categoryId) {
      showToast('Please fill all required product details');
      return;
    }

    setIsSaving(true);
    try {
      const dimensionsStr = `${lensWidth}-${bridgeWidth}-${templeLength}`;
      const payload = {
        name,
        sku,
        brand_id: brandId,
        category_id: categoryId,
        gender,
        material,
        frame_type: frameType,
        colour,
        frame_shape: frameShape,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : null,
        stock_quantity: Number(stockQuantity),
        lens_width: Number(lensWidth),
        bridge_width: Number(bridgeWidth),
        temple_length: Number(templeLength),
        dimensions_str: dimensionsStr,
        description,
        primary_image: uploadedPhotos[0],
        secondary_image: uploadedPhotos[1] || null,
        video_url: uploadedVideo || null,
        additional_images: uploadedPhotos.slice(2),
        is_featured: isFeatured,
        is_bestseller: isBestseller,
        is_active: true
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        showToast(`Product "${name}" updated successfully in catalog!`);
      } else {
        await createAdminProduct(payload);
        showToast(`Product "${name}" uploaded successfully to catalog!`);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || 'Failed to save product';
      showToast(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from active catalog?`)) {
      return;
    }
    try {
      await deleteAdminProduct(id);
      showToast(`Removed "${prodName}" from catalog`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error removing product');
    }
  };

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleOpenRefill = (p: Product) => {
    setRefillProduct(p);
    setNewStockQty(p.stock_quantity <= 0 ? 10 : p.stock_quantity);
  };

  const handleSaveRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillProduct) return;
    setIsRefilling(true);
    try {
      await updateProductStock(refillProduct.id, newStockQty);
      showToast(`Stock updated for ${refillProduct.name} (${newStockQty} units)`);
      setRefillProduct(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update product stock');
    } finally {
      setIsRefilling(false);
    }
  };

  // Filter products by search, category, and stock status
  const displayedProducts = products.filter((p) => {
    if (stockFilter === 'OUT_OF_STOCK' && p.stock_quantity > 0) return false;
    if (stockFilter === 'LOW_STOCK' && (p.stock_quantity <= 0 || p.stock_quantity > 3)) return false;
    if (stockFilter === 'IN_STOCK' && p.stock_quantity <= 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-display text-2xl text-slate-900 font-normal">Catalog & Inventory Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage master frames, materials, dimensions, edit details and live stock refills</p>
        </div>

        <button
          onClick={handleStartAdd}
          className="eyebrow inline-flex items-center gap-2 bg-[#C6A15B] hover:bg-[#A4813E] text-[#0A0A0A] font-bold px-5 py-3 rounded-xl text-xs transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name, brand, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-[#C6A15B] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none shadow-2xs placeholder:text-slate-400"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 focus:border-[#C6A15B] rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none cursor-pointer shadow-2xs"
        >
          <option value="">All Categories</option>
          {masterFilters?.categories?.map((cat: any) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {/* Stock Status Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="bg-white border border-slate-200 focus:border-[#C6A15B] rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none cursor-pointer shadow-2xs"
        >
          <option value="">All Stock Levels</option>
          <option value="IN_STOCK">In Stock Only</option>
          <option value="LOW_STOCK">Low Stock (≤ 3 units)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Image & Product</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Dimensions</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Live Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 animate-pulse">
                    Loading catalog inventory...
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 italic">
                    No products found matching your search or stock filter.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                        <img src={p.primary_image} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <strong className="text-slate-900 font-medium block">{p.name}</strong>
                        <span className="font-mono text-[10px] text-[#A4813E] font-semibold">{p.sku}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {p.brand?.name || 'Designer'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {p.category?.name || 'Frames'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {p.dimensions_str}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatPrice(p.price)}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.stock_quantity <= 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-[10px]">
                            ⚠️ Out of Stock
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenRefill(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C6A15B] hover:bg-[#A4813E] text-[#0A0A0A] font-bold text-[10px] transition-all shadow-2xs cursor-pointer"
                            title="Quick Refill Stock"
                          >
                            <RotateCcw size={10} />
                            <span>Refill</span>
                          </button>
                        </div>
                      ) : p.stock_quantity <= 3 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                            ⚡ Low ({p.stock_quantity})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenRefill(p)}
                            className="text-[10px] text-[#A4813E] hover:underline font-semibold cursor-pointer"
                          >
                            + Refill
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-emerald-700 font-semibold">
                            {p.stock_quantity} units
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenRefill(p)}
                            className="text-[10px] text-slate-400 hover:text-[#A4813E] cursor-pointer font-medium"
                            title="Edit Stock Level"
                          >
                            (Edit)
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="text-[#A4813E] hover:text-[#0A0A0A] p-1.5 rounded bg-slate-100 hover:bg-[#C6A15B] border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold"
                        title="Edit product details, pricing & stock"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded bg-slate-100 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK REFILL STOCK MODAL */}
      {refillProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-[#A4813E]" />
                <h3 className="font-display text-base text-slate-900 font-normal">Refill Inventory Stock</h3>
              </div>
              <button
                type="button"
                onClick={() => setRefillProduct(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-900">{refillProduct.name}</p>
              <p className="text-[10px] font-mono text-[#A4813E] font-medium">SKU: {refillProduct.sku}</p>
              <p className="text-xs text-slate-500 pt-1">
                Current Stock:{' '}
                <strong className={refillProduct.stock_quantity > 0 ? 'text-emerald-700' : 'text-red-600 font-bold'}>
                  {refillProduct.stock_quantity <= 0 ? '0 (Out of Stock)' : `${refillProduct.stock_quantity} units`}
                </strong>
              </p>
            </div>

            <form onSubmit={handleSaveRefill} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  New Physical Stock Count:
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#C6A15B] focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-900 font-mono outline-none"
                />
              </div>

              {/* Quick Increment Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Quick Refill Presets:</span>
                <div className="flex gap-1.5">
                  {[5, 10, 25, 50].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setNewStockQty((prev) => prev + qty)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-[#C6A15B] text-[10px] font-bold text-slate-700 hover:text-[#0A0A0A] border border-slate-200 transition-colors cursor-pointer"
                    >
                      +{qty}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewStockQty(0)}
                    className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[10px] font-bold text-red-700 border border-red-200 transition-colors cursor-pointer"
                    title="Mark as 0 Stock"
                  >
                    0
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRefillProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefilling}
                  className="flex-1 py-2.5 bg-[#C6A15B] hover:bg-[#A4813E] text-[#0A0A0A] font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  {isRefilling ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload / Edit Product Modal (Upload Only Dropzones, Max 8 Photos, 1 Video) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-[#A4813E]" />
                <h3 className="font-display text-lg text-slate-900 font-normal">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Upload Luxury Product to Catalog'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProductSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* SECTION: Media Upload Boxes (Photos Max 8, Video Max 1) */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[#A4813E] font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} />
                    Product Photos (Upload Box · Max 8 Photos)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {uploadedPhotos.length} / 8 Uploaded
                  </span>
                </div>

                {/* Hidden Multi-File Input */}
                <input
                  type="file"
                  ref={photoInputRef}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handlePhotoFiles(e.target.files);
                  }}
                />

                {/* Photo Dropzone Box */}
                {uploadedPhotos.length < 8 && (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) handlePhotoFiles(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-[#C6A15B]/50 hover:border-[#C6A15B] bg-white hover:bg-[#C6A15B]/5 rounded-xl p-5 text-center cursor-pointer transition-all space-y-2 shadow-2xs"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#C6A15B]/15 text-[#A4813E]">
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {isUploadingMedia ? 'Uploading Photos...' : 'Click or Drag & Drop Photos Here'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Upload up to {8 - uploadedPhotos.length} more photos (JPEG, PNG, WebP, AVIF up to 8MB each)
                      </p>
                    </div>
                  </div>
                )}

                {/* Uploaded Photos Gallery Grid */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {uploadedPhotos.map((photoUrl, index) => (
                      <div 
                        key={index}
                        className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden p-1.5 space-y-1.5 shadow-2xs"
                      >
                        <div className="aspect-[4/3] w-full bg-slate-50 border border-slate-100 rounded-lg p-1 flex items-center justify-center relative overflow-hidden">
                          <img src={photoUrl} alt={`Photo ${index + 1}`} className="h-full w-full object-contain" />
                          
                          {/* Badge */}
                          <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shadow-xs ${
                            index === 0 
                              ? 'bg-amber-500 text-black' 
                              : index === 1 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-800 text-white'
                          }`}>
                            {index === 0 ? '★ Cover' : index === 1 ? 'Hover 45°' : `Photo #${index + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          {index !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(index)}
                              className="text-[9px] text-[#A4813E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                              title="Set as primary cover image"
                            >
                              <Star size={10} />
                              <span>Set Cover</span>
                            </button>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 size={10} /> Cover
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video Upload Box (Max 1 Video) */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A4813E] font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                      <Film size={14} />
                      Product 360° Video (Upload Box · Max 1 Video)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {uploadedVideo ? '1 / 1 Video Uploaded' : '0 / 1 Video'}
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleVideoFile(e.target.files);
                    }}
                  />

                  {!uploadedVideo ? (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files) handleVideoFile(e.dataTransfer.files);
                      }}
                      className="border border-dashed border-slate-300 hover:border-[#C6A15B] bg-white hover:bg-[#C6A15B]/5 rounded-xl p-4 text-center cursor-pointer transition-all space-y-1.5 shadow-2xs"
                    >
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Video size={16} />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">
                        {isUploadingMedia ? 'Uploading Video...' : 'Click or Drag & Drop Product Video'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        MP4, WebM or MOV up to 50MB (Optional 360° product showcase video)
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <video 
                          src={uploadedVideo} 
                          controls 
                          className="h-20 w-32 rounded-lg bg-black object-cover shrink-0" 
                        />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Showcase Video Attached
                          </p>
                          <p className="text-[10px] text-slate-500 truncate font-mono">
                            {uploadedVideo.split('/').pop()}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-center"
                      >
                        <Trash2 size={12} />
                        <span>Remove Video</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 1: Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Product Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meisterstück Titanium Aviator"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2.5 text-slate-900 outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-medium">SKU Code *</label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[10px] text-[#A4813E] hover:underline cursor-pointer font-semibold"
                    >
                      Generate Auto SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2.5 font-mono text-slate-900 outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              {/* Row 2: Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Product Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2.5 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    {masterFilters?.categories?.map((cat: any) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Brand (65+ Master Brands) *</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2.5 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    {masterFilters?.brands?.map((b: any) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Material, Frame Type, Gender, Shape */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Material</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    {masterFilters?.materials?.map((m: any) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Frame Type</label>
                  <select
                    value={frameType}
                    onChange={(e) => setFrameType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    {masterFilters?.frame_types?.map((ft: any) => (
                      <option key={ft.value} value={ft.value}>{ft.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                    <option value="UNISEX">UNISEX</option>
                    <option value="KIDS">KIDS</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Frame Shape</label>
                  <select
                    value={frameShape}
                    onChange={(e) => setFrameShape(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                  >
                    {masterFilters?.frame_shapes?.map((s: any) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Colour Swatch */}
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Colour Palette</label>
                <select
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2.5 text-slate-900 outline-none focus:border-[#C6A15B] cursor-pointer"
                >
                  {masterFilters?.colours?.map((col: any) => (
                    <option key={col.value} value={col.value}>{col.label}</option>
                  ))}
                </select>
              </div>

              {/* Row 5: Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Selling Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Sale / Strikethrough Price</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-medium">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2 text-slate-900 outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              {/* Row 6: Dimensions (Lens-Bridge-Temple) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[#A4813E] font-semibold uppercase text-[10px] tracking-wider block">
                  Optical Dimensions (mm)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lens Width</span>
                    <input
                      type="number"
                      value={lensWidth}
                      onChange={(e) => setLensWidth(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-slate-900 text-center font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bridge Width</span>
                    <input
                      type="number"
                      value={bridgeWidth}
                      onChange={(e) => setBridgeWidth(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-slate-900 text-center font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Temple Length</span>
                    <input
                      type="number"
                      value={templeLength}
                      onChange={(e) => setTempleLength(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-slate-900 text-center font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Description */}
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Description & Craftsmanship Details</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about craftsmanship, Zeiss lens pairing, hinges..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg p-2.5 text-slate-900 outline-none focus:border-[#C6A15B]"
                />
              </div>

              {/* Row 8: Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#C6A15B] h-4 w-4"
                  />
                  <span className="text-slate-900 font-medium">Feature in Curated Edit</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="accent-[#C6A15B] h-4 w-4"
                  />
                  <span className="text-slate-900 font-medium">Mark as Bestseller</span>
                </label>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploadingMedia}
                  className="px-6 py-2.5 rounded-lg bg-[#C6A15B] hover:bg-[#A4813E] text-[#0A0A0A] font-bold cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSaving 
                    ? 'Saving Changes...' 
                    : isUploadingMedia
                      ? 'Uploading Media...'
                      : editingProduct 
                        ? 'Update & Save Changes' 
                        : 'Save & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
