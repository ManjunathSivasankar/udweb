import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Monitor,
  X,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const UpiQrModal = ({ upiLink, orderId, amount, onClose }) => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isMobile, setIsMobile] = useState(false);
  const [redirectTriggered, setRedirectTriggered] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://my-shop-backend-z7jb.onrender.com");

  // Detect mobile once on mount
  useEffect(() => {
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  // Mobile: redirect to UPI intent
  useEffect(() => {
    if (isMobile && upiLink && !redirectTriggered) {
      setRedirectTriggered(true);
      const timer = setTimeout(() => {
        window.location.href = upiLink;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isMobile, upiLink, redirectTriggered]);

  // Desktop: render QR code
  useEffect(() => {
    if (!isMobile && canvasRef.current && upiLink) {
      QRCode.toCanvas(canvasRef.current, upiLink, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
  }, [isMobile, upiLink]);

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch(
        `${API_URL}/api/payment/confirm/${orderId}`,
        {
          method: "POST",
        },
      );
      if (response.ok) {
        setConfirmed(true);
        // Clear cart now as the order is confirmed by the user
        clearCart();
        setTimeout(() => {
          navigate(`/payment-status/${orderId}`);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const goToStatus = () => {
    clearCart();
    navigate(`/payment-status/${orderId}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm mx-4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {confirmed ? (
          <div className="py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">
              Signal Sent!
            </h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose">
              We've notified the admin. Redirecting to status page...
            </p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <Smartphone size={32} className="text-green-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">
                  Opening UPI App…
                </h2>
                <p className="text-xs text-white/50 uppercase tracking-widest mb-6">
                  Amount: ₹{amount?.toFixed(2)}
                </p>
                <a
                  href={upiLink}
                  className="w-full bg-green-500 hover:bg-green-400 text-black py-4 rounded-sm text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mb-4"
                >
                  MANUAL OPEN <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  <Monitor size={28} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-1">
                  PAY ON SYSTEM
                </h2>
                <p className="text-xs text-white/50 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 w-full">
                  ₹{amount?.toFixed(2)}
                </p>

                <div className="bg-white p-3 rounded-lg mb-6 inline-block">
                  <canvas ref={canvasRef} />
                </div>

                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose mb-6">
                  Open any UPI app (GPay/Paytm) and scan the code.
                </p>
              </div>
            )}

            <div className="space-y-3 w-full">
              <button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="w-full bg-white text-black py-4 rounded-sm text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {isConfirming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "I HAVE PAID"
                )}
              </button>
              <button
                onClick={goToStatus}
                className="w-full text-white/40 hover:text-white py-2 text-[9px] font-bold uppercase tracking-[0.3em] transition-colors"
              >
                Check Status Without Confirming
              </button>
            </div>

            <div className="mt-8 text-[9px] text-white/10 font-mono tracking-tighter">
              ID: {orderId}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpiQrModal;

