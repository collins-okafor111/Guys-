import React from "react";
import { X, Bell, ShoppingBag, UserPlus, MessageSquare, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFirebase } from "../../context/FirebaseContext";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (link: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { listNotifications, markNotificationRead, markAllNotificationsRead } = useFirebase();

  if (!isOpen || !currentUser) return null;

  const notifications = listNotifications(currentUser._id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-[#0d101d] shadow-2xl border-l border-purple-900/30 flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-4 border-b border-purple-900/30 flex items-center justify-between bg-[#0a0c16]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">
                Notifications ({unreadCount} unread)
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead(currentUser._id)}
                  className="px-2 py-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 rounded hover:bg-[#15192e]"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#15192e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Bell className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  We'll notify you here when you receive orders, new followers, or messages.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    markNotificationRead(n._id, currentUser._id);
                    if (n.link) {
                      onNavigate(n.link);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    n.read
                      ? "bg-[#101426] border-purple-900/25 opacity-75 hover:opacity-100"
                      : "bg-[#161a34] border-purple-500/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#090b14] border border-purple-900/40 flex-shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 shadow-xs shadow-purple-400/50" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
