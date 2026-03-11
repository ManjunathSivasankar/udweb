import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  LogOut,
  Package,
  User as UserIcon,
  Settings,
  ChevronRight,
  RefreshCcw,
  ShoppingBag,
  X,
  Check,
} from "lucide-react";

const ORDER_STAGES = [
  "Payment Completed",
  "Order Confirmed",
  "Preparing for Dispatch",
  "Shipped",
  "Delivered",
];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userOrders, setUserOrders] = useState([]);
  const [clearedOrders, setClearedOrders] = useState(() => {
    const saved = localStorage.getItem("clearedOrders");
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const ordersSectionRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://my-shop-backend-z7jb.onrender.com");

  const scrollToOrders = () => {
    ordersSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserOrders(data);
        } else {
          const errorBody = await response.json().catch(() => ({}));
          console.error(
            "🛒 Profile: Fetch orders failed:",
            response.status,
            errorBody,
          );
        }
      } catch (err) {
        console.error("Error fetching user orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  const handleClearActivities = () => {
    if (
      !window.confirm(
        "Are you sure you want to clear your recent activity history from this device?",
      )
    )
      return;
    const allOrderIds = userOrders.map((o) => o._id);
    const newCleared = [...new Set([...clearedOrders, ...allOrderIds])];
    setClearedOrders(newCleared);
    localStorage.setItem("clearedOrders", JSON.stringify(newCleared));
  };

  const visibleOrders = userOrders.filter(
    (o) => !clearedOrders.includes(o._id),
  );

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem("userAddress");
    return saved
      ? JSON.parse(saved)
      : { street: "", city: "", state: "", zip: "" };
  });

  const handleSaveAddress = (e) => {
    e.preventDefault();
    localStorage.setItem("userAddress", JSON.stringify(address));
    setIsEditingAddress(false);
  };

  if (!user) {
    return (
      <div className="pt-48 pb-24 flex flex-col items-center justify-center text-center bg-gray-50 min-h-screen text-primary">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">
          Identity Not Found
        </h1>
        <button
          onClick={() => navigate("/login")}
          className="bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold rounded-full transition-all hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl px-12 uppercase tracking-widest text-[10px]"
        >
          Authenticate
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50 text-primary">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left: Profile Sidebar */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#f6f6f6] p-10 border border-primary/5 rounded-2xl shadow-sm"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-primary/5 overflow-hidden">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={40} className="text-primary/20" />
                  )}
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">
                  {user.displayName || "COLLECTIVE MEMBER"}
                </h2>
                <p className="text-primary/50 text-[10px] uppercase tracking-widest font-bold mt-2">
                  {user.email}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={scrollToOrders}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-all group"
                >
                  <span className="flex items-center gap-4 text-primary">
                    <Package size={16} /> My Orders
                  </span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform text-primary/40"
                  />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all group opacity-50">
                  <span className="flex items-center gap-4 text-primary">
                    <Settings size={16} /> Account Settings
                  </span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform text-primary/40"
                  />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 rounded-md text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all mt-8"
                >
                  <span className="flex items-center gap-4">
                    <LogOut size={16} /> Terminate Session
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Activity Area */}
          <div className="lg:w-2/3 space-y-12">
            {/* Recent Orders */}
            <div ref={ordersSectionRef}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                  Recent Activity
                </h3>
                {visibleOrders.length > 0 && !loadingOrders && (
                  <button
                    onClick={handleClearActivities}
                    className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-primary/40 uppercase text-[10px] font-bold tracking-widest">
                  Retrieving history...
                </div>
              ) : visibleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#f6f6f6] border-primary/10 border-dashed border-2 rounded-2xl shadow-sm text-center px-6">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={24} className="text-primary/20" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                    No History Found
                  </h3>
                  <p className="text-primary/40 text-[10px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed mb-8">
                    If you just placed an order, try refreshing. Otherwise,
                    explore our latest collection.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                      onClick={() => navigate("/shop")}
                      className="bg-primary text-white py-4 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 hover:bg-primary/90 transition-all flex-grow sm:flex-grow-0"
                    >
                      Explore Shop
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-white text-primary py-4 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/5 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 flex-grow sm:flex-grow-0"
                    >
                      <RefreshCcw size={14} /> Refresh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {visibleOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-[#f6f6f6] p-6 rounded-2xl border border-primary/5 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[8px] font-black uppercase text-primary/30 tracking-widest mb-1">
                            Order ID: {order._id.slice(-8)}
                          </p>
                          <h4 className="text-sm font-black uppercase text-primary">
                            ₹{order.totalAmount}
                          </h4>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            ORDER_STAGES.includes(order.status)
                              ? "bg-green-100 text-green-600"
                              : order.status === "Cancelled"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Order Timeline Progress Bar */}
                      {ORDER_STAGES.includes(order.status) && (
                        <div className="w-full mt-6 mb-8 relative">
                          <div className="absolute top-2 left-[10%] right-[10%] h-[2px] bg-primary/10 -z-0">
                            <div
                              className="h-full bg-green-500 transition-all duration-500"
                              style={{
                                width: `${(Math.max(0, ORDER_STAGES.indexOf(order.status)) / (ORDER_STAGES.length - 1)) * 100}%`,
                              }}
                            />
                          </div>

                          <div className="flex w-full justify-between relative z-10">
                            {ORDER_STAGES.map((stage, i) => {
                              const currentStageIndex = ORDER_STAGES.indexOf(
                                order.status,
                              );
                              const isCompleted = i <= currentStageIndex;
                              const isActive = i === currentStageIndex;

                              return (
                                <div
                                  key={stage}
                                  className="flex flex-col items-center flex-1"
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 mb-3 bg-[#f6f6f6] transition-colors duration-500 ${
                                      isCompleted
                                        ? "border-green-500 bg-green-500 text-white"
                                        : "border-primary/20 text-transparent"
                                    }`}
                                  >
                                    {isCompleted && (
                                      <Check size={10} strokeWidth={4} />
                                    )}
                                  </div>
                                  <span
                                    className={`text-[8px] leading-tight text-center font-bold uppercase tracking-widest max-w-[60px] ${isActive ? "text-green-600" : isCompleted ? "text-primary/70" : "text-primary/30"}`}
                                  >
                                    {stage}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            {item.image && (
                              <div className="w-10 h-12 bg-primary/5 rounded-lg flex-shrink-0 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-grow">
                              <div className="flex justify-between text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                                <span>
                                  {item.name} ({item.size}) x{item.quantity}
                                </span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-primary/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/40">
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>{order.shippingMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                  Shipping Identity
                </h3>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary/50 hover:text-primary transition-colors"
                  >
                    Edit Location
                  </button>
                )}
              </div>

              <div className="bg-[#f6f6f6] p-8 border border-primary/5 rounded-2xl shadow-sm">
                {isEditingAddress ? (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-primary/50 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-primary/5 p-4 rounded-md text-sm font-bold uppercase tracking-widest focus:border-primary/20 transition-all outline-none text-primary"
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-primary/50 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-primary/5 p-4 rounded-md text-sm font-bold uppercase tracking-widest focus:border-primary/20 transition-all outline-none text-primary"
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-primary/50 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-primary/5 p-4 rounded-md text-sm font-bold uppercase tracking-widest focus:border-primary/20 transition-all outline-none text-primary"
                          value={address.state}
                          onChange={(e) =>
                            setAddress({ ...address, state: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-primary/50 mb-2">
                          Zip/Postal
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-primary/5 p-4 rounded-md text-sm font-bold uppercase tracking-widest focus:border-primary/20 transition-all outline-none text-primary"
                          value={address.zip}
                          onChange={(e) =>
                            setAddress({ ...address, zip: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                      <button
                        type="submit"
                        className="bg-primary text-white py-3 px-8 rounded-full text-[10px] uppercase tracking-widest font-bold hover:shadow-xl hover:-translate-y-1 transition-all"
                      >
                        Save Location
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="bg-[#f6f6f6] text-primary py-3 px-8 border border-primary/20 hover:bg-primary/5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {address.street ? (
                      <div className="space-y-1 text-sm font-bold uppercase tracking-widest text-primary/80">
                        <p className="text-primary tracking-tighter">
                          {address.street}
                        </p>
                        <p>
                          {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                    ) : (
                      <p className="text-primary/40 text-xs italic font-bold">
                        No coordinates established. Add a location for seamless
                        deployment (checkout).
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

