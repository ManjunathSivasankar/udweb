import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
  Star,
  Quote,
} from "lucide-react";

// Hardcoded testimonials removed, moving to dynamic fetch

import { useCollection } from "../context/CollectionContext";

const Hero = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const { collections } = useCollection();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch Testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${API_URL}/api/testimonials`);
        if (res.ok) {
          const data = await res.json();
          setTestimonials(Array.isArray(data) && data.length > 0 ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials", err);
      }
    };
    fetchTestimonials();
  }, [API_URL]);

  // Create a looped array of whatever collections we have from backend
  const marqueeItems =
    collections?.length > 0 ? [...collections, ...collections] : [];

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials]);

  return (
    <div className="relative min-h-screen w-full bg-primary font-sans overflow-hidden flex flex-col justify-center pt-24 pb-12">
      {/* ========== BACKGROUND ANIMATION ========== */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <motion.div
          animate={{
            backgroundPosition: ["0px 0px", "0px -40px"],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "linear",
          }}
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0"
      />

      {/* ========== FOREGROUND CONTENT ========== */}

      {/* 1. Left Vertical Social Icons */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-6 z-30 hidden md:flex">
        <div className="w-[1px] h-20 bg-white/20 mb-2"></div>
        <a
          href="#"
          className="p-3 bg-white/5 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] outline-none"
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
        <a
          href="#"
          className="p-3 bg-white/5 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] outline-none"
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="#"
          className="p-3 bg-white/5 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] outline-none"
          aria-label="Linkedin"
        >
          <Linkedin size={18} />
        </a>
        <div className="w-[1px] h-20 bg-white/20 mt-2"></div>
      </div>

      {/* 2. Top/Center Hero Text & Marquee (Banners) */}
      <div className="w-full relative z-20 flex flex-col items-center">
        <div className="text-center mb-0 px-6 absolute top-0 md:top-8 z-40 pointer-events-none mix-blend-difference w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[3.5rem] leading-[0.8] md:text-8xl xl:text-[9rem] font-heading font-black tracking-tighter text-white drop-shadow-2xl"
          >
            OWN THE <br className="md:hidden" /> MOMENT.
          </motion.h1>
        </div>

        {/* Infinite Marquee Container */}
        <div className="w-full overflow-hidden mt-32 md:mt-32 relative group cursor-grab active:cursor-grabbing">
          {/* Gradient Edges to fade items out */}
          <div className="absolute inset-y-0 left-0 w-8 md:w-32 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-8 md:w-32 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none"></div>

          {collections?.length > 0 ? (
            <motion.div
              className="flex gap-4 md:gap-6 w-max pl-6"
              drag="x"
              dragConstraints={{
                right: 0,
                left: -((400 + 24) * collections.length),
              }}
              animate={{ x: [0, -((400 + 24) * collections.length)] }} // Item width (384px or 400px) + gap
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 35, // Adjust speed here
                  ease: "linear",
                },
              }}
              style={{
                // Pause on hover
                animationPlayState: "inherit",
              }}
              whileHover={{
                animationPlayState: "paused",
              }}
              whileTap={{ animationPlayState: "paused", cursor: "grabbing" }}
            >
              {/* Note: Pausing framer-motion declarative animations perfectly requires useAnimation. For pure CSS marquee pause it's easier, but since framer is already used, we stick to the continuous smooth pan. The hover effect below adds visual focus. */}
              {marqueeItems.map((item, index) => {
                const content = (
                  <div
                    className={`relative w-[240px] h-[340px] md:w-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500 overflow-hidden transform hover:-translate-y-2 flex-shrink-0 group/card bg-secondary/20`}
                  >
                    <img
                      src={item.image || "https://via.placeholder.com/600x800"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                    />

                    {/* Always visible bottom gradient for legibility */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none`}
                    />

                    {/* Hover Overlay Title & View Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">
                      <h3 className="text-white font-heading font-black text-2xl md:text-3xl uppercase tracking-tighter mb-4 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                        {item.name}
                      </h3>
                      <span className="px-6 py-2 border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300 flex items-center gap-2 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300 delay-75">
                        View Collection <ArrowRight size={14} />
                      </span>
                    </div>

                    {/* Default Title (visible when not hovered) */}
                    <div className="absolute inset-0 flex items-end p-6 pointer-events-none opacity-100 group-hover/card:opacity-0 transition-opacity duration-300">
                      <h3 className="text-white font-heading font-black text-xl uppercase tracking-tighter drop-shadow-lg">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                );

                return (
                  <Link
                    to={`/category/${item.collectionId || item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    key={`${item._id || item.name}-${index}`}
                    className="block outline-none"
                  >
                    {content}
                  </Link>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* 3. Bottom Right Testimonials */}
      {testimonials.length > 0 && (
        <div className="absolute right-6 bottom-6 z-30 w-[300px] md:w-[350px] hidden sm:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-primary/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/20 transition-colors"
          >
            {/* Ambient inner glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

            <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
              <Quote size={40} className="text-white" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[
                      ...Array(testimonials[currentTestimonial]?.rating || 5),
                    ].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-white text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                      />
                    ))}
                  </div>
                  <p className="text-sm md:text-[13px] text-white/90 leading-relaxed font-sans font-medium mb-4 italic pl-3 border-l-2 border-white/20">
                    "{testimonials[currentTestimonial]?.text}"
                  </p>
                </div>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-heading font-black flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-white/30 block"></span>
                  {testimonials[currentTestimonial]?.name}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Absolute CTA button (bottom left next to social) for mobile fallback */}
      <div className="absolute bottom-6 left-6 z-30 md:hidden">
        <Link
          to="/shop"
          className="px-6 py-3 bg-white text-primary rounded-full font-heading font-bold tracking-widest uppercase text-[10px] flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-all outline-none"
        >
          Explore <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default Hero;
