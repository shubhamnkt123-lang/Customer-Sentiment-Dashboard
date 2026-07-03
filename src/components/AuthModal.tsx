import { useState, FormEvent } from "react";
const logo = "/src/assets/images/sentiopoint_logo_1783088174437.jpg";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously
} from "../lib/firebase";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Chrome, 
  LogOut, 
  Sparkles, 
  Loader2,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      // Fallback or readable error
      if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups or try guest sign-in.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Sign-in was cancelled. Please try again.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName || email.split("@")[0],
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message;
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid email or password combination.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email address is already registered.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password is too weak. Please use at least 6 characters.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Failed to sign in as guest. Please try email login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-in flex flex-col">
        {/* Header decoration */}
        <div className="bg-indigo-600 px-6 py-8 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="SentioPoint AI Logo"
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded bg-white object-cover shadow-sm select-none"
              />
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-100">SentioPoint Account</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {mode === "login" ? "Welcome back!" : "Create your account"}
            </h2>
            <p className="text-xs text-indigo-100 max-w-sm">
              {mode === "login" 
                ? "Sign in to save your sentiment reviews, analyze datasets, and access pro features." 
                : "Join to analyze client transcripts, design competitors comparison, and synchronize data."
              }
            </p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="p-6 space-y-5 flex-1 bg-white">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Sign In (Gmail / Google) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : (
                <Chrome className="w-4 h-4 text-red-500 fill-current" />
              )}
              Continue with Google / Gmail
            </button>

            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-semibold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Sign in as Guest / Sandbox User
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">or use email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Email Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Jane Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("Password reset simulation is enabled. Please try signing in as Guest or Google.");
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg p-2.5 pl-10 pr-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl tracking-wide transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In to Account" : "Create Account & Sign In"}
            </button>
          </form>

          {/* Toggle login vs signup */}
          <div className="text-center text-xs text-slate-500 pt-1">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-center">
          <p className="text-[10px] text-slate-400 leading-normal flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
            <span>Secure encryption. Powered by Firebase Auth.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
