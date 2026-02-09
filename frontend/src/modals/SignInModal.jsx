import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useScrollLock } from "../hooks/useScrollLock";

function SignInModal({ isOpen, onClose }) {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("api/users/login", {
        username,
        password,
      });

      const data = response.data;

      if (response.status === 200 && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
        window.location.reload();
      } else {
        setError(data.error || "Prijava ni uspela");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Napaka pri povezavi s strežnikom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[100000] bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl border-2 border-rose-200/50 max-w-md w-full p-8 sm:p-10 animate-slideUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-rose-900 hover:bg-rose-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent mb-2">
            Prijava
          </h2>
          <p className="text-sm text-neutral-600">Prijavite se v svoj račun</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-rose-900 mb-2 uppercase tracking-wide"
            >
              Uporabniško ime
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="uporabnik"
              className="w-full px-4 py-3 text-base border-2 border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-900/20 focus:border-rose-900 outline-none transition bg-white/80 placeholder:text-neutral-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-rose-900 mb-2 uppercase tracking-wide"
            >
              Geslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-base border-2 border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-900/20 focus:border-rose-900 outline-none transition bg-white/80 placeholder:text-neutral-400"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-bold text-base rounded-2xl hover:from-rose-800 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Prijavljanje..." : "Prijavi se"}
          </button>
        </form>

        {/* Decorative elements */}
        <div className="absolute -top-3 -left-3 text-4xl text-rose-900/10 pointer-events-none">
          "
        </div>
        <div className="absolute -bottom-3 -right-3 text-4xl text-amber-700/10 pointer-events-none">
          "
        </div>
      </div>
    </div>
  );
}

export default SignInModal;
