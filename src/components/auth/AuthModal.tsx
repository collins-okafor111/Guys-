import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  ShoppingBag,
  Store as StoreIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  ArrowRight,
  KeyRound,
  Sparkles,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import { ShopzaLogo } from "../layout/ShopzaLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register" | "verify" | "recovery";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "login",
}) => {
  const {
    currentUser,
    register,
    login,
    loginWithGoogle,
    requestPasswordReset,
    resetPasswordWithCode,
  } = useAuth();

  const [tab, setTab] = useState<"login" | "register" | "recovery">(
    defaultTab === "verify" ? "login" : (defaultTab as any)
  );

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [phone, setPhone] = useState("");

  // Password reset 2-step flow state
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTab(defaultTab === "verify" ? "login" : defaultTab);
      setError(null);
      setSuccessMsg(null);
      setRecoveryStep(1);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // 1. REGISTER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (!name.trim() || name.trim().length < 2) {
        throw new Error("Please enter your full name.");
      }
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please provide a valid email address.");
      }
      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      if (!confirmPassword) {
        throw new Error("Please confirm your password.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match. Please ensure both passwords match.");
      }

      const result = await register({
        email: email.trim(),
        name: name.trim(),
        role,
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
        phone: phone.trim() || undefined,
      });

      setSuccessMsg(`Welcome to Shopza, ${result.user.name}! Your account was created successfully.`);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SIGN IN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address.");
      }
      if (!password) {
        throw new Error("Please enter your password.");
      }

      const user = await login(email.trim(), password);
      setSuccessMsg(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Invalid email or credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. GENUINE GOOGLE OAUTH SIGN IN
  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const user = await loginWithGoogle(role);
      setSuccessMsg(`Signed in with Google as ${user.name}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. PASSWORD RESET - STEP 1 (Request Code)
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (!email.trim() || !email.includes("@")) {
        throw new Error("Please enter your registered email address.");
      }

      const res = await requestPasswordReset(email.trim());
      if (!res.success) {
        throw new Error(res.error || res.message || "Failed to send reset code.");
      }

      setSuccessMsg(`A 6-digit verification code has been dispatched to ${email.trim()}. Enter it below to set your new password.`);
      setRecoveryStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. PASSWORD RESET - STEP 2 (Verify Code & Update Password)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (!recoveryCode.trim() || recoveryCode.trim().length !== 6) {
        throw new Error("Please enter the 6-digit verification code sent to your email.");
      }
      if (!newPassword || newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long.");
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error("New passwords do not match. Please verify.");
      }

      const res = await resetPasswordWithCode(
        email.trim(),
        recoveryCode.trim(),
        newPassword,
        confirmNewPassword
      );

      if (!res.success) {
        throw new Error(res.error || "Password reset failed.");
      }

      setSuccessMsg("Password successfully reset! Please sign in with your new password.");
      setTab("login");
      setPassword(newPassword);
      setRecoveryStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0A0D1D] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-blue-500/25 text-slate-100 animate-scaleUp">
        {/* Header with Official Logo */}
        <div className="p-6 bg-gradient-to-b from-[#101736] to-[#0A0D1D] border-b border-blue-900/30 flex items-center justify-between">
          <ShopzaLogo variant="compact" />
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#151C3B] rounded-xl transition-colors border border-transparent hover:border-blue-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-blue-900/30 bg-[#0A0D1D] p-2 gap-1.5">
          <button
            onClick={() => {
              setTab("login");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
              tab === "login"
                ? "bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white shadow-md shadow-blue-900/40 border border-blue-400/30"
                : "text-slate-400 hover:text-white hover:bg-[#0F142A]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab("register");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all text-center whitespace-nowrap ${
              tab === "register"
                ? "bg-gradient-to-r from-[#0066FF] to-[#7928CA] text-white shadow-md shadow-blue-900/40 border border-blue-400/30"
                : "text-slate-400 hover:text-white hover:bg-[#0F142A]"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span className="font-medium leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === "login" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Sign in to Shopza</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Access your marketplace orders, stores, and messages.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-[#12162a] hover:bg-[#181d38] border border-purple-900/40 hover:border-purple-500/60 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>



              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-purple-900/40 flex-1" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  or sign in with email & password
                </span>
                <div className="h-px bg-purple-900/40 flex-1" />
              </div>



              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("recovery");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-purple-400 font-bold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/35 transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? "Signing in..." : "Sign In to Account"}
                </button>
              </form>

              <div className="text-center pt-2 text-xs text-slate-400">
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-purple-400 font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {tab === "register" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Join Shopza</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create a buyer or seller account to start shopping and selling.
                </p>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3 bg-[#12162a] hover:bg-[#181d38] border border-purple-900/40 hover:border-purple-500/60 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>



              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-purple-900/40 flex-1" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  or register with email & password
                </span>
                <div className="h-px bg-purple-900/40 flex-1" />
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Role Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        role === "buyer"
                          ? "border-purple-500 bg-purple-950/70 text-white ring-1 ring-purple-500"
                          : "border-purple-900/40 bg-[#12162a] hover:bg-[#171c36] text-slate-400"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Buyer</p>
                        <p className="text-[11px] text-slate-400">Shop & place orders</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        role === "seller"
                          ? "border-purple-500 bg-purple-950/70 text-white ring-1 ring-purple-500"
                          : "border-purple-900/40 bg-[#12162a] hover:bg-[#171c36] text-slate-400"
                      }`}
                    >
                      <StoreIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Seller</p>
                        <p className="text-[11px] text-slate-400">Open store & sell</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-900/35 transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PASSWORD RECOVERY */}
          {tab === "recovery" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Password Recovery</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {recoveryStep === 1
                    ? "Enter your registered email address to receive a secure 6-digit verification code."
                    : "Enter the 6-digit code sent to your email and your new password."}
                </p>
              </div>

              {recoveryStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTab("login")}
                      className="flex-1 py-2.5 bg-[#14172e] hover:bg-[#1a1f3c] text-slate-300 font-bold text-xs rounded-xl border border-purple-900/40"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-900/40"
                    >
                      {isLoading ? "Sending Code..." : "Send Reset Code"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      6-Digit Security Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-mono tracking-widest bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#12162a] border border-purple-900/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep(1)}
                      className="flex-1 py-2.5 bg-[#14172e] hover:bg-[#1a1f3c] text-slate-300 font-bold text-xs rounded-xl border border-purple-900/40"
                    >
                      Resend Code
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-900/40"
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
