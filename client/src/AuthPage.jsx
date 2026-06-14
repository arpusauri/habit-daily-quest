import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthPage({ onLogin, apiUrl }) {
  // 1. Ambil apiUrl dari props
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // ==========================================
        // LOGIN (Tetap langsung lewat frontend client)
        // ==========================================
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(data.session);
      } else {
        // ==========================================
        // REGISTER (DIUBAH: Menembak API Backend)
        // ==========================================
        const response = await fetch(`${apiUrl}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, username }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registrasi gagal dilakukan.");
        }

        // Jika di Supabase kamu mematikan fitur "Confirm Email", backend akan langsung melempar session
        if (data.session) {
          onLogin(data.session);
        } else {
          setError("Registrasi sukses! Cek email kamu untuk konfirmasi akun.");
          setIsLogin(true); // Pindahkan ke halaman login otomatis
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-wide">
            ⚔️ HABIT QUEST
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? "Login to continue your journey" : "Create your account"}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              isLogin
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              !isLogin
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your hero name..."
                required={!isLogin}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <p
              className={`text-sm text-center font-medium ${
                error.includes("sukses") || error.includes("Cek email")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? "Loading..."
              : isLogin
                ? "⚔️ Enter the Quest"
                : "🚀 Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
