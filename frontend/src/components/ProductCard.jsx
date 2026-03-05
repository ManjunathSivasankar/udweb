import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 border border-primary/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image || "https://via.placeholder.com/600x800?text=UD"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        {product.isNewArrival && (
          <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-heading font-bold px-3 py-1 uppercase tracking-widest z-10 rounded-sm">
            New
          </span>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-out flex gap-2 z-20">
          <button className="flex-grow bg-primary text-white hover:bg-black py-3 px-0 flex items-center justify-center gap-2 text-[11px] font-heading font-bold tracking-widest uppercase rounded-md transition-colors shadow-lg">
            <ShoppingCart size={14} /> Add to Cart
          </button>
          <Link
            to={`/product/${product._id}`}
            className="p-3 bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 rounded-md shadow-lg flex items-center justify-center"
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Subtle Bottom Gradient for Action Visibility */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 bg-white">
        <div className="flex justify-between items-start gap-4">
          <Link
            to={`/product/${product._id}`}
            className="text-sm font-heading font-bold text-primary hover:text-primary/70 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <span className="text-sm font-sans font-bold text-primary shrink-0">
            ${product.price}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-primary/50 font-sans font-medium">
          {product.category}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
