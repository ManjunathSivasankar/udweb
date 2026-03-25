import React from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";

const HelpCenter = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#f6f6f6] text-primary">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <span className="text-primary/40 uppercase tracking-[0.3em] text-[10px] font-heading font-bold block mb-4">
          Support Hub
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6">
          How Can We Help?
        </h1>
        <p className="text-sm text-primary/60 max-w-lg mx-auto mb-16 uppercase tracking-widest font-bold leading-relaxed">
          "The collective is only as strong as its support. Reach out, and we'll guide you through the void."
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-10 bg-white border border-primary/5 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <Phone size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Call Us</h3>
            <p className="text-sm text-primary/50 mb-6 font-medium">Available Monday to Saturday, 10 AM - 6 PM.</p>
            <a href="tel:+919876543210" className="text-lg font-black tracking-tight hover:underline">+91 98765 43210</a>
          </div>

          <div className="p-10 bg-white border border-primary/5 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <Mail size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Email Us</h3>
            <p className="text-sm text-primary/50 mb-6 font-medium">We typically respond within 12-24 hours.</p>
            <a href="mailto:support@urbandos.com" className="text-lg font-black tracking-tight hover:underline">support@urbandos.com</a>
          </div>
        </div>

        <div className="mt-20 p-12 bg-primary text-white rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Urgent Issue?</h2>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-8">Direct message us on Instagram for immediate assistance.</p>
            <a 
              href="https://www.instagram.com/urban.dos/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-4 px-10 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/90 transition-all"
            >
              DM on Instagram
            </a>
          </div>
          {/* Decorative element */}
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl shadow-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
