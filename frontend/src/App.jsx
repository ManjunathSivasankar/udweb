import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import PaymentStatus from "./pages/PaymentStatus";
import HelpCenter from "./pages/HelpCenter";
import {
  TermsAndConditions,
  PrivacyPolicy,
  ShippingPolicy,
  ReturnExchangePolicy,
} from "./pages/Policies";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CollectionProvider } from "./context/CollectionContext";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <CollectionProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Collection />} />
                <Route path="category/:id" element={<Collection />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="Cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Admin />} />
                <Route
                  path="payment-status/:orderId"
                  element={<PaymentStatus />}
                />
                <Route path="terms" element={<TermsAndConditions />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="shipping-policy" element={<ShippingPolicy />} />
                <Route path="returns" element={<ReturnExchangePolicy />} />
                <Route path="help" element={<HelpCenter />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </CollectionProvider>
    </AuthProvider>
  );
}

export default App;
