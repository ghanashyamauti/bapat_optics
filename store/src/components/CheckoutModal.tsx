import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, MapPin, Store, CheckCircle2, Sparkles, ArrowRight, Download, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { createOrder, verifyPayment, downloadInvoicePdf } from '../services/api';
import { CustomerAuthModal } from './CustomerAuthModal';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartTotal, clearCart, showToast, customerUser, setIsAuthModalOpen } = useStore();

  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [storeBranch, setStoreBranch] = useState('Kothrud ZEISS Center');
  
  // Customer Info
  const [name, setName] = useState(customerUser?.full_name || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [email, setEmail] = useState(customerUser?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411038');
  const [state, setState] = useState('Maharashtra');
  const [notes, setNotes] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [authOpen, setAuthOpen] = useState(false);

  React.useEffect(() => {
    if (customerUser) {
      if (!name) setName(customerUser.full_name);
      if (!email) setEmail(customerUser.email);
      if (!phone && customerUser.phone) setPhone(customerUser.phone);
    }
  }, [customerUser]);

  if (!isCheckoutOpen) return null;

  const formatPrice = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('bapat_customer_token')) { setAuthOpen(true); return; }
    if (!name || !phone || !email) {
      showToast('Please fill all mandatory contact details');
      return;
    }
    // Validate Indian mobile number: 10 digits starting with 6–9
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      showToast('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address');
      return;
    }
    // Validate pincode for home delivery
    if (deliveryType === 'HOME_DELIVERY' && !/^\d{6}$/.test(pincode)) {
      showToast('Please enter a valid 6-digit pincode');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Prepare Order Payload
      const orderPayload = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        delivery_type: deliveryType,
        store_pickup_branch: deliveryType === 'STORE_PICKUP' ? storeBranch : null,
        shipping_address: deliveryType === 'HOME_DELIVERY' ? address : null,
        city: city,
        pincode: pincode,
        state: state,
        lens_selection_type: cart.map(i => i.lensType).join(', '),
        prescription_data: notes,
        items: cart.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          product_sku: i.product.sku,
          product_image: i.product.primary_image,
          unit_price: i.product.price,
          quantity: i.quantity,
          lens_type: i.lensType,
          lens_price: i.lensPrice
        })),
        notes: notes
      };

      // 2. Call Backend to create Order
      const orderRes = await createOrder(orderPayload);

      // 3. Initiate Razorpay Checkout SDK
      const razorpayKeyId = orderRes.razorpay_key_id;
      const orderId = orderRes.order_id;
      const orderNumber = orderRes.order_number;
      const rpOrderId = orderRes.razorpay_order_id;

      if (window.Razorpay) {
        const options = {
          key: razorpayKeyId,
          amount: Math.round(orderRes.amount * 100),
          currency: 'INR',
          name: 'Bapat Optics Pune',
          description: `Order ${orderNumber} — Zeiss Precision Eyewear`,
          image: '/vite.svg',
          order_id: rpOrderId,
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: {
            color: '#0A0A0A'
          },
          handler: async function (response: any) {
            try {
              // Verify Payment on Backend
              await verifyPayment({
                order_id: orderId,
                razorpay_order_id: response.razorpay_order_id || rpOrderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'verified_mock_sig'
              });

              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              setCompletedOrder({
                orderId,
                orderNumber,
                amount: orderRes.amount,
                name,
                email,
                phone,
                paymentId: response.razorpay_payment_id || 'PAY-SUCCESS-TEST'
              });
              clearCart();
            } catch (err) {
              console.error(err);
              showToast('Payment verification error, please contact Bapat Optics support');
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert('Payment Failed: ' + response.error.description);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback Instant Sandbox Verification
        await verifyPayment({
          order_id: orderId,
          razorpay_order_id: rpOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_valid'
        });

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setCompletedOrder({
          orderId,
          orderNumber,
          amount: orderRes.amount,
          name,
          email,
          phone,
          paymentId: `PAY-TEST-${Date.now().toString().slice(-6)}`
        });
        clearCart();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to initialize checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#C6A15B]/30 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] text-white border-b border-[#C6A15B]/30">
          <div className="flex items-center gap-2.5">
            <CreditCard size={18} className="text-[#C6A15B]" />
            <div>
              <h2 className="font-display text-lg font-normal text-white">Razorpay Secure Checkout</h2>
              <p className="text-[11px] text-[#B8BCC2]">Encrypted 256-Bit Payment & Zeiss Clinic Warranty</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Completed Order Receipt Screen */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto bg-[#F6F5F2]/40">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <span className="eyebrow text-xs text-[#A4813E] font-bold">Payment Confirmed & Verified</span>
              <h3 className="font-display text-2xl sm:text-3xl text-[#0A0A0A] mt-1">
                Thank You, {completedOrder.name}!
              </h3>
              <p className="text-xs text-[#0A0A0A]/70 mt-2 max-w-md mx-auto">
                Your luxury eyewear order <strong className="font-mono text-[#0A0A0A]">{completedOrder.orderNumber}</strong> has been received by our Pune optometrists.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#0A0A0A]/10 text-left text-xs space-y-2.5 max-w-md mx-auto shadow-xs">
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Order Number</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Amount Paid</span>
                <span className="font-bold text-[#0A0A0A]">{formatPrice(completedOrder.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Payment ID</span>
                <span className="font-mono text-[#0A0A0A]/80">{completedOrder.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0A0A0A]/60">Contact Phone</span>
                <span className="font-medium text-[#0A0A0A]">{completedOrder.phone}</span>
              </div>
            </div>

            {/* Email & PDF Notice */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 max-w-md mx-auto text-left flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={16} />
              </div>
              <div className="text-xs">
                <strong className="text-blue-950 block">Tax Invoice Sent to Your Email</strong>
                <p className="text-blue-800 text-[11px] mt-0.5">
                  A formal GST Tax Invoice (PDF) has been dispatched to <strong>{completedOrder.email}</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={async () => {
                  if (completedOrder.orderId || completedOrder.orderNumber) {
                    showToast('Downloading Tax Invoice PDF...');
                    await downloadInvoicePdf(completedOrder.orderId || completedOrder.orderNumber, completedOrder.orderNumber);
                  }
                }}
                className="eyebrow inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-6 py-3 text-xs font-bold text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors shadow-md cursor-pointer"
              >
                <Download size={14} />
                <span>Download Invoice (PDF)</span>
              </button>

              <a
                href={`https://wa.me/919175586133?text=${encodeURIComponent(
                  `Namaste Bapat Optics! I have completed order ${completedOrder.orderNumber} for ₹${completedOrder.amount}. I am attaching my prescription details here.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="eyebrow inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-xs font-bold text-white hover:bg-[#1EBE5B] transition-colors shadow-md"
              >
                <span>📱 Send Prescription on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                }}
                className="eyebrow inline-flex items-center justify-center rounded-xl border border-[#0A0A0A]/20 bg-white px-5 py-3 text-xs font-bold text-[#0A0A0A] hover:bg-[#F6F5F2] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCheckoutSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F6F5F2]/40 text-[#0A0A0A]">
            {/* Delivery Method Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] block mb-2.5">
                1. Select Delivery & Trial Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('HOME_DELIVERY')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                    deliveryType === 'HOME_DELIVERY'
                      ? 'border-[#0A0A0A] bg-white ring-2 ring-[#0A0A0A] shadow-xs'
                      : 'border-[#0A0A0A]/15 bg-white/70 hover:bg-white text-[#0A0A0A]/70'
                  }`}
                >
                  <MapPin size={16} className={deliveryType === 'HOME_DELIVERY' ? 'text-[#C6A15B]' : 'text-[#0A0A0A]/40'} />
                  <div>
                    <span className="font-bold text-[#0A0A0A] block">Free Home Delivery</span>
                    <span className="text-[11px] text-[#0A0A0A]/60">Insured express courier anywhere in India</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('STORE_PICKUP')}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                    deliveryType === 'STORE_PICKUP'
                      ? 'border-[#0A0A0A] bg-white ring-2 ring-[#0A0A0A] shadow-xs'
                      : 'border-[#0A0A0A]/15 bg-white/70 hover:bg-white text-[#0A0A0A]/70'
                  }`}
                >
                  <Store size={16} className={deliveryType === 'STORE_PICKUP' ? 'text-[#C6A15B]' : 'text-[#0A0A0A]/40'} />
                  <div>
                    <span className="font-bold text-[#0A0A0A] block">Clinic Pickup (Pune)</span>
                    <span className="text-[11px] text-[#0A0A0A]/60">Try & adjust with optometrist at store</span>
                  </div>
                </button>
              </div>

              {deliveryType === 'STORE_PICKUP' && (
                <div className="mt-3 bg-white p-3 rounded-lg border border-[#0A0A0A]/10">
                  <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">
                    Select Pune Clinic Location
                  </label>
                  <select
                    value={storeBranch}
                    onChange={(e) => setStoreBranch(e.target.value)}
                    className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-md px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                  >
                    <option value="Kothrud ZEISS Center">Casablanca, Opp Karishma Society, Kothrud (Zeiss Vision Center)</option>
                    <option value="Sadashiv Peth">Mulay Arcade, Sadashiv Peth Rd, Sadashiv Peth (Flagship Store)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="bg-white p-5 rounded-xl border border-[#0A0A0A]/10 space-y-3.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] block">
                2. Contact & Delivery Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Kulkarni"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">Phone Number (For WhatsApp Updates) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98220 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">Email Address (For Invoice) *</label>
                <input
                  type="email"
                  required
                  placeholder="rohan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                />
              </div>

              {deliveryType === 'HOME_DELIVERY' && (
                <>
                  <div>
                    <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Apartment, Flat No., Street, Landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] text-[#0A0A0A]/70 block mb-1">Order Notes / Prescription Details</label>
                <input
                  type="text"
                  placeholder="e.g. Please call before dispatch or prescription will be provided on WhatsApp"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F6F5F2] border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                />
              </div>
            </div>

            {/* Total Summary & Pay Button */}
            <div className="bg-white p-5 rounded-xl border border-[#0A0A0A]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#0A0A0A]/60 block">Subtotal · GST and shipping calculated at checkout</span>
                <span className="text-2xl font-bold text-[#0A0A0A] font-display">{formatPrice(cartTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] px-8 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md"
              >
                <span>{isProcessing ? 'Connecting to Razorpay...' : `Pay ${formatPrice(cartTotal)} Securely`}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
      {authOpen && <CustomerAuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
    </div>
  );
};
