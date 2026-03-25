import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const PaymentStatus = () => {
  const { orderId } = useParams();

  return (
    <StatusScreen
      icon={
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
          <CheckCircle2 size={80} className="text-green-500 relative z-10" />
        </div>
      }
      title="Order Confirmed"
      subtitle="Your order signal has been received. Please allow 12-24 hours for payment verification. You can check your order status in the 'My Orders' section of your profile. Once your order is ready for dispatch, we will send you an email notification."
      color="green"
    >
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          to={`/profile`}
          className="w-full bg-black text-white py-5 uppercase tracking-[0.3em] text-[10px] font-black flex items-center justify-center gap-3 hover:bg-black/90 transition-all rounded-sm"
        >
          Track Order
        </Link>
        <Link
          to="/"
          className="w-full border border-black/10 py-4 text-[9px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:bg-black/5 transition-all rounded-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </StatusScreen>
  );
};

/* ── Shared layout wrapper ──────────────────────────────────────────────── */
const StatusScreen = ({ icon, title, subtitle, color, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6] text-primary px-6">
    <div className="flex flex-col items-center text-center max-w-md w-full">
      <div className="mb-10">{icon}</div>
      <h1 className="text-5xl font-black tracking-tighter mb-6 uppercase leading-none">
        {title}
      </h1>
      <p className="text-xs text-primary/40 mb-12 leading-loose tracking-wide uppercase font-bold">
        {subtitle}
      </p>
      {children}
    </div>
  </div>
);

export default PaymentStatus;
