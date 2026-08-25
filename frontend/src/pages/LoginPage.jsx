import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";

export default function LoginPage() {
  const { t, language, setLanguage } = useLanguage();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.message?.replace("Firebase: ", "") || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/40 flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-navy-900 text-base">{t("brand")}</span>
        </Link>

        <button
          onClick={() => setLanguage(language === "en" ? "te" : "en")}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
        >
          <Globe className="h-3.5 w-3.5 text-teal-600" />
          <span>{language === "en" ? "తెలుగు" : "English"}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-card space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">{t("login")}</h1>
            <p className="text-xs text-slate-500 mt-1">Access your personalized citizen welfare dashboard</p>
          </div>

          {error ? (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/90 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">or email</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-navy-800 hover:bg-navy-900 text-white py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? "Signing in..." : t("login")}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <Link className="font-bold text-teal-700 hover:underline" to="/signup">
                {t("signup")}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center text-xs text-slate-400">
        <p>{t("brand")} · {t("tagline")}</p>
      </div>
    </div>
  );
}
