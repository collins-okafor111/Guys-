import React, { useState } from "react";
import {
  MessagesSquare,
  Bell,
  HelpCircle,
  Headphones,
  Search,
  ChevronDown,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { User } from "../types";

interface SupportPagesProps {
  currentUser: User | null;
  onOpenAuth: (tab?: any) => void;
  onNavigate: (pageId: string) => void;
}

// 42. Direct Messaging & Chat Inbox (Page 42)
export const MessagingInboxPage: React.FC<SupportPagesProps> = ({ currentUser, onOpenAuth }) => {
  const [activeChat, setActiveChat] = useState("1");
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", sender: "seller", text: "Hello! Thanks for reaching out. Yes, the mechanical keyboard switches are hot-swappable.", time: "10:24 AM" },
    { id: "m2", sender: "buyer", text: "Awesome! What stabilizers come pre-installed?", time: "10:26 AM" },
    { id: "m3", sender: "seller", text: "They are factory-lubed PCB-mounted screw-in stabilizers for optimal acoustics.", time: "10:28 AM" },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "buyer", text: inputMsg, time: "Just now" }]);
    setInputMsg("");
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <MessagesSquare className="w-6 h-6 text-blue-400" />
          <span>Direct Messaging & Chat Inbox</span>
        </h1>
        <p className="text-xs text-slate-400">Communicate directly with verified sellers about products, shipping, and custom requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[550px] bg-[#0F142A] rounded-3xl border border-blue-900/30 overflow-hidden">
        {/* Chat List */}
        <div className="border-r border-blue-900/30 p-4 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversations</span>
          <div className="space-y-2">
            <button
              onClick={() => setActiveChat("1")}
              className={`w-full p-3 rounded-2xl text-left text-xs transition-colors ${
                activeChat === "1" ? "bg-blue-950/60 border border-blue-500/40" : "bg-[#070914] hover:bg-[#151C3B]"
              }`}
            >
              <p className="font-bold text-white">Aura Acoustics Store</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">They are factory-lubed PCB-mounted...</p>
            </button>
            <button
              onClick={() => setActiveChat("2")}
              className={`w-full p-3 rounded-2xl text-left text-xs transition-colors ${
                activeChat === "2" ? "bg-blue-950/60 border border-blue-500/40" : "bg-[#070914] hover:bg-[#151C3B]"
              }`}
            >
              <p className="font-bold text-white">Nordic Living Studio</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">Tracking update: Shipped via FedEx</p>
            </button>
          </div>
        </div>

        {/* Chat View */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 bg-[#070914]/50">
          <div className="border-b border-blue-900/30 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white">Aura Acoustics (Verified Merchant)</span>
            </div>
            <span className="text-[10px] text-slate-400">Response time: ~15 mins</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "buyer" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-sm ${
                    m.sender === "buyer"
                      ? "bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white"
                      : "bg-[#0F142A] border border-blue-900/40 text-slate-200"
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">{m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-blue-900/30">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type your message to merchant..."
              className="flex-1 px-4 py-2 bg-[#0F142A] border border-blue-900/40 rounded-xl text-xs text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// 43. Notifications & Activity Center (Page 43)
export const NotificationsPage: React.FC<SupportPagesProps> = () => {
  const notifs = [
    { id: "1", title: "Order Dispatched", desc: "Your order #SPZ-48192 has left the merchant facility in Portland, OR.", time: "1 hour ago", icon: Truck },
    { id: "2", title: "Price Drop Alert", desc: "An item on your wishlist (Minimalist Ceramic Vase) dropped by 20%.", time: "5 hours ago", icon: Bell },
    { id: "3", title: "Store Announcement", desc: "Aura Acoustics just released 3 new studio monitor accessories.", time: "Yesterday", icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-purple-400" />
          <span>Notifications & Activity Center</span>
        </h1>
        <p className="text-xs text-slate-400">Order milestones, shipping alerts, and merchant catalog drops</p>
      </div>

      <div className="space-y-3">
        {notifs.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="p-4 rounded-2xl bg-[#0F142A] border border-blue-900/30 flex items-start gap-3 text-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-950/70 border border-blue-800/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
                <p className="text-slate-300 mt-1">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 44. Help Center & Knowledge Base (Page 44)
export const HelpCenterPage: React.FC<SupportPagesProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Shopza Buyer Protection work?",
      a: "When you place an order, your payment is held securely in escrow. Funds are only released to the seller once you receive your items in full compliance with the listing description."
    },
    {
      q: "What is the return and refund timeframe?",
      a: "All purchases on Shopza come standard with our 30-Day Hassle-Free Return Guarantee. You can request a return directly through the Returns & Refund portal."
    },
    {
      q: "How are merchant stores verified?",
      a: "Every merchant completes government business identity checks, physical warehouse validation, and product authenticity verification before publishing listings."
    },
    {
      q: "What payment methods are supported?",
      a: "Shopza accepts all major credit/debit cards (Visa, Mastercard, American Express), Google Pay, Apple Pay, and Shopza Escrow Pay."
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-400" />
          <span>Help Center & Knowledge Base</span>
        </h1>
        <p className="text-xs text-slate-400">Frequently asked questions and guides on buying and selling on Shopza</p>
      </div>

      <div className="space-y-3">
        {faqs.map((f, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#0F142A] border border-blue-900/30 overflow-hidden text-xs"
          >
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full p-4 text-left font-bold text-white flex justify-between items-center"
            >
              <span>{f.q}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? "rotate-180 text-blue-400" : "text-slate-500"}`} />
            </button>
            {openFaq === idx && (
              <div className="px-4 pb-4 text-slate-300 leading-relaxed border-t border-blue-900/20 pt-3">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 45. Contact Support & Help Tickets (Page 45)
export const ContactSupportPage: React.FC<SupportPagesProps> = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div className="border-b border-blue-900/25 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Headphones className="w-6 h-6 text-[#00C2FF]" />
          <span>Contact Support & Help Tickets</span>
        </h1>
        <p className="text-xs text-slate-400">Our 24/7 dedicated customer care specialists reply within 2 hours</p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-[#0F142A] border border-emerald-500/40 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Ticket Submitted Successfully</h3>
          <p className="text-xs text-slate-300">Ticket #SUP-29401 has been assigned to our senior resolution team.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="p-6 rounded-3xl bg-[#0F142A] border border-blue-900/30 space-y-4 text-xs"
        >
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Inquiry Subject</label>
            <input
              type="text"
              required
              placeholder="e.g., Question regarding order fulfillment or return"
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Message</label>
            <textarea
              rows={4}
              required
              placeholder="Please provide details of your issue, including order number if applicable..."
              className="w-full px-3 py-2 bg-[#070914] border border-blue-900/40 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl font-bold shadow-lg shadow-blue-900/40"
          >
            Submit Help Desk Ticket
          </button>
        </form>
      )}
    </div>
  );
};
