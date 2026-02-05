import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import axios from "axios";

function StatsModal({ isOpen, onClose, onEdit, refreshVersion }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      fetchMostDisliked();
    }
  }, [isOpen, refreshVersion]);

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

  const fetchMostDisliked = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/words/stats/most-disliked");
      setWords(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Napaka pri nalaganju statistike");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPages = Math.ceil(words.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = words.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
        onClick={onClose}
      />

      <div className="relative z-[100000] bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl border-2 border-rose-200/50 max-w-4xl w-full p-8 sm:p-10 animate-slideUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-rose-900 hover:bg-rose-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent mb-1">
            Najbolj negativno ocenjene besede
          </h2>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-900 border-t-transparent"></div>
            <p className="mt-2 text-neutral-600">Nalaganje...</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {!loading && !error && words.length === 0 && (
          <p className="text-center text-neutral-600 py-8">
            Ni podatkov za prikaz
          </p>
        )}

        {!loading && !error && currentWords.length > 0 && (
          <>
            <div className="space-y-3">
              {currentWords.map((word, index) => (
                <div
                  key={word._id}
                  className="bg-white border-2 border-rose-100 rounded-2xl p-4 hover:border-rose-200 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-black text-rose-900">
                          {word.word}
                        </h3>
                        {word.type && (
                          <span className="px-2 py-1 bg-amber-100 text-rose-900 text-xs font-semibold rounded-lg">
                            {word.type}
                          </span>
                        )}
                        <span className="px-3 py-1 text-green-800 text-sm font-bold">
                          {100 - word.dislikePercentage}%
                        </span>
                        <span className="px-3 py-1 text-red-800 text-sm font-bold">
                          {word.dislikePercentage}%
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 mb-2 line-clamp-2">
                        {word.analysis}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-600">
                        <span>
                          <ThumbsUp className="w-4 h-4 inline-block mr-1" />{" "}
                          {word.likes}
                        </span>
                        <span>
                          <ThumbsDown className="w-4 h-4 inline-block mr-1" />{" "}
                          {word.dislikes}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEdit(word)}
                      className="flex items-center gap-1 px-3 py-2 bg-rose-50 border-2 border-rose-100 text-rose-900 text-sm font-semibold rounded-xl hover:bg-rose-100 transition shrink-0"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Uredi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-rose-100 text-rose-900 font-semibold rounded-xl hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-neutral-600 font-medium">
                  Stran {currentPage} od {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-rose-100 text-rose-900 font-semibold rounded-xl hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StatsModal;
