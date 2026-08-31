import { useState } from "react";
import { supabase } from "../supabaseClient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage({ onLogin, apiUrl, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validation
  const isUsernameValid = username.trim().length > 0;
  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const passwordRequirements = {
    minLength: password.length >= 8,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const isFormValid =
    isUsernameValid &&
    email.trim() &&
    isEmailValid &&
    password.trim() &&
    isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate all fields
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Semua field harus diisi!");
      setLoading(false);
      return;
    }

    // Validate email format
    if (!isEmailValid) {
      setError("Format email tidak valid!");
      setLoading(false);
      return;
    }

    // Validate password
    if (!isPasswordValid) {
      setError("Password tidak memenuhi persyaratan!");
      setLoading(false);
      return;
    }

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
        setError("");
        setEmail("");
        setPassword("");
        setUsername("");
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
      {/* Register Card */}
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
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., GambitHero"
                required
                className={`w-full px-4 py-2.5 pr-10 bg-white border-2 rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 ${
                  username
                    ? isUsernameValid
                      ? "border-green-600 focus:ring-green-500"
                      : "border-red-600 focus:ring-red-500"
                    : "border-[#1e720f] focus:ring-[#053b05]"
                }`}
              />
              {isUsernameValid && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">
                  ✓
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., gambit@example.com"
                required
                className={`w-full px-4 py-2.5 pr-10 bg-white border-2 rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 ${
                  email
                    ? isEmailValid
                      ? "border-green-600 focus:ring-green-500"
                      : "border-red-600 focus:ring-red-500"
                    : "border-[#1e720f] focus:ring-[#053b05]"
                }`}
              />
              {email && isEmailValid && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">
                  ✓
                </span>
              )}
            </div>
            {email && !isEmailValid && (
              <p className="mt-2 text-xs text-red-600 font-semibold">
                Masukkan email yang valid
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g., ********"
                required
                className={`w-full px-4 py-2.5 pr-10 bg-white border-2 rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 ${
                  password
                    ? isPasswordValid
                      ? "border-green-600 focus:ring-green-500"
                      : "border-red-600 focus:ring-red-500"
                    : "border-[#1e720f] focus:ring-[#053b05]"
                }`}
              />
              {isPasswordValid && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">
                  ✓
                </span>
              )}
            </div>

            {/* Password Requirements — cuma muncul selama BELUM terpenuhi */}
            {password && !passwordRequirements.minLength && (
              <p className="mt-3 text-xs text-red-600 font-semibold">
                Minimal 8 karakter
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-center font-bold text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-center font-bold text-green-600">
              Registrasi sukses! Redirect ke login...
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full py-2.5 font-black rounded-sm transition-all mt-4 ${
              loading || !isFormValid
                ? "bg-gray-400 text-white opacity-60 cursor-not-allowed pointer-events-none"
                : "bg-[#51b330] hover:bg-[#409228] text-white active:scale-95"
            }`}
          >
            {loading ? "Loading..." : "Continue"}
          </button>
        </form>

        {/* Bottom CTA */}
        <div className="text-center mt-6 pt-6 border-t-2 border-gray-300">
          <p className="text-sm text-gray-600">
            <button
              onClick={onSwitchToLogin}
              className="text-[#0a500a] hover:underline"
            >
              Already have an account?{" "}
              <span className="font-bold">Log In.</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
