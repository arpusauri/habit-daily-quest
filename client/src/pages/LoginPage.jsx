import { useState } from "react";

export default function LoginPage({ onLogin, apiUrl, onSwitchToRegister }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = identifier.trim() && password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal.");
      }

      onLogin(data.session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#51b330] flex items-center justify-center px-4 relative">
      {/* Login Card */}
      <div className="bg-white rounded-sm p-8 w-full max-w-sm shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1e720f] tracking-wider">
            Gambit
          </h1>
          <p className="text-xs text-[#1e720f] mt-2 tracking-widest">
            Gamify Habit
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
              Email/Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username atau email (case sensitive)"
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-[#1e720f] rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#053b05]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2.5 bg-white border-2 border-[#1e720f] rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#053b05]"
            />
          </div>

          {error && (
            <p className="text-sm text-center font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full py-2.5 font-black rounded-sm transition-all mt-4 ${
              loading || !isFormValid
                ? "bg-gray-400 text-white opacity-50 cursor-not-allowed pointer-events-none"
                : "bg-[#51b330] hover:bg-[#409228] text-white active:scale-95"
            }`}
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

        {/* Bottom CTA */}
        <div className="text-center mt-6 pt-6 border-t-2 border-gray-300">
          <p className="text-sm text-gray-600">
            <button
              onClick={onSwitchToRegister}
              className="text-[#0a500a] hover:underline"
            >
              Don't have an account yet?{" "}
              <span className="font-bold">Register.</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
