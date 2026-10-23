import React from "react";
import {
  ShieldCheck,
  Info,
  BookOpen,
  Lock,
  FileText,
  CheckCircle2,
  Sparkles,
  Heart,
  Globe,
  Award,
} from "lucide-react";
import { ShopzaLogo } from "../components/layout/ShopzaLogo";

// 46. Shopza Buyer Protection Guarantee (Page 46)
export const BuyerProtectionPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0C1535] via-[#081026] to-[#0A0D1D] border border-blue-500/30 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#7928CA] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-900/50">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white">The Shopza Buyer Guarantee</h1>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Every purchase made on Shopza is protected by our verified buyer protection guarantee. We ensure authentic merchandise, secure Paystack payments, and reliable delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-2">
          <h3 className="font-bold text-white text-sm text-blue-400">1. Paystack Secure Pay</h3>
          <p className="text-slate-300 leading-relaxed">
            Your payment is processed through Paystack's PCI-DSS Level 1 certified gateway. Every transaction is authenticated and verified before fulfillment.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-2">
          <h3 className="font-bold text-white text-sm text-[#7928CA]">2. 100% Authentic Guarantee</h3>
          <p className="text-slate-300 leading-relaxed">
            If an item is counterfeit or differs from the listing description, we guarantee an instant 100% refund with prepaid return shipping.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-2">
          <h3 className="font-bold text-white text-sm text-emerald-400">3. 30-Day Easy Returns</h3>
          <p className="text-slate-300 leading-relaxed">
            Unhappy with fit, texture, or style? Request an RMA in one click and return it directly within 30 days for a full reimbursement.
          </p>
        </div>
      </div>
    </div>
  );
};

// 47. About Shopza & Our Mission (Page 47)
export const AboutUsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center space-y-4 py-6">
        <ShopzaLogo variant="hero" />
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed mt-4">
          Founded on the principle of transparent commerce, Shopza is a next-generation decentralized marketplace built for creative artisans, technology innovators, and conscious shoppers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 text-center space-y-2">
          <Globe className="w-8 h-8 text-blue-400 mx-auto" />
          <h4 className="font-bold text-white text-sm">Global Merchant Network</h4>
          <p className="text-slate-400">Connecting shoppers with over 12,000 independent shops worldwide.</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
          <h4 className="font-bold text-white text-sm">Curation First</h4>
          <p className="text-slate-400">Every store is vetted for ethical manufacturing, quality, and craftsmanship.</p>
        </div>
        <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 text-center space-y-2">
          <Award className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="font-bold text-white text-sm">Direct Creator Support</h4>
          <p className="text-slate-400">96.5% of every transaction goes directly into the hands of the seller.</p>
        </div>
      </div>
    </div>
  );
};

// 48. Seller Handbook & Merchant Policy (Page 48)
export const SellerHandbookPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <span>Seller Handbook & Merchant Policy</span>
        </h1>
        <p className="text-xs text-slate-400">Operating guidelines, shipping expectations, and marketplace best practices</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs leading-relaxed text-slate-300">
        <h3 className="font-bold text-white text-sm">Fulfillment Standards</h3>
        <p>
          Merchants must package orders within 48 hours of purchase confirmation and upload genuine carrier tracking details (FedEx, UPS, USPS, DHL).
        </p>

        <h3 className="font-bold text-white text-sm pt-2">Listing Accuracy</h3>
        <p>
          All product photography must accurately portray the product in true light. Misleading stock photos or counterfeit branding results in immediate storefront suspension.
        </p>

        <h3 className="font-bold text-white text-sm pt-2">Commission & Payout Rates</h3>
        <p>
          Shopza charges a flat 3.5% transaction commission. There are no monthly listing fees or hidden charges. Payouts are transferred automatically every week.
        </p>
      </div>
    </div>
  );
};

// 49. Trust, Safety & Verification Rules (Page 49)
export const TrustSafetyPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#7928CA]" />
          <span>Trust, Safety & Verification Rules</span>
        </h1>
        <p className="text-xs text-slate-400">How we keep the Shopza buy & sell ecosystem secure for millions of members</p>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Identity & Bank Verification</span>
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Every seller must undergo identity verification via government-issued photo ID and corporate registry verification before receiving payouts.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F142A] border border-blue-900/30 space-y-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Automated Anti-Fraud Monitoring</span>
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Real-time machine intelligence scans for anomalous checkout behavior, proxy masking, and card cycling to protect merchant stores from unauthorized chargebacks.
          </p>
        </div>
      </div>
    </div>
  );
};

// 50. Terms of Service & Privacy Policy (Page 50)
export const TermsPrivacyPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-400" />
          <span>Terms of Service & Privacy Policy</span>
        </h1>
        <p className="text-xs text-slate-400">Legal agreement, consumer data rights, and GDPR compliance</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs leading-relaxed text-slate-300">
        <h3 className="font-bold text-white text-sm">1. Terms of Platform Usage</h3>
        <p>
          By creating an account or browsing the Shopza marketplace, you agree to comply with our community terms, non-discrimination policies, and verified dispute procedures.
        </p>

        <h3 className="font-bold text-white text-sm pt-2">2. Privacy & Data Handling</h3>
        <p>
          We never sell your personal information or contact details to third-party advertising brokers. Your shipping information is only shared with merchants for direct fulfillment.
        </p>

        <h3 className="font-bold text-white text-sm pt-2">3. Dispute Resolution</h3>
        <p>
          In the event of an unresolvable transaction dispute between a buyer and seller, Shopza Mediation acts as a neutral binding arbitrator under our Buyer Protection Guarantee.
        </p>
      </div>
    </div>
  );
};
