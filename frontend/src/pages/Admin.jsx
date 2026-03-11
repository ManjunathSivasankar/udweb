// Admin Dashboard - Managed by Antigravity
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  ShoppingBag,
  Package,
  Check,
  X,
  RefreshCcw,
} from "lucide-react";

const Admin = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    images: "",
    fabric: "",
    color: "",
    sizes: "S,M,L",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("products"); // products | orders
  const [orderLoading, setOrderLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("admin_auth") === "true",
  );
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "https://my-shop-backend-z7jb.onrender.com");

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    setOrderLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/admin/all`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/collections`);
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchCollections();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "526252") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid Admin Password");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      // Format sizes string into an array and images into an array
      const productData = {
        ...formData,
        price: Number(formData.price),
        sizes: formData.sizes.split(",").map((s) => s.trim()),
        images: formData.images
          ? formData.images.split(",").map((i) => i.trim())
          : [],
      };

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          image: "",
          images: "",
          fabric: "",
          color: "",
          sizes: "S,M,L",
        });
        fetchProducts(); // Refresh list
      } else {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.message || "Failed to add product"}`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      setStatus("Error: Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/api/orders/admin/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error: Cannot connect to server.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`${API_URL}/api/orders/admin/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrders(orders.filter((o) => o._id !== orderId));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to delete order"}`);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error: Cannot connect to server.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p._id !== id));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to delete product"}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error: Cannot connect to server to delete product.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-48 pb-24 min-h-screen bg-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary p-12 rounded-2xl border border-white/10 shadow-3xl max-w-md w-full"
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Secure Access
            </h1>
            <p className="text-accent/60 text-[10px] uppercase tracking-widest font-bold">
              Restricted Admin Environment
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-center tracking-[0.5em]"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#f6f6f6] text-primary font-black uppercase tracking-widest py-4 rounded-lg hover:bg-white/90 transition-all hover:tracking-[0.3em]"
            >
              Unlock Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-primary">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Store Dashboard
            </h1>
            <p className="text-accent/60 text-sm uppercase tracking-widest font-bold">
              {activeTab === "products"
                ? "Management Inventory & Products"
                : "Process Incoming Orders & Payments"}
            </p>
          </div>

          <div className="flex bg-secondary/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === "products" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
            >
              <Package size={16} /> Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "orders" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
            >
              <ShoppingBag size={16} /> Orders
              {orders.filter((o) => o.status === "Order Placed").length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse shadow-lg ring-2 ring-primary">
                  {orders.filter((o) => o.status === "Order Placed").length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "products" ? (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/30 p-8 rounded-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 italic">
                Add New Product
              </h2>

              {status === "success" && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg text-sm font-bold text-center">
                  Product added successfully! You can see it live on the site
                  now.
                </div>
              )}

              {status && status !== "success" && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm font-bold text-center">
                  {status}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="e.g. Graphic Oversized Tee"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="29.99"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                      Collection / Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    >
                      <option value="" disabled>
                        Select a Collection
                      </option>
                      {collections.length > 0 ? (
                        collections.map((col) => (
                          <option key={col._id} value={col.name}>
                            {col.name}
                          </option>
                        ))
                      ) : (
                        <option value="T-Shirts">T-Shirts</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                      Fabric
                    </label>
                    <input
                      type="text"
                      name="fabric"
                      value={formData.fabric}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="e.g. 100% Heavy Cotton"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="e.g. Washed Black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="https://your-image-link.com/photo.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                    Gallery Images (Comma separated URLs, exactly 3 recommended)
                  </label>
                  <input
                    type="text"
                    name="images"
                    value={formData.images}
                    onChange={handleChange}
                    className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="URL 1, URL 2, URL 3"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                    Sizes (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="S,M,L,XL"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-accent/70 font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="Describe your product..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f6f6f6] text-primary font-black uppercase tracking-widest py-4 rounded-lg hover:bg-white/90 transition-colors mt-4"
                >
                  {loading ? "Adding Product..." : "Add Product to Database"}
                </button>
              </form>
            </motion.div>

            {/* Manage Products Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-12 bg-secondary/30 p-8 rounded-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 italic">
                Manage Existing Products
              </h2>

              {products.length === 0 ? (
                <p className="text-accent/60 text-sm italic">
                  No products found.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-4 bg-primary/30 border border-white/5 rounded-lg hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            product.image || "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div>
                          <h3 className="text-white font-heading font-bold">
                            {product.name}
                          </h3>
                          <p className="text-accent/60 text-[10px] uppercase tracking-wider">
                            ₹{product.price} • {product.category}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-lg flex items-center justify-center"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Orders Management Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-white/10 underline-offset-8">
                Incoming Orders
              </h2>
              <button
                onClick={fetchOrders}
                className="p-2 text-white/40 hover:text-white transition-colors"
                title="Refresh Orders"
              >
                <RefreshCcw
                  size={18}
                  className={orderLoading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-secondary/20 p-12 rounded-2xl border border-white/5 text-center">
                <p className="text-accent/40 uppercase tracking-[0.2em] text-xs font-bold">
                  No orders found yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-secondary/40 border p-6 rounded-2xl transition-all ${order.status === "Order Placed" ? "border-white/20 shadow-xl" : "border-white/5 opacity-80"}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-mono text-white/30 uppercase">
                            ID: {order._id.slice(-8)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                              order.status === "Delivered" ||
                              order.status === "Payment Completed" ||
                              order.status === "Order Confirmed" ||
                              order.status === "Preparing for Dispatch" ||
                              order.status === "Shipped"
                                ? "bg-green-500/20 text-green-400"
                                : order.status === "Cancelled"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-500"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          {order.customerDetails.name}
                        </h3>
                        <p className="text-xs text-accent/60">
                          {order.customerDetails.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-white">
                          ₹{order.totalAmount}
                        </div>
                        <div className="text-[10px] text-accent/40 font-bold uppercase tracking-widest mt-1">
                          {order.shippingMethod || "Standard"}
                        </div>
                        <div className="text-[10px] text-white/30 uppercase font-bold mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-primary/30 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-black text-white/20 mb-3 tracking-widest">
                          Shipping Address
                        </p>
                        <div className="text-[10px] font-bold text-white/70 space-y-1">
                          <p>{order.shippingAddress.address}</p>
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.pinCode}
                          </p>
                        </div>
                      </div>

                      <div className="bg-primary/30 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-black text-white/20 mb-3 tracking-widest">
                          Items
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 text-[10px] font-bold"
                            >
                              {item.image && (
                                <div className="w-16 h-20 bg-white/10 rounded flex-shrink-0 overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-grow">
                                <span className="text-white/70">
                                  {item.name} ({item.size}){" "}
                                  <span className="text-white/30 ml-1">
                                    x{item.quantity}
                                  </span>
                                </span>
                              </div>
                              <span className="text-white/50">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order._id, e.target.value)
                        }
                        className="flex-grow bg-[#0a0a0a] border border-white/20 text-white rounded-lg p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-white transition-colors cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Payment Completed">
                          Payment Completed
                        </option>
                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Preparing for Dispatch">
                          Preparing for Dispatch
                        </option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-lg flex items-center justify-center"
                        title="Delete Order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

