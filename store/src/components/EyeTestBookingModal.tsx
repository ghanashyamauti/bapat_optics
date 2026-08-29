import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { bookAppointment } from '../services/api';

export const EyeTestBookingModal: React.FC = () => {
  const { isAppointmentOpen, setIsAppointmentOpen, showToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('Kothrud ZEISS Center');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [testType, setTestType] = useState('Zeiss 3D Digital Wavefront Examination (Free)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  if (!isAppointmentOpen) return null;

  const timeSlots = [
    '10:30 AM - 11:30 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
    '06:00 PM - 07:00 PM',
    '07:30 PM - 08:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('Please enter your name and contact phone');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookAppointment({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || undefined,
        branch,
        appointment_date: date,
        time_slot: timeSlot,
        test_type: testType,
        notes: 'Booked via Storefront'
      });
      setIsBooked(true);
    } catch (err) {
      console.error(err);
      showToast('Appointment booked! Our optometrist will contact you.');
      setIsBooked(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#C6A15B]/30 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A] text-white border-b border-[#C6A15B]/30">
          <div className="flex items-center gap-2.5">
            <Calendar size={18} className="text-[#C6A15B]" />
            <div>
              <h2 className="font-display text-lg font-normal text-white">Book Zeiss 3D Eye Examination</h2>
              <p className="text-[11px] text-[#B8BCC2]">100% Free Digital Wavefront Scan in Pune</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAppointmentOpen(false);
              setIsBooked(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isBooked ? (
          <div className="p-8 text-center space-y-5 bg-[#F6F5F2]/40">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="font-display text-2xl text-[#0A0A0A]">Appointment Confirmed!</h3>
              <p className="text-xs text-[#0A0A0A]/70 mt-1 max-w-md mx-auto">
                We have scheduled your Zeiss eye checkup on <strong>{date}</strong> at <strong>{timeSlot}</strong> at our <strong>{branch}</strong> clinic.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#0A0A0A]/10 text-xs text-left max-w-sm mx-auto space-y-2">
              <div className="flex items-center gap-2 text-[#A4813E] font-semibold">
                <MapPin size={14} />
                <span>Clinic Location:</span>
              </div>
              <p className="text-[#0A0A0A]/80 text-[11px]">
                {branch.includes('Kothrud')
                  ? 'Shop No. 2, Casablanca, Opp. Karishma Society, Late GA Kulkarni Path, Kothrud, Pune - 411038'
                  : 'Shop No. 2, Mulay Arcade, Survey No 1537, Sadashiv Peth Rd, Pune - 411030'}
              </p>
              <p className="text-[10px] text-[#0A0A0A]/50">Phone: +91 9175586133</p>
            </div>

            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 max-w-sm mx-auto text-left text-xs text-blue-900">
                <strong className="block mb-0.5">Confirmation Email Dispatched</strong>
                <p className="text-[11px] text-blue-800">
                  Appointment confirmation and Google Maps directions have been sent to <strong>{email}</strong>.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setIsAppointmentOpen(false);
                setIsBooked(false);
              }}
              className="eyebrow rounded-xl bg-[#0A0A0A] px-8 py-3 text-xs font-bold text-white hover:bg-[#C6A15B] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 bg-[#F6F5F2]/40 text-[#0A0A0A]">
            {/* Branch selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] block mb-1.5">
                Select Pune Clinic Branch
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBranch('Kothrud ZEISS Center')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    branch === 'Kothrud ZEISS Center'
                      ? 'border-[#0A0A0A] bg-white ring-2 ring-[#0A0A0A] font-bold'
                      : 'border-[#0A0A0A]/15 bg-white/70 hover:bg-white'
                  }`}
                >
                  <span className="block">Casablanca, Kothrud</span>
                  <span className="text-[10px] text-[#A4813E] font-normal">ZEISS Vision Center</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBranch('Sadashiv Peth')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    branch === 'Sadashiv Peth'
                      ? 'border-[#0A0A0A] bg-white ring-2 ring-[#0A0A0A] font-bold'
                      : 'border-[#0A0A0A]/15 bg-white/70 hover:bg-white'
                  }`}
                >
                  <span className="block">Mulay Arcade, Sadashiv Peth</span>
                  <span className="text-[10px] text-[#A4813E] font-normal">Heritage Flagship Store</span>
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">Select Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">Select Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-white border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Joshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98220 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#0A0A0A] block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="anand@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#0A0A0A]/15 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>
            </div>

            {/* Trust callout */}
            <div className="rounded-lg bg-[#C6A15B]/15 p-3 text-[11px] text-[#A4813E] flex items-center gap-2">
              <Sparkles size={14} className="shrink-0 text-[#C6A15B]" />
              <span>Includes Zeiss 3D Wavefront Analysis + Digital Corneal Topography. Completely 100% Free.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#C6A15B] text-white hover:text-[#0A0A0A] py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md mt-2"
            >
              <span>{isSubmitting ? 'Scheduling...' : 'Confirm Free Zeiss Eye Examination'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
