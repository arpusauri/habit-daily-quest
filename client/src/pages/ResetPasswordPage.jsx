import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ResetPasswordPage({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const passwordRequirements = {
    minLength: password.length >= 8,
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isPasswordValid) {
      setError("Password minimal 8 karakter!");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#51b330] flex items-center justify-center px-4">
      <div className="bg-white rounded-sm p-8 w-full max-w-sm shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1e720f] tracking-wider">
            Gambit
          </h1>
          <p className="text-xs text-[#1e720f] mt-2 tracking-widest">
            Set New Password
          </p>
        </div>

        {!sessionReady ? (
          <p className="text-sm text-center text-gray-600">
            Verifying reset password link...
          </p>
        ) : success ? (
          <div className="text-center">
            <p className="text-sm font-bold text-green-600 mb-4">
              Password successfully updated!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="eg., ********"
                required
                className={`w-full px-4 py-2.5 bg-white border-2 rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 ${
                  password
                    ? isPasswordValid
                      ? "border-green-600 focus:ring-green-500"
                      : "border-red-600 focus:ring-red-500"
                    : "border-[#1e720f] focus:ring-[#053b05]"
                }`}
              />
              {password && !passwordRequirements.minLength && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#0a500a] uppercase tracking-widest mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="e.g., ********"
                required
                className={`w-full px-4 py-2.5 bg-white border-2 rounded-sm text-gray-900 text-sm focus:outline-none focus:ring-1 ${
                  confirmPassword
                    ? passwordsMatch
                      ? "border-green-600 focus:ring-green-500"
                      : "border-red-600 focus:ring-red-500"
                    : "border-[#1e720f] focus:ring-[#053b05]"
                }`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  Passwords do not match
                </p>
              )}
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
                  ? "bg-gray-400 text-white opacity-60 cursor-not-allowed"
                  : "bg-[#51b330] hover:bg-[#409228] text-white active:scale-95"
              }`}
            >
              {loading ? "Saving..." : "Save New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
