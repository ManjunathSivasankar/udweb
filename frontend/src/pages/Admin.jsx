import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("admin_auth") === "true",
  );
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
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
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            Store Admin
          </h1>
          <p className="text-accent/60 text-sm uppercase tracking-widest font-bold">
            Add new products directly to your database.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/30 p-8 rounded-xl border border-white/10 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 italic">Add New Product</h2>

          {status === "success" && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg text-sm font-bold text-center">
              Product added successfully! You can see it live on the site now.
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
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. T-Shirts"
                />
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
            <p className="text-accent/60 text-sm italic">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 bg-primary/30 border border-white/5 rounded-lg hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-white font-heading font-bold">
                        {product.name}
                      </h3>
                      <p className="text-accent/60 text-[10px] uppercase tracking-wider">
                        ${product.price} • {product.category}
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
    </div>
  );
};

export default Admin;
