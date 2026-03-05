import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/profile");
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/profile");
    } catch (err) {
      setError("Google login failed.");
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
            Enter the Void
          </h1>
          <p className="text-accent/30 text-[10px] uppercase tracking-widest font-bold">
            "Welcome back to the collection."
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <ArrowRight size={18} /> Authenticate
              </>
            )}
          </button>
        </form>

        <div className="relative my-10 text-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/5" />
          <span className="relative bg-[#1a1a1a] px-4 text-[10px] text-accent/20 uppercase tracking-[0.5em] font-bold">
            OR
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-white/5 p-4 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#f6f6f6] hover:text-primary transition-all duration-300"
        >
          <img
            src="https://www.google.com/favicon.ico"
            className="w-4 h-4 grayscale group-hover:grayscale-0"
            alt=""
          />
          Continue with Google
        </button>

        <p className="mt-10 text-center text-accent/30 text-[10px] uppercase tracking-widest font-bold">
          New here?{" "}
          <Link
            to="/signup"
            className="text-white hover:underline transition-all"
          >
            Create Identity
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
