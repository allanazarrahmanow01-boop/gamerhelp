"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

type Mode = "signin" | "register";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (session) router.push("/forum");
  }, [session, router]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      setSuccess("Account created! Signing you in...");
    }

    const result = await signIn("credentials", {
      username: username.trim().toLowerCase(),
      password,
      callbackUrl: "/forum",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === "banned") setError("Your account has been banned.");
      else setError(mode === "signin" ? "Invalid username or password" : "Sign in failed");
    } else if (result?.url) {
      router.push(result.url);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 bg-hero-gradient bg-bg-pattern bg-grid">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-glow mx-auto mb-4">
            <span className="font-display text-5xl text-white leading-none">G</span>
          </div>
          <h1 className="font-display text-4xl text-text tracking-wider">
            GAMER<span className="text-accent">HELP</span>
          </h1>
          <p className="text-text-dim text-sm mt-1">The gaming community that actually helps</p>
        </div>

        <div className="bg-panel border border-border rounded-2xl shadow-panel overflow-hidden">
          <div className="flex border-b border-border">
            {(["signin", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  mode === m ? "text-accent border-b-2 border-accent bg-accent/5" : "text-text-dim hover:text-text"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-accent/10 border border-accent/30 rounded-xl text-accent text-sm">
                <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2.5 bg-green/10 border border-green/30 rounded-xl text-green text-sm">{success}</div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="your_username"
                  autoComplete="username"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors text-sm"
                />
              </div>
              {mode === "register" && <p className="text-text-dim text-xs mt-1">3–20 chars, letters/numbers/underscores</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={mode === "register" ? "min. 6 characters" : "••••••••"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-10 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors">
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="flex items-start gap-2 text-xs text-text-dim bg-surface border border-border rounded-xl p-3">
                <span className="text-gold mt-0.5">⚠️</span>
                <span>One account per device. Multiple accounts will result in a ban.</span>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>

        <p className="text-center text-text-dim text-xs mt-4">
          By signing in you agree to our <a href="/terms" className="text-accent hover:underline">Terms</a> & <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
