import { useState, useEffect } from "react";
import { X, Edit, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import EditResultModal from "./EditResultModal";
import { useScrollLock } from "../hooks/useScrollLock";
import { buildWordFormationSimple } from "../utils/wordFormation";

function StatsModal({ isOpen, onClose }) {
  const [words, setWords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeTab, setActiveTab] = useState("unverified"); // "unverified", "unliked", or "verified"
  const [verifiedCount, setVerifiedCount] = useState(0);

  useScrollLock(isOpen);

  // Reset page when tab changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [activeTab, isOpen]);

  // Fetch verified count when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVerifiedCount();
    }
  }, [isOpen]);

  // Fetch words when modal opens, page changes, or tab changes
  useEffect(() => {
    if (isOpen) {
      fetchWords(currentPage);
    }
  }, [isOpen, currentPage, activeTab]);

  const fetchVerifiedCount = async () => {
    try {
      const response = await axios.get("/api/words/verified/count");
      setVerifiedCount(response.data.count);
    } catch (err) {
      console.error("Error fetching verified count:", err);
    }
  };

  const fetchWords = async (page) => {
    setLoading(true);
    setError("");

    try {
      let endpoint;
      if (activeTab === "unverified") {
        endpoint = `/api/words/unverified?page=${page}`;
      } else if (activeTab === "unliked") {
        endpoint = `/api/words/most-unliked?page=${page}`;
      } else {
        endpoint = `/api/words/verified?page=${page}`;
      }

      const response = await axios.get(endpoint);
      setWords(response.data.words);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching words:", err);
      setError(err.response?.data?.error || "Napaka pri pridobivanju besed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (wordId) => {
    try {
      await axios.post(`/api/words/${wordId}/verify`);
      // Refresh the list and verified count
      fetchWords(currentPage);
      fetchVerifiedCount();
    } catch (err) {
      console.error("Error verifying word:", err);
      setError(err.response?.data?.error || "Napaka pri potrjevanju");
    }
  };

  const handleEdit = (word) => {
    setSelectedWord(word);
    setIsEditOpen(true);
  };

  const handleEditSave = (updatedWord) => {
    fetchWords(currentPage);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
          onClick={onClose}
        />

        <div className="relative z-[100000] bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl border-2 border-rose-200/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slideUp">
          <button
            onClick={onClose}
            className="sticky top-0 float-right p-2 text-rose-900 hover:bg-rose-100 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-6">
            <h2 className="text-center text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent mb-2">
              Statistika besed
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 justify-center mt-4 mb-2">
              <button
                onClick={() => setActiveTab("unverified")}
                className={`px-4 py-2 font-semibold rounded-xl transition-colors border-2 ${
                  activeTab === "unverified"
                    ? "bg-rose-900 text-white border-rose-900"
                    : "bg-white text-rose-900 border-rose-200 hover:border-rose-300"
                }`}
              >
                Nepotrjene
              </button>
              <button
                onClick={() => setActiveTab("verified")}
                className={`px-4 py-2 font-semibold rounded-xl transition-colors border-2 ${
                  activeTab === "verified"
                    ? "bg-rose-900 text-white border-rose-900"
                    : "bg-white text-rose-900 border-rose-200 hover:border-rose-300"
                }`}
              >
                Potrjene
              </button>
              <button
                onClick={() => setActiveTab("unliked")}
                className={`px-4 py-2 font-semibold rounded-xl transition-colors border-2 ${
                  activeTab === "unliked"
                    ? "bg-rose-900 text-white border-rose-900"
                    : "bg-white text-rose-900 border-rose-200 hover:border-rose-300"
                }`}
              >
                Najmanj priljubljene
              </button>
            </div>

            {activeTab === "unverified" && (
              <div className="mt-3 text-sm font-semibold text-green-700 text-left px-2">
                {verifiedCount} potrjenih besed
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-rose-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 text-lg">
                {activeTab === "unverified"
                  ? "Ni nepotrjenih besed! 🎉"
                  : activeTab === "verified"
                    ? "Ni potrjenih besed!"
                    : "Ni besed z dislajki! 🎉"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {words.map((word) => (
                  <div
                    key={word._id}
                    className="bg-white border-2 border-rose-100 rounded-2xl p-4 hover:border-rose-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 flex-wrap mb-2">
                          <span className="text-xl font-bold text-rose-900">
                            {word.beseda}
                          </span>
                          <span className="text-sm text-neutral-500">
                            {activeTab === "unverified"
                              ? `${(word.confidence * 100).toFixed(0)}% zaupanje`
                              : activeTab === "verified"
                                ? `${(word.confidence * 100).toFixed(0)}% zaupanje`
                                : `${word.dislikeCount} dislajkov`}
                          </span>
                        </div>

                        <div className="text-neutral-700 font-mono text-sm bg-amber-50/50 px-3 py-2 rounded-lg border border-amber-200">
                          {buildWordFormationSimple(word)}
                        </div>

                        {word.slovnicno && (
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {word.slovnicno.besedna_vrsta && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-lg">
                                {word.slovnicno.besedna_vrsta}
                              </span>
                            )}
                            {word.slovnicno.spol && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-900 rounded-lg">
                                {word.slovnicno.spol}
                              </span>
                            )}
                            {word.postopek &&
                              Array.isArray(word.postopek) &&
                              !word.postopek.includes("netvorjenka") && (
                                <span className="px-2 py-1 bg-green-100 text-green-900 rounded-lg">
                                  {word.postopek.join(", ")}
                                </span>
                              )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(word)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-xl transition-colors border-2 border-amber-200"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {activeTab === "verified" ? "Uredi znova" : "Uredi"}
                          </span>
                        </button>
                        {activeTab === "unverified" && (
                          <button
                            onClick={() => handleVerify(word._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-900 font-semibold rounded-xl transition-colors border-2 border-green-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Potrdi</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-rose-200 text-rose-900 font-semibold rounded-xl hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prejšnja</span>
                  </button>

                  <span className="text-sm text-neutral-600">
                    Stran {pagination.currentPage} / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1),
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-rose-200 text-rose-900 font-semibold rounded-xl hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Naslednja</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <EditResultModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        result={selectedWord}
        onSave={handleEditSave}
      />
    </>
  );
}

export default StatsModal;
