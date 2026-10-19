import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole } from "../types";
import { useConvex } from "./ConvexContext";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  firebaseAuth,
  googleAuthProvider,
  firestoreDb,
  handleFirestoreError,
  OperationType,
} from "../firebase";
import { saveUserToFirestore } from "../services/firestoreService";

export interface ResendStatusInfo {
  configured: boolean;
  sender: string;
  isTestingSender: boolean;
  rules: {
    domainVerified: boolean;
    restrictionMessage: string;
  };
}

export interface RegisterArgs {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  confirmPassword?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  resendStatus: ResendStatusInfo | null;
  refreshResendStatus: () => Promise<void>;
  register: (args: RegisterArgs) => Promise<{
    user: User;
    emailSent: boolean;
    errorNotice?: string;
    isDomainRestriction?: boolean;
    guidance?: string;
  }>;
  login: (email: string, password?: string) => Promise<User>;
  loginWithGoogle: (role?: UserRole) => Promise<User>;
  hasGoogleClientId: boolean;
  logout: () => void;
  updateProfile: (updates: {
    name?: string;
    bio?: string;
    phone?: string;
    avatarUrl?: string;
    role?: UserRole;
  }) => Promise<User>;
  switchAccount: (userId: string) => void;
  allUsers: User[];
  sendVerificationEmail: (email?: string) => Promise<{
    success: boolean;
    error?: string;
    isDomainRestriction?: boolean;
    guidance?: string;
    cooldownRemaining?: number;
  }>;
  verifyEmailCode: (code: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{
    success: boolean;
    message: string;
    error?: string;
    isDomainRestriction?: boolean;
    guidance?: string;
  }>;
  resetPasswordWithCode: (
    email: string,
    code: string,
    newPassword?: string,
    confirmPassword?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY_AUTH_USER = "shopza_auth_current_user_id";
const STORAGE_KEY_SESSION_TOKEN = "shopza_session_token";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useConvex();
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH_USER) || null;
  });

  const [resendStatus, setResendStatus] = useState<ResendStatusInfo | null>(null);

  // Genuine Google Auth is always available via Firebase Auth
  const hasGoogleClientId = true;

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const uid = fbUser.uid;
        const email = (fbUser.email || "").toLowerCase().trim();
        const name = fbUser.displayName || email.split("@")[0] || "User";
        const avatarUrl =
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

        let existing = db.users.find((u) => u._id === uid || u.email.toLowerCase() === email);

        if (!existing) {
          // Check Firestore
          try {
            const userSnap = await getDoc(doc(firestoreDb, "users", uid));
            if (userSnap.exists()) {
              existing = userSnap.data() as User;
            }
          } catch {
            // ignore network/offline probe
          }
        }

        const now = Date.now();
        const verifiedUser: User = {
          _id: uid,
          name: existing?.name || name,
          email,
          role: existing?.role || "buyer",
          avatarUrl: existing?.avatarUrl || avatarUrl,
          bio: existing?.bio,
          phone: existing?.phone,
          emailVerified: true,
          authProvider: "google",
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        };

        const idx = db.users.findIndex((u) => u._id === uid || u.email.toLowerCase() === email);
        if (idx >= 0) {
          db.users[idx] = verifiedUser;
        } else {
          db.users.push(verifiedUser);
        }

        setCurrentUserId(uid);
      }
    });

    return () => unsubscribe();
  }, [db.users]);

  // Sync user state from backend session if token exists
  useEffect(() => {
    const sessionToken = localStorage.getItem(STORAGE_KEY_SESSION_TOKEN);
    if (!sessionToken) return;

    fetch("/api/auth/session", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          const sUser = data.user;
          let local = db.users.find((u) => u.email.toLowerCase() === sUser.email.toLowerCase());
          if (!local) {
            local = {
              _id: sUser.id,
              name: sUser.name,
              email: sUser.email,
              role: sUser.role,
              avatarUrl: sUser.avatarUrl,
              phone: sUser.phone,
              emailVerified: sUser.emailVerified,
              authProvider: sUser.authProvider,
              createdAt: sUser.createdAt,
              updatedAt: sUser.updatedAt,
            };
            db.users.push(local);
          } else {
            local.emailVerified = sUser.emailVerified;
            local.updatedAt = sUser.updatedAt;
          }
          setCurrentUserId(local._id);
        }
      })
      .catch(() => {});
  }, [db.users]);

  // Fetch Resend server status
  const refreshResendStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/resend-status");
      if (res.ok) {
        const data = await res.json();
        setResendStatus(data);
      }
    } catch {
      // Backend may be starting or offline
    }
  }, []);

  useEffect(() => {
    refreshResendStatus();
  }, [refreshResendStatus]);

  const currentUser = React.useMemo(() => {
    if (!currentUserId) return null;
    return db.users.find((u) => u._id === currentUserId) || null;
  }, [currentUserId, db.users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    }
  }, [currentUserId]);

  // Send real verification email via server-side Resend API
  const sendVerificationEmail = useCallback(
    async (targetEmail?: string) => {
      const email = (targetEmail || currentUser?.email || "").toLowerCase().trim();
      const name = currentUser?.name || "Shopza Member";

      if (!email) {
        return { success: false, error: "No email address specified." };
      }

      try {
        const res = await fetch("/api/auth/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: data.error || "Failed to send verification email.",
            isDomainRestriction: data.isDomainRestriction,
            guidance: data.guidance,
            cooldownRemaining: data.cooldownRemaining,
          };
        }

        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Network error while connecting to email service.",
        };
      }
    },
    [currentUser]
  );

  // Verify 6-digit code
  const verifyEmailCode = useCallback(
    async (code: string, targetEmail?: string) => {
      const email = (targetEmail || currentUser?.email || "").toLowerCase().trim();
      if (!email) {
        return { success: false, error: "No email address found to verify." };
      }

      try {
        const res = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, type: "email_verification" }),
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: data.error || "Incorrect or expired verification code.",
          };
        }

        const user = db.users.find((u) => u.email.toLowerCase() === email);
        if (user) {
          user.emailVerified = true;
          user.updatedAt = Date.now();
          // Also persist to Firestore
          saveUserToFirestore(user).catch(() => {});
          db.notifications.unshift({
            _id: `notif_${Date.now()}_verified`,
            userId: user._id,
            type: "system",
            title: "Email Successfully Verified",
            message: "Your email has been verified. Your account is now fully confirmed.",
            read: false,
            createdAt: Date.now(),
          });
        }

        setCurrentUserId((prev) => (prev ? `${prev}` : null));
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Network error verifying code.",
        };
      }
    },
    [currentUser, db.users, db.notifications]
  );

  // Register with email & password
  const register = useCallback(
    async (args: RegisterArgs) => {
      const normalizedEmail = args.email.toLowerCase().trim();

      if (args.confirmPassword !== undefined && args.password !== args.confirmPassword) {
        throw new Error("Passwords do not match. Please re-enter your password.");
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: args.name.trim(),
          email: normalizedEmail,
          password: args.password,
          confirmPassword: args.confirmPassword,
          role: args.role,
          phone: args.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      const sUser = data.user;
      if (data.token) {
        localStorage.setItem(STORAGE_KEY_SESSION_TOKEN, data.token);
      }

      const now = Date.now();
      const localUser: User = {
        _id: sUser.id,
        name: sUser.name,
        email: sUser.email,
        role: sUser.role,
        avatarUrl: sUser.avatarUrl,
        bio: args.bio || "",
        phone: sUser.phone || "",
        emailVerified: sUser.emailVerified || false,
        authProvider: "email",
        createdAt: sUser.createdAt || now,
        updatedAt: sUser.updatedAt || now,
      };

      const existingIdx = db.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
      if (existingIdx >= 0) {
        db.users[existingIdx] = localUser;
      } else {
        db.users.push(localUser);
      }

      // Persist to Cloud Firestore
      saveUserToFirestore(localUser).catch((e) => console.warn("Firestore sync error:", e));

      db.notifications.push({
        _id: `notif_${now}_welcome`,
        userId: localUser._id,
        type: "system",
        title: "Welcome to Shopza!",
        message: `Welcome ${localUser.name}! Your account is active and ready for shopping and selling.`,
        read: false,
        createdAt: now,
      });

      setCurrentUserId(localUser._id);

      return {
        user: localUser,
        emailSent: false,
      };
    },
    [db]
  );

  // Sign In with email and password
  const login = useCallback(
    async (email: string, password?: string) => {
      const normalized = email.toLowerCase().trim();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      const sUser = data.user;
      if (data.token) {
        localStorage.setItem(STORAGE_KEY_SESSION_TOKEN, data.token);
      }

      let local = db.users.find((u) => u.email.toLowerCase() === normalized);
      if (!local) {
        local = {
          _id: sUser.id,
          name: sUser.name,
          email: sUser.email,
          role: sUser.role,
          avatarUrl: sUser.avatarUrl,
          phone: sUser.phone,
          emailVerified: sUser.emailVerified,
          authProvider: sUser.authProvider,
          createdAt: sUser.createdAt,
          updatedAt: sUser.updatedAt,
        };
        db.users.push(local);
      } else {
        local.name = sUser.name;
        local.emailVerified = sUser.emailVerified;
      }

      saveUserToFirestore(local).catch(() => {});
      setCurrentUserId(local._id);
      return local;
    },
    [db.users]
  );

  // Genuine Google OAuth flow via Firebase Auth and Google Identity
  const loginWithGoogle = useCallback(
    async (role: UserRole = "buyer"): Promise<User> => {
      try {
        const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
        const fbUser = credential.user;

        if (!fbUser || !fbUser.email) {
          throw new Error("Unable to retrieve verified email from Google account.");
        }

        const email = fbUser.email.toLowerCase().trim();
        const name = fbUser.displayName || email.split("@")[0] || "Google Member";
        const avatarUrl =
          fbUser.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        const uid = fbUser.uid;
        const now = Date.now();

        // Check if user exists in Firestore
        let userProfile: User;
        try {
          const userDoc = await getDoc(doc(firestoreDb, "users", uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as Partial<User>;
            userProfile = {
              _id: uid,
              name: data.name || name,
              email,
              role: data.role || role,
              avatarUrl: data.avatarUrl || avatarUrl,
              bio: data.bio,
              phone: data.phone,
              emailVerified: true,
              authProvider: "google",
              createdAt: data.createdAt || now,
              updatedAt: now,
            };
          } else {
            userProfile = {
              _id: uid,
              name,
              email,
              role,
              avatarUrl,
              emailVerified: true,
              authProvider: "google",
              createdAt: now,
              updatedAt: now,
            };
          }
        } catch {
          userProfile = {
            _id: uid,
            name,
            email,
            role,
            avatarUrl,
            emailVerified: true,
            authProvider: "google",
            createdAt: now,
            updatedAt: now,
          };
        }

        // Persist to Cloud Firestore
        await saveUserToFirestore(userProfile);

        // Update local state
        const existingIdx = db.users.findIndex(
          (u) => u._id === uid || u.email.toLowerCase() === email
        );
        if (existingIdx >= 0) {
          db.users[existingIdx] = userProfile;
        } else {
          db.users.push(userProfile);
        }

        setCurrentUserId(uid);
        return userProfile;
      } catch (err: any) {
        if (
          err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request"
        ) {
          throw new Error("Google sign-in was cancelled.");
        }
        if (err.code === "auth/popup-blocked") {
          throw new Error(
            "Popup was blocked by your browser. Please allow popups for Google authentication."
          );
        }
        if (err.code === "auth/unauthorized-domain") {
          throw new Error(
            "This domain is not authorized in Firebase OAuth settings. Please check Firebase console auth domain."
          );
        }
        throw new Error(err.message || "Google authentication failed.");
      }
    },
    [db.users]
  );

  const logout = useCallback(() => {
    firebaseSignOut(firebaseAuth).catch(() => {});
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
  }, []);

  const updateProfile = useCallback(
    async (updates: {
      name?: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
      role?: UserRole;
    }) => {
      if (!currentUserId) throw new Error("Not authenticated");
      const user = db.users.find((u) => u._id === currentUserId);
      if (!user) throw new Error("User record not found");

      if (updates.name !== undefined) user.name = updates.name.trim();
      if (updates.bio !== undefined) user.bio = updates.bio.trim();
      if (updates.phone !== undefined) user.phone = updates.phone.trim();
      if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
      if (updates.role !== undefined) user.role = updates.role;
      user.updatedAt = Date.now();

      // Persist to Firestore
      saveUserToFirestore(user).catch(() => {});

      setCurrentUserId((prev) => (prev ? `${prev}` : null));
      return { ...user };
    },
    [currentUserId, db.users]
  );

  const switchAccount = useCallback((userId: string) => {
    setCurrentUserId(userId);
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string) => {
    const normalized = email.toLowerCase().trim();

    try {
      const res = await fetch("/api/auth/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.error || "Failed to dispatch reset code.",
          error: data.error,
          isDomainRestriction: data.isDomainRestriction,
          guidance: data.guidance,
        };
      }

      return {
        success: true,
        message: `A security reset code has been sent to ${email}. Please check your inbox.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to contact reset service.",
        error: err.message,
      };
    }
  }, []);

  // Reset password with code
  const resetPasswordWithCode = useCallback(
    async (email: string, code: string, newPassword?: string, confirmPassword?: string) => {
      const normalized = email.toLowerCase().trim();

      if (!newPassword || newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long.");
      }
      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        throw new Error("New passwords do not match.");
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, code, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid or expired reset code.");
      }

      return { success: true };
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        resendStatus,
        refreshResendStatus,
        register,
        login,
        loginWithGoogle,
        hasGoogleClientId,
        logout,
        updateProfile,
        switchAccount,
        allUsers: db.users,
        sendVerificationEmail,
        verifyEmailCode,
        requestPasswordReset,
        resetPasswordWithCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
