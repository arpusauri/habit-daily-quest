import { useState } from "react";
import { supabase } from "../supabaseClient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email wajib diisi!");
      setLoading(false);
      return;
    }

    if (!isEmailValid) {
      setError("Format email tidak valid!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/`,
        },
      );

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#51b330] flex items-center justify-center px-4 relative">
      {/* Card */}
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

        {success ? (
          <div className="text-center space-y-20">
            <p className="text-sm text-gray-700">
              Password reset link has been sent to <strong>{email}</strong>.
            </p>
            <button
              onClick={onSwitchToLogin}
              className="w-full py-2.5 bg-[#51b330] hover:bg-[#409228] text-white font-black rounded-sm transition-all active:scale-95"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-6 -mt-5 text-center">
              Enter the email address you used to register your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., gambit@example.com"
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
                disabled={loading}
                className="w-full py-2.5 bg-[#51b330] hover:bg-[#409228] text-white font-black rounded-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-6 pt-6 border-t-2 border-gray-300">
          <p className="text-xs text-gray-600">
            <button
              onClick={onSwitchToLogin}
              className="text-[#0a500a] hover:underline"
            >
              Remember your password? <span className="font-bold">Log In.</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
