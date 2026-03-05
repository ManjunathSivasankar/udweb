import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await signup(email, password, name);
      navigate("/profile");
    } catch (err) {
      setError("Failed to create account. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-48 pb-24 min-h-screen flex items-center justify-center container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-Card p-12 border border-white/10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 text-white">
            Create Identity
          </h1>
          <p className="text-accent/30 text-[10px] uppercase tracking-widest font-bold">
            "Join the collective. Define your style."
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/30"
              size={18}
            />
            <input
              type="text"
              placeholder="FULL NAME"
              required
              className="w-full bg-secondary/50 border border-white/5 p-4 pl-12 rounded-md text-sm font-bold uppercase tracking-widest focus:border-white/20 transition-all outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/30"
              size={18}
            />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              required
              className="w-full bg-secondary/50 border border-white/5 p-4 pl-12 rounded-md text-sm font-bold uppercase tracking-widest focus:border-white/20 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/30"
              size={18}
            />
            <input
              type="password"
              placeholder="PASSWORD"
              required
              className="w-full bg-secondary/50 border border-white/5 p-4 pl-12 rounded-md text-sm font-bold uppercase tracking-widest focus:border-white/20 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 uppercase tracking-[0.3em] text-[10px] font-black flex items-center justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <ArrowRight size={18} /> Establish Identity
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-accent/30 text-[10px] uppercase tracking-widest font-bold">
          Already a member?{" "}
          <Link
            to="/login"
            className="text-white hover:underline transition-all"
          >
            Authenticate
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
