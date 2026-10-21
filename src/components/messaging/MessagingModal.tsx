import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Mic, Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";
import { useVoiceAssistant } from "../../hooks/useVoiceAssistant";
import { Conversation, Message } from "../../types";

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSellerId?: string;
  initialStoreId?: string;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  initialSellerId,
  initialStoreId,
}) => {
  const { currentUser } = useAuth();
  const {
    listUserConversations,
    listMessages,
    sendMessage,
    getOrCreateConversation,
    getStoreById,
    markMessagesAsRead,
    db,
  } = useFirebase();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech-to-text dictation
  const {
    status: voiceStatus,
    transcript: voiceTranscript,
    startListening,
    stopListening,
    isSupported,
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

  // Load conversations or auto-start target
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

  // Scroll to bottom on new messages and mark read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeConversationId && currentUser) {
      markMessagesAsRead(activeConversationId, currentUser._id);
    }
  }, [activeConversationId, listMessages]);

  if (!isOpen || !currentUser) return null;

  const rawConversations: Conversation[] = listUserConversations(currentUser._id);
  const conversations = rawConversations.map((c: Conversation) => {
    const otherUserId = c.participantIds.find((id) => id !== currentUser._id);
    const otherUser = db.users.find((u) => u._id === otherUserId) || null;
    const store = c.storeId ? getStoreById(c.storeId) : null;
    return {
      ...c,
      otherUser,
      store,
    };
  });

  const activeConversation = conversations.find((c: any) => c._id === activeConversationId);
  const activeMessages: Message[] = activeConversationId
    ? listMessages(activeConversationId, currentUser._id)
    : [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversationId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({
        conversationId: activeConversationId,
        senderId: currentUser._id,
        text: messageText.trim(),
      });
      setMessageText("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden h-[85vh] flex flex-col text-slate-100 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14182e] border border-purple-900/40 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Shopza In-App Messages</h3>
              <p className="text-[11px] text-slate-400">Direct buyer & seller communications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#15192e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-purple-900/30 overflow-y-auto bg-[#0a0c16] p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet. Reach out to any seller from a product or store page!
              </div>
            ) : (
              conversations.map((c: any) => {
                const isSelected = c._id === activeConversationId;
                return (
                  <button
                    key={c._id}
                    onClick={() => setActiveConversationId(c._id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-[#181d38] shadow-sm border border-purple-500/40"
                        : "hover:bg-[#12162a]"
                    }`}
                  >
                    <img
                      src={
                        c.otherUser?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${c.otherUser?.name || "User"}`
                      }
                      alt={c.otherUser?.name || "User"}
                      className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-purple-900/40 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">
                          {c.otherUser?.name || "Marketplace User"}
                        </span>
                        {c.unreadCount && c.unreadCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-xs">
                            {c.unreadCount}
                          </span>
                        ) : null}
                      </div>

                      {c.store && (
                        <p className="text-[10px] text-purple-400 font-semibold truncate flex items-center gap-1">
                          <Store className="w-2.5 h-2.5" />
                          {c.store.name}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.lastMessage || "Started conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Chat Window */}
          <div className="flex-1 flex flex-col bg-[#0d101d]">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        activeConversation.otherUser?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${activeConversation.otherUser?.name}`
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border border-purple-900/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {activeConversation.otherUser?.name || "Participant"}
                      </h4>
                      <p className="text-[10px] text-purple-300">
                        {activeConversation.otherUser?.role === "seller"
                          ? "Verified Marketplace Seller"
                          : "Buyer"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#07080e]">
                  {activeMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Say hello to start the conversation!
                    </div>
                  ) : (
                    activeMessages.map((msg: Message) => {
                      const isMe = msg.senderId === currentUser._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                              isMe
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-xs"
                                : "bg-[#14182e] text-slate-200 border border-purple-900/40 rounded-bl-xs"
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                            <span
                              className={`text-[9px] mt-1 block text-right ${
                                isMe ? "text-purple-200" : "text-slate-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Field */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-purple-900/30 flex items-center gap-2 bg-[#0a0c16]"
                >
                  {isSupported && (
                    <button
                      type="button"
                      onClick={() => {
                        if (voiceStatus === "listening") {
                          stopListening();
                        } else {
                          startListening();
                        }
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        voiceStatus === "listening"
                          ? "bg-rose-600 text-white animate-pulse"
                          : "text-slate-400 hover:text-purple-400 hover:bg-[#15192e]"
                      }`}
                      title={voiceStatus === "listening" ? "Stop dictating" : "Dictate message"}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 text-xs border border-purple-900/40 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-[#12162a] text-white placeholder-slate-500 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-purple-900/40 disabled:opacity-40 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select a conversation on the left to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
