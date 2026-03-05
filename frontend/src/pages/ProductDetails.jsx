import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("L");
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct({
            ...data,
            // Use real gallery array if it has 3 images, else fallback
            images:
              data.images?.length === 3
                ? data.images
                : [data.image, data.image, data.image],
          });
        } else {
          console.error("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f6f6] text-primary">
        Loading...
      </div>
    );

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="pt-32 pb-24 bg-[#f6f6f6] text-primary min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left: Image Gallery */}
          <div className="lg:w-3/5 flex gap-4">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${activeImage === idx ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-grow aspect-[3/4] bg-primary/5 rounded-lg overflow-hidden relative group">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-2/5 flex flex-col pt-4">
            <span className="text-primary/40 uppercase tracking-[0.3em] text-xs font-bold mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-primary uppercase">
              {product.name}
            </h1>
            <p className="text-2xl font-bold mb-8 text-primary">
              ${product.price}
            </p>

            <p className="text-primary/60 leading-relaxed mb-6 text-sm max-w-md">
              {product.description}
            </p>

            {(product.fabric || product.color) && (
              <div className="flex flex-col gap-2 mb-8 text-xs uppercase tracking-widest text-primary/50 font-bold border-l-2 border-primary/20 pl-4">
                {product.fabric && (
                  <p>
                    Fabric:{" "}
                    <span className="text-primary/80">{product.fabric}</span>
                  </p>
                )}
                {product.color && (
                  <p>
                    Color:{" "}
                    <span className="text-primary/80">{product.color}</span>
                  </p>
                )}
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-widest font-black">
                  Select Size
                </span>
                <button className="text-[10px] uppercase tracking-widest underline font-bold opacity-40 hover:opacity-100 transition-opacity">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center text-sm font-bold border-2 transition-all ${selectedSize === size ? "bg-primary text-white border-primary" : "border-primary/10 text-primary/50 hover:border-primary/40"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`py-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2 font-bold rounded-full transition-all ${isAdded ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl"}`}
              >
                {isAdded ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>
              <button className="py-4 uppercase tracking-widest text-xs font-bold rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-all">
                Buy It Now
              </button>
            </div>

            {/* Features */}
            <div className="space-y-6 pt-12 border-t border-primary/5">
              <div className="flex items-start gap-4">
                <Truck size={20} className="text-primary/30" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                    Fast Delivery
                  </h4>
                  <p className="text-[10px] text-primary/60">
                    {product.delivery}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <RotateCcw size={20} className="text-primary/30" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                    Easy Returns
                  </h4>
                  <p className="text-[10px] text-primary/60">
                    30-day money back guarantee.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck size={20} className="text-primary/30" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1">
                    Secure Checkout
                  </h4>
                  <p className="text-[10px] text-primary/60">
                    Verified payment processing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs */}
        <div className="mt-32 border-t border-primary/5 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">
                Product Guidance
              </h3>
              <p className="text-primary/60 text-xs leading-loose">
                {product.guidance}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">
                Material Detail
              </h3>
              <p className="text-primary/60 text-xs leading-loose">
                100% Organic Cotton. Reinforced seams. Pre-shrunk for consistent
                fit over time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">
                Ethical Sourcing
              </h3>
              <p className="text-primary/60 text-xs leading-loose">
                Produced in carbon-neutral facilities with fair-wage workforce
                standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
