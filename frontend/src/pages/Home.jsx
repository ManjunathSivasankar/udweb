import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCollection } from "../context/CollectionContext";

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const { collections, loading: collectionsLoading } = useCollection();
  const [loading, setLoading] = useState(true);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  // API Base URL from Environment Variables
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch new arrivals - fetching 5 to allow varied layout (2 columns for first, 1 for rest in a 4 col grid = 5 items)
        const productsResponse = await fetch(`${API_URL}/api/products`);
        const productsData = await productsResponse.json();
        if (Array.isArray(productsData)) {
          setNewArrivals(productsData.slice(0, 5));
        } else {
          console.error("products API error:", productsData);
          setNewArrivals([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Scroll for Auth Toast
  useEffect(() => {
    const handleScroll = () => {
      // Show toast after scrolling past hero section (approx 100vh) if not dismissed
      if (window.scrollY > window.innerHeight && !toastDismissed) {
        setShowAuthToast(true);
      } else {
        setShowAuthToast(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toastDismissed]);

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Floating Auth Toast */}
      <AnimatePresence>
        {showAuthToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 bg-[#f6f6f6] shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 border border-primary/10"
          >
            <span className="text-sm font-sans font-bold text-primary">
              Sign in to unlock personalized experience
            </span>
            <div className="flex items-center gap-2 border-l border-primary/10 pl-4">
              <Link
                to="/login"
                className="text-xs uppercase font-heading font-black tracking-widest text-primary hover:text-primary/60 transition-colors"
              >
                Login
              </Link>
              <button
                onClick={() => {
                  setShowAuthToast(false);
                  setToastDismissed(true);
                }}
                className="p-1 hover:bg-primary/5 rounded-full transition-colors text-primary/40 hover:text-primary"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Arrivals Section (Light Theme) */}
      <section className="theme-light py-32 z-10 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-muted uppercase tracking-[0.3em] text-[10px] font-heading font-bold block mb-2">
                Recently Dropped
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase relative inline-block">
                New Arrivals
                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary"></span>
              </h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-2 text-sm font-sans font-bold text-primary/60 hover:text-primary transition-colors pb-2"
            >
              View All{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {loading
              ? [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="aspect-[4/5] bg-primary/5 rounded-xl animate-pulse"
                  />
                ))
              : newArrivals.map((product, index) => (
                  <div
                    key={product._id || product.id}
                    className={
                      index === 0
                        ? "col-span-2 md:col-span-2"
                        : "col-span-1 border border-primary/5 rounded-xl block"
                    }
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section
        id="collections-section"
        className="py-32 container mx-auto px-6"
      >
        <div className="mb-16 text-center">
          <span className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-heading font-bold block mb-2">
            Curated Drops
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">
            The Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col, index) => (
            <motion.div
              key={col._id || col.collectionId || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative aspect-[4/3] bg-secondary rounded-2xl overflow-hidden shadow-xl"
            >
              <Link
                to={`/category/${col.collectionId || col.id}`}
                className="absolute inset-0 z-20"
              />
              {/* Background Image */}
              {col.image && (
                <img
                  src={col.image}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 z-0"
                />
              )}
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
              {/* Overlay Content */}
              <div className="absolute bottom-8 left-8 z-20 pr-8">
                <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-white group-hover:translate-x-2 transition-transform duration-300 mb-2">
                  {col.name}
                </h3>
                <div className="h-[2px] w-0 bg-white group-hover:w-12 transition-all duration-500 ease-out"></div>
              </div>
              <div className="absolute right-8 bottom-8 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <ArrowRight size={16} className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
