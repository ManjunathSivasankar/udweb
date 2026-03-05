import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  LogOut,
  Package,
  User as UserIcon,
  Settings,
  ChevronRight,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

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
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-all group">
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
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-primary/5 text-primary">
                Recent Activity
              </h3>

              <div className="flex flex-col items-center justify-center py-24 bg-[#f6f6f6] border-primary/5 border-dashed border-2 rounded-2xl shadow-sm">
                <p className="text-primary/40 text-xs italic font-bold mb-8">
                  "Silence. You have no recent orders."
                </p>
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-primary text-white py-3 px-8 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  Explore Collection
                </button>
              </div>
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
