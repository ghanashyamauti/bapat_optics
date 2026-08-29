import React from 'react';
import { Phone, Mail, MapPin, Sparkles, ExternalLink, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] text-[#F6F5F2] pt-8 pb-6 border-t border-[#C6A15B]/30 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-white/10">
          {/* Col 1: Brand & Heritage */}
          <div className="space-y-2.5">
            <h3 className="font-display text-xl text-white font-normal tracking-tight">
              BAPAT OPTICS
            </h3>
            <p className="eyebrow text-[9px] text-[#C6A15B] tracking-[0.25em]">
              Pune · 14+ Years of Precision
            </p>
            <p className="text-xs text-[#B8BCC2] leading-relaxed">
              Flagship Zeiss Vision Center & luxury eyewear house in Pune. Carrying 65+ world-class brands with German wavefront lens fitting.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C6A15B]/20 text-[#C6A15B]">
                <Sparkles size={11} />
              </span>
              <span className="text-xs font-semibold text-[#C6A15B]">Official ZEISS Vision Partner</span>
            </div>
          </div>

          {/* Col 2: Kothrud Flagship Branch */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs tracking-wider uppercase">
              <MapPin size={13} className="text-[#C6A15B]" />
              <span>Kothrud ZEISS Center</span>
            </div>
            <p className="text-xs text-[#B8BCC2] leading-relaxed">
              Shop No. 2, Casablanca, Opp. Karishma Society, Late GA Kulkarni Path, next to Kasat Exclusive, Kothrud, Pune - 411038
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#B8BCC2]">
              <Clock size={11} className="text-[#C6A15B]" />
              <span>Mon – Sun: 10:00 AM – 9:00 PM</span>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Bapat+Optics+Shop+no+2+Casablanca+Late+GA+Kulkarni+Path+Kothrud+Pune+411038"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#C6A15B] hover:underline pt-0.5"
            >
              <span>Get Directions</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Col 3: Sadashiv Peth Heritage Branch */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs tracking-wider uppercase">
              <MapPin size={13} className="text-[#C6A15B]" />
              <span>Sadashiv Peth Flagship</span>
            </div>
            <p className="text-xs text-[#B8BCC2] leading-relaxed">
              Shop No. 2, Mulay Arcade, Survey No 1537, Sadashiv Peth Rd, Sadashiv Peth, Pune - 411030
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#B8BCC2]">
              <Clock size={11} className="text-[#C6A15B]" />
              <span>Mon – Sun: 10:00 AM – 9:00 PM</span>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Bapat+Optics+Shop+No+2+Mulay+Arcade+Sadashiv+Peth+Rd+Pune+411030"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#C6A15B] hover:underline pt-0.5"
            >
              <span>Get Directions</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-2.5">
            <div className="text-white font-semibold text-xs tracking-wider uppercase">
              VIP Inquiries & Support
            </div>
            <div className="space-y-1.5 text-xs text-[#B8BCC2]">
              <a href="tel:+919175586133" className="flex items-center gap-2 hover:text-[#C6A15B] transition-colors">
                <Phone size={13} className="text-[#C6A15B]" />
                <span>+91 9175586133</span>
              </a>
              <a href="mailto:bapatopticsonline@gmail.com" className="flex items-center gap-2 hover:text-[#C6A15B] transition-colors">
                <Mail size={13} className="text-[#C6A15B]" />
                <span>bapatopticsonline@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#B8BCC2]/60">
          <p>© 2011 – 2026 Bapat Optics Pune. All rights reserved. Powered by Carl Zeiss Vision.</p>
        </div>
      </div>
    </footer>
  );
};
