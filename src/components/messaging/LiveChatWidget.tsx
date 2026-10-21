import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Store,
  User as UserIcon,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  CheckCheck,
  PlusCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";
import { useVoiceAssistant } from "../../hooks/useVoiceAssistant";
import { Conversation, Message, Product, Store as StoreType } from "../../types";
import { subscribeToMessages } from "../../services/firestoreService";

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  initialSellerId?: string;
  initialStoreId?: string;
  onOpenAuth: (tab?: "login" | "register") => void;
  onSelectProduct?: (product: Product) => void;
  onOpenStore?: (slugOrId: string) => void;
}

const QUICK_INQUIRIES = [
  "Hi! Is this item available for immediate dispatch?",
  "Can you offer a bundle discount for multiple items?",
  "Do you support custom sizing or color requests?",
  "What is the estimated delivery time to my location?",
];

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  isOpen,
  onClose,
  onOpen,
  initialSellerId,
  initialStoreId,
  onOpenAuth,
  onOpenStore,
}) => {
  const { currentUser } = useAuth();
  const {
    db,
    listUserConversations,
    listMessages,
    sendMessage,
    getOrCreateConversation,
    getStoreById,
    markMessagesAsRead,
    listStores,
  } = useFirebase();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "sellers" | "buyers">("all");
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech-to-text dictation
  const {
    status: voiceStatus,
    transcript: voiceTranscript,
    startListening,
    stopListening,
    isSupported: isVoiceSupported,
  } = useVoiceAssistant((action) => {
    if (action.rawText) {
      setMessageText((prev) => (prev ? `${prev} ${action.rawText}` : action.rawText));
    }
  });

  useEffect(() => {
    if (voiceTranscript) {
      setMessageText((prev) => (prev ? `${prev} ${voiceTranscript}` : voiceTranscript));
    }
  }, [voiceTranscript]);

  // Load conversations or auto-start target when opened with initialSellerId
  useEffect(() => {
    if (isOpen && currentUser) {
      if (initialSellerId && initialSellerId !== currentUser._id) {
        getOrCreateConversation({
          user1Id: currentUser._id,
          user2Id: initialSellerId,
          storeId: initialStoreId,
        }).then((convId: string) => {
          setActiveConversationId(convId);
        });
      } else {
        const convos = listUserConversations(currentUser._id);
        if (convos.length > 0 && !activeConversationId) {
          setActiveConversationId(convos[0]._id);
        }
      }
    }
  }, [isOpen, currentUser, initialSellerId, initialStoreId]);

  // Subscribe to real-time Cloud Firestore messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setRealtimeMessages([]);
      return;
    }

    // Initial load from local state
    if (currentUser) {
      const initialMsgs = listMessages(activeConversationId, currentUser._id);
      setRealtimeMessages(initialMsgs);
      markMessagesAsRead(activeConversationId, currentUser._id);
    }

    // Attach live Firestore listener
    const unsubscribe = subscribeToMessages(
      activeConversationId,
      (liveMsgs) => {
        setRealtimeMessages(liveMsgs);
        if (currentUser) {
          markMessagesAsRead(activeConversationId, currentUser._id);
        }
      },
      (err) => {
        console.warn("Firestore live chat sync error:", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeConversationId, currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realtimeMessages]);

  const rawConversations = currentUser ? listUserConversations(currentUser._id) : [];
  const conversations = rawConversations.map((c) => {
    const otherUserId = c.participantIds.find((id) => id !== currentUser?._id);
    const otherUser = otherUserId ? db.users.find((u) => u._id === otherUserId) || null : null;
    const store = c.storeId ? getStoreById(c.storeId) : null;
    const isOtherSeller = Boolean(store || otherUser?.role === "seller");
    return {
      ...c,
      otherUser,
      store,
      isOtherSeller,
    };
  });

  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "sellers" && !c.isOtherSeller) return false;
    if (activeTab === "buyers" && c.isOtherSeller) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = c.otherUser?.name.toLowerCase().includes(q);
      const matchStore = c.store?.name.toLowerCase().includes(q);
      const matchMsg = c.lastMessage?.toLowerCase().includes(q);
      return matchName || matchStore || matchMsg;
    }
    return true;
  });

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeConversationId || !currentUser || isSending) return;

    const textToSend = messageText.trim();
    setMessageText("");
    setIsSending(true);

    try {
      await sendMessage({
        conversationId: activeConversationId,
        senderId: currentUser._id,
        text: textToSend,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartChatWithStore = async (st: StoreType) => {
    if (!currentUser) {
      onOpenAuth("login");
      return;
    }
    if (st.ownerId === currentUser._id) {
      return;
    }
    const convId = await getOrCreateConversation({
      user1Id: currentUser._id,
      user2Id: st.ownerId,
      storeId: st._id,
    });
    setActiveConversationId(convId);
    setIsNewChatModalOpen(false);
  };

  const allAvailableStores = listStores();
  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // If floating widget is closed, render floating bubble button
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-full shadow-2xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all font-bold text-xs border border-white/20 group"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A0D1D] animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A0D1D]" />
        </div>
        <span className="hidden sm:inline">Buyer & Seller Live Chat</span>
        {totalUnreadCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
            {totalUnreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[720px] sm:h-[620px] z-50 flex flex-col bg-[#0A0D1D] sm:rounded-3xl shadow-2xl border border-blue-900/40 overflow-hidden font-['Plus_Jakarta_Sans'] text-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#101736] via-[#0E132B] to-[#151036] border-b border-blue-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">Live Marketplace Chat</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Realtime
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Direct negotiations between buyers & verified sellers</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsNewChatModalOpen(!isNewChatModalOpen)}
            className="px-2.5 py-1.5 bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-blue-700/30"
            title="Start New Chat"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#070914]/60">
          <div className="w-16 h-16 rounded-3xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 shadow-xl">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Sign In to Chat with Sellers & Buyers</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Ask sellers about inventory, request custom discounts, get shipping updates, and communicate securely.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onOpenAuth("login")}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
            >
              Sign In to Start Chatting
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="px-6 py-2.5 bg-[#0F142A] hover:bg-[#151C3B] text-slate-200 border border-blue-900/40 rounded-xl text-xs font-bold transition-all"
            >
              Create Free Account
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar / Conversation List */}
          <div className="w-2/5 border-r border-blue-900/30 bg-[#070914] flex flex-col">
            {/* Search and Filters */}
            <div className="p-3 border-b border-blue-900/30 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0F142A] border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                    activeTab === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  onClick={() => setActiveTab("sellers")}
                  className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                    activeTab === "sellers" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sellers
                </button>
                <button
                  onClick={() => setActiveTab("buyers")}
                  className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                    activeTab === "buyers" ? "bg-blue-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Buyers
                </button>
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-3">
                  <p>No conversations found.</p>
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-950/70 border border-blue-800/40 text-blue-300 rounded-xl text-[11px] font-bold hover:bg-blue-900/50"
                  >
                    + Message a Store Owner
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = c._id === activeConversationId;
                  return (
                    <button
                      key={c._id}
                      onClick={() => {
                        setActiveConversationId(c._id);
                        setIsNewChatModalOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-950/80 to-purple-950/80 border border-blue-500/50 shadow-sm"
                          : "hover:bg-[#0F142A]"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            c.otherUser?.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${c.otherUser?.name || "User"}`
                          }
                          alt={c.otherUser?.name || "User"}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-blue-900/40"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#070914]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white truncate">
                            {c.otherUser?.name || "Marketplace User"}
                          </span>
                          {c.unreadCount && c.unreadCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-purple-600 text-white">
                              {c.unreadCount}
                            </span>
                          ) : null}
                        </div>

                        {c.store ? (
                          <p className="text-[10px] text-purple-400 font-bold truncate flex items-center gap-1">
                            <Store className="w-2.5 h-2.5 flex-shrink-0" />
                            {c.store.name}
                          </p>
                        ) : (
                          <p className="text-[10px] text-blue-400 font-medium truncate">
                            {c.isOtherSeller ? "Merchant Account" : "Buyer Account"}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.lastMessage || "Conversation started"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-[#0A0D1D] relative">
            {isNewChatModalOpen ? (
              /* New Chat Picker */
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="border-b border-blue-900/30 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Start a Conversation</h4>
                    <p className="text-xs text-slate-400">Select any merchant store to connect with their owner</p>
                  </div>
                  <button
                    onClick={() => setIsNewChatModalOpen(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Available Stores ({allAvailableStores.length})
                  </span>

                  {allAvailableStores.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-[#0F142A] rounded-2xl border border-blue-900/30">
                      No merchant stores open yet. Create the first store in the Seller Hub to chat with buyers!
                    </div>
                  ) : (
                    allAvailableStores.map((st) => (
                      <button
                        key={st._id}
                        onClick={() => handleStartChatWithStore(st)}
                        className="w-full p-3 rounded-2xl bg-[#0F142A] hover:bg-[#151C3B] border border-blue-900/30 hover:border-blue-500/40 text-left transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={st.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400"}
                            alt={st.name}
                            className="w-10 h-10 rounded-xl object-cover border border-blue-900/40"
                          />
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                              {st.name}
                              {st.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{st.description}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-blue-950/70 text-blue-400 border border-blue-800/40 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1">
                          <span>Message</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : activeConversation ? (
              /* Active Conversation */
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-blue-900/30 bg-[#070914] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        activeConversation.otherUser?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${activeConversation.otherUser?.name}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-xl object-cover border border-blue-900/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">
                          {activeConversation.otherUser?.name || "Participant"}
                        </h4>
                        {activeConversation.store && (
                          <button
                            onClick={() => onOpenStore?.(activeConversation.store!.slug)}
                            className="text-[10px] text-purple-400 hover:underline font-bold flex items-center gap-1"
                          >
                            <Store className="w-2.5 h-2.5" />
                            {activeConversation.store.name}
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online & Ready to Chat
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Inquiries Carousel */}
                <div className="px-3 py-2 border-b border-blue-900/20 bg-[#0F142A]/40 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 font-bold whitespace-nowrap">Quick:</span>
                  {QUICK_INQUIRIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessageText(q)}
                      className="px-2.5 py-1 rounded-lg bg-[#090C1D] hover:bg-blue-950/70 border border-blue-900/30 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                  {realtimeMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-blue-400/40" />
                      <p className="font-bold text-white">Start the conversation!</p>
                      <p className="text-[11px] max-w-xs">
                        Ask questions about specifications, dispatch schedules, bulk discounts, or special requests.
                      </p>
                    </div>
                  ) : (
                    realtimeMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`p-3 rounded-2xl max-w-[80%] ${
                              isMe
                                ? "bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white shadow-md rounded-tr-xs"
                                : "bg-[#0F142A] border border-blue-900/40 text-slate-200 rounded-tl-xs"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-blue-900/30 bg-[#070914] flex items-center gap-2"
                >
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={voiceStatus === "listening" ? stopListening : startListening}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        voiceStatus === "listening"
                          ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                          : "bg-[#0F142A] border-blue-900/40 text-slate-400 hover:text-white"
                      }`}
                      title={voiceStatus === "listening" ? "Listening..." : "Dictate with Voice"}
                    >
                      {voiceStatus === "listening" ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                  )}

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message to seller / buyer..."
                    className="flex-1 px-3.5 py-2 text-xs bg-[#0F142A] border border-blue-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* No Active Chat Selected */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
                <MessageSquare className="w-10 h-10 text-blue-500/40" />
                <h4 className="text-sm font-bold text-white">No Conversation Selected</h4>
                <p className="text-xs max-w-xs">
                  Pick an existing chat from the left or click "New Chat" to message any merchant store owner.
                </p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
