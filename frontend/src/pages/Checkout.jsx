import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ChevronLeft, ArrowRight } from "lucide-react";

// Admin WhatsApp Number - Change this to your actual number
const ADMIN_WHATSAPP_NUMBER = "9003789388";

const Checkout = () => {
  const { Cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState(() => {
    const savedAddress = localStorage.getItem("userAddress");
    const parsedAddress = savedAddress ? JSON.parse(savedAddress) : null;

    return {
      name: user?.displayName || "",
      phone: "",
      address: parsedAddress?.street || "",
      city: parsedAddress?.city || "",
      state: parsedAddress?.state || "",
      pinCode: parsedAddress?.zip || "",
    };
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppMessage = () => {
    const orderItemsList = Cart.map(
      (item) =>
        `- ${item.quantity}x ${item.name} (Size: ${item.size}) - $${(
          item.price * item.quantity
        ).toFixed(2)}`,
    ).join("\n");

    const message = `*NEW ORDER REQUEST* 🛍️

*Customer Details:*
Name: ${shippingDetails.name}
Phone: ${shippingDetails.phone}

*Shipping Address:*
${shippingDetails.address}
${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pinCode}

*Order Summary:*
${orderItemsList}

*Subtotal:* $${subtotal.toFixed(2)}
*Shipping:* $${shipping.toFixed(2)}
*Total Amount:* $${total.toFixed(2)}

Please confirm this order and provide payment details (UPI/QR). Thank you!`;

    return encodeURIComponent(message);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (Cart.length === 0) return;

    // Generate WhatsApp link
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`;

    // Save the shipping details back to localStorage for the user's profile
    const addressData = {
      street: shippingDetails.address,
      city: shippingDetails.city,
      state: shippingDetails.state,
      zip: shippingDetails.pinCode,
    };
    localStorage.setItem("userAddress", JSON.stringify(addressData));

    try {
      const token = user ? await user.getIdToken() : null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const orderData = {
        customerDetails: {
          name: shippingDetails.name,
          phone: shippingDetails.phone,
        },
        shippingAddress: {
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pinCode: shippingDetails.pinCode,
        },
        items: Cart.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
        })),
        subtotal,
        shippingFee: shipping,
        totalAmount: total,
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, "_blank");

        // Clear the Cart and navigate home
        clearCart();
        navigate("/", { replace: true });
      } else {
        alert("There was an issue processing your order. Please try again.");
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("There was an issue processing your order. Please try again.");
    }
  };

  if (Cart.length === 0) {
    return (
      <div className="pt-48 pb-24 min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-6 text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-4">
          YOUR GarageT IS EMPTY.
        </h1>
        <Link
          to="/shop"
          className="btn-primary px-12 uppercase tracking-[0.3em] text-[10px]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-12">
          <Link
            to="/Cart"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase">
            Checkout
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Shipping Form */}
          <div className="lg:w-2/3">
            <h2 className="text-lg font-black uppercase tracking-widest mb-8 pb-4 border-b border-white/5">
              Shipping Details
            </h2>

            <form
              id="checkout-form"
              onSubmit={handlePlaceOrder}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={shippingDetails.name}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    placeholder="WhatsApp number preferred"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="House number, street name, apartment, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-accent/60 mb-2">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    required
                    value={shippingDetails.pinCode}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-white/10 p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="lg:w-1/3">
            <div className="glass-Card p-8 sticky top-32">
              <h2 className="text-lg font-black uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                Your Order
              </h2>

              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {Cart.map((item) => (
                  <div key={item.CartId} className="flex gap-4">
                    <div className="w-16 h-20 bg-secondary rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <p className="text-xs font-bold uppercase truncate max-w-[150px]">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-accent/50 uppercase">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                      <p className="text-xs font-bold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-accent/40 uppercase tracking-widest font-bold">
                    Subtotal
                  </span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-accent/40 uppercase tracking-widest font-bold">
                    Shipping
                  </span>
                  <span className="font-bold">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black pt-4 border-t border-white/10 mt-4">
                  <span className="uppercase tracking-widest">Total</span>
                  <span className="text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-accent/5 p-4 rounded-sm mb-6 flex items-start gap-3">
                <ShieldCheck
                  className="text-green-400 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <p className="text-[10px] text-accent/60 uppercase tracking-widest leading-relaxed">
                  Checkout securely via WhatsApp. Our team will verify your
                  order and provide payment instructions.
                </p>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 uppercase tracking-[0.2em] text-xs font-black flex items-center justify-center gap-2 transition-colors rounded-sm"
              >
                Place Order via WhatsApp <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
