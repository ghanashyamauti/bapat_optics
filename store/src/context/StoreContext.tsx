import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, MasterFilters } from '../types/store';
import { fetchFilters, fetchProducts, fetchCurrentUserProfile, fetchProductById } from '../services/api';

export interface CustomerUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
}

interface FilterState {
  categories: string[];
  brands: string[];
  genders: string[];
  materials: string[];
  frame_types: string[];
  colours: string[];
  frame_shapes: string[];
  priceRange: [number, number];
  search: string;
  sortBy: string;
  page: number;
}

interface StoreContextType {
  // Filters & Catalog
  filters: MasterFilters | null;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  toggleFilter: (type: keyof FilterState, value: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSearch: (query: string) => void;
  setSortBy: (sort: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  activeFilterCount: number;

  // Products
  products: Product[];
  totalProducts: number;
  totalPages: number;
  isLoading: boolean;
  refreshCatalog: () => void;

  // Customer Auth
  customerUser: CustomerUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalReason: string | null;
  setAuthModalReason: (reason: string | null) => void;
  pendingCheckout: boolean;
  setPendingCheckout: (pending: boolean) => void;
  customerLogin: (session: any) => void;
  customerLogout: () => void;
  proceedToCheckout: () => void;

  // Modals & Drawers
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  tryOnProduct: Product | null;
  setTryOnProduct: (product: Product | null) => void;
  lensProduct: Product | null;
  setLensProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAppointmentOpen: boolean;
  setIsAppointmentOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  accountModalTab: 'orders' | 'appointments' | 'settings';
  setAccountModalTab: (tab: 'orders' | 'appointments' | 'settings') => void;
  openAccountModal: (tab?: 'orders' | 'appointments' | 'settings') => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (open: boolean) => void;

  // Cart & Buy Now
  cart: CartItem[];
  addToCart: (product: Product, lensType?: string, lensPrice?: number, prescriptionDetails?: string) => void;
  buyNow: (product: Product, lensType?: string, lensPrice?: number, prescriptionDetails?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  getCartItemQuantity: (productId: string, lensType?: string) => number;
  cartTotal: number;
  cartCount: number;

  // Toast & Sharing
  toastMessage: string | null;
  showToast: (msg: string) => void;
  shareProduct: (product: Product) => Promise<void>;
}

const initialFilterState: FilterState = {
  categories: [],
  brands: [],
  genders: [],
  materials: [],
  frame_types: [],
  colours: [],
  frame_shapes: [],
  priceRange: [1000, 45000],
  search: '',
  sortBy: 'featured',
  page: 1,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<MasterFilters | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Customer Auth State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('bapat_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Cart with user-scoped localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('bapat_customer_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user && user.id) {
          const userCart = localStorage.getItem(`bapat_cart_${user.id}`);
          return userCart ? JSON.parse(userCart) : [];
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Save cart to user-scoped storage whenever cart changes
  useEffect(() => {
    if (customerUser && customerUser.id) {
      try {
        localStorage.setItem(`bapat_cart_${customerUser.id}`, JSON.stringify(cart));
      } catch (err) {
        console.error('Failed to persist user cart:', err);
      }
    }
  }, [cart, customerUser]);

  // Auto-restore customer profile if token exists
  useEffect(() => {
    const token = localStorage.getItem('bapat_customer_token');
    if (token) {
      fetchCurrentUserProfile()
        .then((user) => {
          setCustomerUser(user);
          localStorage.setItem('bapat_customer_user', JSON.stringify(user));
          // Sync user cart
          try {
            const userCart = localStorage.getItem(`bapat_cart_${user.id}`);
            if (userCart) {
              setCart(JSON.parse(userCart));
            }
          } catch (e) {
            console.error(e);
          }
        })
        .catch(() => {
          localStorage.removeItem('bapat_customer_token');
          localStorage.removeItem('bapat_customer_user');
          setCustomerUser(null);
          setCart([]);
        });
    }
  }, []);

  // Handle token expiry: the API interceptor fires this event when any request returns 401
  useEffect(() => {
    const handleSessionExpired = () => {
      setCustomerUser(null);
      setCart([]);
      setIsAuthModalOpen(true);
      setAuthModalReason('Your session has expired. Please sign in again to continue.');
    };
    window.addEventListener('bapat:session-expired', handleSessionExpired);
    return () => window.removeEventListener('bapat:session-expired', handleSessionExpired);
  }, []);

  const customerLogin = (session: any) => {
    if (session.access_token) {
      localStorage.setItem('bapat_customer_token', session.access_token);
    }
    const userObj: CustomerUser = {
      id: session.user_id || session.id || '',
      email: session.email || '',
      full_name: session.full_name || 'Customer',
      role: session.role || 'CUSTOMER',
      phone: session.phone
    };
    setCustomerUser(userObj);
    localStorage.setItem('bapat_customer_user', JSON.stringify(userObj));

    // Restore specific user's cart
    try {
      const userCart = localStorage.getItem(`bapat_cart_${userObj.id}`);
      setCart(userCart ? JSON.parse(userCart) : []);
    } catch {
      setCart([]);
    }

    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    showToast(`Welcome back, ${userObj.full_name}!`);

    // If a purchase was initiated, automatically open Checkout
    if (pendingCheckout) {
      setPendingCheckout(false);
      setIsCheckoutOpen(true);
    }
  };

  const customerLogout = () => {
    localStorage.removeItem('bapat_customer_token');
    localStorage.removeItem('bapat_customer_user');
    setCustomerUser(null);
    setCart([]);
    setPendingCheckout(false);
    showToast('You have signed out successfully.');
  };

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [lensProduct, setLensProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'orders' | 'appointments' | 'settings'>('orders');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const openAccountModal = (tab: 'orders' | 'appointments' | 'settings' = 'orders') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
  };


  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const shareProduct = async (product: Product) => {
    const brandName = product.brand?.name || 'Designer';
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const shareTitle = `${brandName} ${product.name} | Bapat Optics Pune`;
    const shareText = `Check out ${brandName} ${product.name} at Bapat Optics Pune — Carl Zeiss Vision Center!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast('Product link shared successfully!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Product direct link copied to clipboard!');
    } catch {
      showToast(`Direct Link: ${shareUrl}`);
    }
  };

  // Check URL parameters for direct product deep-link on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('product') || params.get('productId') || params.get('sku');
    if (targetId) {
      fetchProductById(targetId)
        .then((prod) => {
          if (prod) {
            setQuickViewProduct(prod);
          }
        })
        .catch((err) => {
          console.log('Direct product load:', err);
        });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bapat_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Fetch Master Filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await fetchFilters();
        setFilters(data);
        if (data.min_price && data.max_price) {
          setFilterState(prev => ({
            ...prev,
            priceRange: [data.min_price, data.max_price]
          }));
        }
      } catch (err) {
        console.error('Error fetching master filters:', err);
      }
    };
    loadFilters();
  }, []);

  // Fetch Products whenever filter state changes
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProducts({
        categories: filterState.categories.join(','),
        brands: filterState.brands.join(','),
        genders: filterState.genders.join(','),
        materials: filterState.materials.join(','),
        frame_types: filterState.frame_types.join(','),
        colours: filterState.colours.join(','),
        frame_shapes: filterState.frame_shapes.join(','),
        min_price: filterState.priceRange[0],
        max_price: filterState.priceRange[1],
        search: filterState.search || undefined,
        sort_by: filterState.sortBy,
        page: filterState.page,
        page_size: 12
      });
      setProducts(res.items);
      setTotalProducts(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [
    filterState.categories,
    filterState.brands,
    filterState.genders,
    filterState.materials,
    filterState.frame_types,
    filterState.colours,
    filterState.frame_shapes,
    filterState.priceRange[0],
    filterState.priceRange[1],
    filterState.search,
    filterState.sortBy,
    filterState.page,
  ]);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilterState(prev => {
      const currentList = (prev[type] as string[]) || [];
      const exists = currentList.includes(value);
      const updated = exists
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [type]: updated, page: 1 };
    });
  };

  const setPriceRange = (range: [number, number]) => {
    setFilterState(prev => ({ ...prev, priceRange: range, page: 1 }));
  };

  const setSearch = (query: string) => {
    setFilterState(prev => ({ ...prev, search: query, page: 1 }));
  };

  const setSortBy = (sort: string) => {
    setFilterState(prev => ({ ...prev, sortBy: sort, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilterState(prev => ({ ...prev, page }));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilterState({
      ...initialFilterState,
      priceRange: filters ? [filters.min_price, filters.max_price] : [1000, 45000]
    });
  };

  const activeFilterCount =
    filterState.categories.length +
    filterState.brands.length +
    filterState.genders.length +
    filterState.materials.length +
    filterState.frame_types.length +
    filterState.colours.length +
    filterState.frame_shapes.length +
    (filterState.search ? 1 : 0);

  // Cart operations
  const addToCart = (
    product: Product,
    lensType: string = 'FRAME_ONLY',
    lensPrice: number = 0,
    prescriptionDetails?: string
  ) => {
    if (!customerUser) {
      setAuthModalReason('Please sign in or create an account to add items to your cart');
      setIsAuthModalOpen(true);
      showToast('Please sign in to add items to your cart');
      return;
    }

    if (product.stock_quantity <= 0) {
      showToast(`Sorry, ${product.name} is currently out of stock.`);
      return;
    }

    const itemKey = `${product.id}-${lensType}`;
    let newQty = 1;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        newQty = existing.quantity + 1;
        return prev.map(item =>
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          product,
          quantity: 1,
          lensType,
          lensPrice,
          prescriptionDetails
        }
      ];
    });

    showToast(`Added ${product.brand?.name || ''} ${product.name} to cart (Qty: ${newQty})`);
    // Note: Do NOT auto-open cart drawer on Add to Cart (Amazon-style in-place update)
  };

  const proceedToCheckout = () => {
    if (!customerUser) {
      setPendingCheckout(true);
      setAuthModalReason('Please sign in or create an account to proceed to checkout');
      setIsAuthModalOpen(true);
      showToast('Please sign in or register before checkout');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const buyNow = (
    product: Product,
    lensType: string = 'FRAME_ONLY',
    lensPrice: number = 0,
    prescriptionDetails?: string
  ) => {
    if (!customerUser) {
      setPendingCheckout(true);
      setAuthModalReason('Please sign in or create an account to complete your order');
      setIsAuthModalOpen(true);
      showToast('Please sign in or create an account to complete your order');
      return;
    }

    if (product.stock_quantity <= 0) {
      showToast(`Sorry, ${product.name} is currently out of stock.`);
      return;
    }

    const itemKey = `${product.id}-${lensType}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        return prev;
      }
      return [
        ...prev,
        {
          id: itemKey,
          product,
          quantity: 1,
          lensType,
          lensPrice,
          prescriptionDetails
        }
      ];
    });
    setQuickViewProduct(null);
    setLensProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartItemQuantity = (productId: string, lensType: string = 'FRAME_ONLY') => {
    const itemKey = `${productId}-${lensType}`;
    const item = cart.find(i => i.id === itemKey);
    return item ? item.quantity : 0;
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product.price + item.lensPrice) * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        filters,
        filterState,
        setFilterState,
        toggleFilter,
        setPriceRange,
        setSearch,
        setSortBy,
        setPage,
        resetFilters,
        activeFilterCount,
        products,
        totalProducts,
        totalPages,
        isLoading,
        refreshCatalog: loadProducts,
        customerUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalReason,
        setAuthModalReason,
        pendingCheckout,
        setPendingCheckout,
        customerLogin,
        customerLogout,
        proceedToCheckout,
        quickViewProduct,
        setQuickViewProduct,
        tryOnProduct,
        setTryOnProduct,
        lensProduct,
        setLensProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAppointmentOpen,
        setIsAppointmentOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        accountModalTab,
        setAccountModalTab,
        openAccountModal,
        isMobileFilterOpen,
        setIsMobileFilterOpen,
        cart,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemQuantity,
        cartTotal,
        cartCount,
        toastMessage,
        showToast,
        shareProduct,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-[#0A0A0A] text-[#F6F5F2] border border-[#C6A15B]/40 px-5 py-3.5 rounded-lg shadow-2xl backdrop-blur-md animate-bounce">
          <span className="h-2 w-2 rounded-full bg-[#C6A15B]" />
          <p className="text-xs font-medium tracking-wide">{toastMessage}</p>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
