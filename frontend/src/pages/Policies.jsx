import React from "react";

const PolicyLayout = ({ title, children }) => (
  <div className="pt-32 pb-24 min-h-screen bg-[#f6f6f6] text-primary">
    <div className="container mx-auto px-6 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-12">
        {title}
      </h1>
      <div className="prose prose-sm md:prose-base max-w-none text-primary/70 leading-relaxed space-y-6 font-sans">
        {children}
      </div>
      <div className="mt-16 pt-8 border-t border-primary/10 text-[10px] uppercase tracking-widest font-bold text-primary/40">
        Last Updated: March 2026
      </div>
    </div>
  </div>
);

export const TermsAndConditions = () => (
  <PolicyLayout title="Terms & Conditions">
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">1. Introduction</h2>
      <p>Welcome to UrbanDos. By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">2. Use of Service</h2>
      <p>Our service is provided "as is" and "as available". We reserve the right to withdraw or amend our service without notice.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">3. Products & Pricing</h2>
      <p>We strive to display our products as accurately as possible. Prices are subject to change without notice.</p>
    </section>
    <p>Admin will edit this section with detailed legal terms later.</p>
  </PolicyLayout>
);

export const PrivacyPolicy = () => (
  <PolicyLayout title="Privacy Policy">
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">1. Information Collection</h2>
      <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">2. Use of Information</h2>
      <p>We use your information to process orders, improve our services, and communicate with you about your account and our products.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">3. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information.</p>
    </section>
    <p>Admin will edit this section with detailed privacy terms later.</p>
  </PolicyLayout>
);

export const ShippingPolicy = () => (
  <PolicyLayout title="Shipping Policy">
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">1. Processing Time</h2>
      <p>Orders are typically processed within 24-48 hours. Custom orders may take longer.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">2. Shipping Rates</h2>
      <p>Shipping rates are calculated based on the number of items in your order. Standard shipping starts at ₹60.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">3. Delivery Times</h2>
      <p>Estimated delivery times vary by location, typically ranging from 3-7 business days within India.</p>
    </section>
    <p>Admin will edit this section with detailed shipping details later.</p>
  </PolicyLayout>
);

export const ReturnExchangePolicy = () => (
  <PolicyLayout title="Returns & Exchanges">
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">1. Return Eligibility</h2>
      <p>Items must be returned within 7 days of delivery in their original condition, unwashed and with tags attached.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">2. Exchange Policy</h2>
      <p>We offer size exchanges subject to availability. Please contact support to initiate an exchange.</p>
    </section>
    <section>
      <h2 className="text-xl font-black text-primary uppercase mb-4 tracking-tight">3. Refund Process</h2>
      <p>Once your return is received and inspected, refunds will be processed to the original payment method within 24-48 hours.</p>
    </section>
    <p>Admin will edit this section with detailed return/exchange terms later.</p>
  </PolicyLayout>
);
