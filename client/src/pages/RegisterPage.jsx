import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function RegisterPage({ onLogin, apiUrl, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
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

      if (data.session) {
        onLogin(data.session);
      } else {
        setSuccess(true);
        setError("Registrasi sukses! Cek email kamu untuk konfirmasi akun.");
        setTimeout(() => onSwitchToLogin(), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#51b330] flex items-center justify-center px-4 relative">
      {/* Login Button - Top Right */}
      <button
        onClick={onSwitchToLogin}
        className="absolute top-6 right-6 px-6 py-2 font-black text-white bg-black hover:bg-gray-800 active:scale-95 transition-all border-2 border-black text-sm"
      >
        LOG IN
      </button>

      {/* Register Card */}
      <div className="bg-white border-2 border-black p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-black tracking-wider">
            Gambit
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-2 uppercase tracking-widest">
            Register
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-black uppercase tracking-widest mb-2 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your hero name..."
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-black text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs font-black text-black uppercase tracking-widest mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-black text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs font-black text-black uppercase tracking-widest mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-black text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <p
              className={`text-sm text-center font-bold ${
                success ? "text-green-600" : "text-red-600"
              }`}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black hover:bg-gray-800 text-white font-black rounded-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Loading..." : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Bottom CTA */}
        <div className="text-center mt-6 pt-6 border-t-2 border-gray-300">
          <p className="text-xs text-gray-600 mb-2">Already have an account?</p>
          <button
            onClick={onSwitchToLogin}
            className="text-sm font-black text-black hover:underline"
          >
            Log In!
          </button>
        </div>
      </div>
    </div>
  );
}
