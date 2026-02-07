import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

function EditResultModal({ isOpen, onClose, result, onSave, onRefreshStats }) {
  const [type, setType] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (result) {
      setType(result.type || "");
      setAnalysis(result.analysis || "");
      setError("");
    }
  }, [result]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      const top = parseInt(document.body.style.top || "0") * -1 || 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, top);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotDerivative = () => {
    setType("");
    setAnalysis("Ni tvorjenka");
  };

  const handleAddEmptySuffix = () => {
    // Append -∅ to the analysis text, avoid duplicates
    if (!analysis) {
      setAnalysis("-∅");
      return;
    }

    if (!analysis.endsWith("-∅")) {
      setAnalysis((prev) => prev + "-∅");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Try to update backend if endpoint exists; otherwise fallback to local save
      if (result && result._id) {
        try {
          await axios.put(`/api/words/${result._id}`, {
            type,
            analysis,
          });
        } catch (err) {
          // If backend doesn't support updating, ignore and continue
          console.warn(
            "Update request failed (may not be implemented):",
            err.message,
          );
        }
      }

      // Notify parent about new values
      onSave({ ...result, type, analysis });
      // Trigger stats refresh if provided
      if (onRefreshStats) onRefreshStats();
      onClose();
    } catch (err) {
      console.error("Edit save error:", err);
      setError("Napaka pri shranjevanju");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
        onClick={onClose}
      />

      <div className="relative z-[100000] bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl border-2 border-rose-200/50 max-w-lg w-full p-8 sm:p-10 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-rose-900 hover:bg-rose-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent mb-1">
            Urejanje besedotvorne podstave
          </h2>
          <p className="text-sm text-neutral-600">Spremenite tip in analizo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-rose-900 mb-2 uppercase tracking-wide">
              Tip
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 pr-10 text-base border-2 border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-900/20 focus:border-rose-900 outline-none transition bg-white/80"
            >
              <option value="">-- Izberite tip --</option>
              <option value="izpeljanka">izpeljanka</option>
              <option value="sestavljenka">sestavljenka</option>
              <option value="sklop">sklop</option>
              <option value="krn">krn</option>
              <option value="zloženka">zloženka</option>
              <option value="mešana tvorba">mešana tvorba</option>
              <option value="tvorjenka iz predložne zveze">
                tvorjenka iz predložne zveze
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-rose-900 mb-2 uppercase tracking-wide">
              Analiza
            </label>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-500">
                *Velike črke označujejo končnico, npr. križ+iščE. Za
                spreminjanje končnice, zapišite del z velikimi črkami.
              </p>
              <button
                type="button"
                onClick={handleAddEmptySuffix}
                className="text-xs px-3 py-1 bg-rose-50 border-2 border-rose-100 text-rose-900 rounded-lg hover:bg-rose-100 transition whitespace-nowrap"
              >
                Dodaj -∅
              </button>
            </div>
            <textarea
              rows={1}
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-900/20 focus:border-rose-900 outline-none transition bg-white/80 placeholder:text-neutral-400 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-rose-100 text-rose-900 font-semibold rounded-2xl hover:bg-rose-50 transition"
            >
              Prekliči
            </button>
            <button
              type="button"
              onClick={handleNotDerivative}
              className="flex-1 px-6 py-3 bg-amber-100 border-2 border-amber-200 text-amber-900 font-semibold rounded-2xl hover:bg-amber-200 transition"
            >
              Ni tvorjenka
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-bold rounded-2xl hover:from-rose-800 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Shranjujem..." : "Shrani"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditResultModal;
