import { useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import VoteButtons from "./VoteButtons";

function WordAnalyzer() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeWord = async (e) => {
    e.preventDefault();

    if (!word.trim()) {
      setError("Prosim, vnesite besedo");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post("/api/words/analyze", {
        word: word.trim(),
      });
      setResult(response.data);
      setWord("");
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || "Napaka pri analizi besede");
    } finally {
      setLoading(false);
    }
  };

  const exampleWords = ["voznik", "srečelov", "predpostavka", "učiteljica"];

  return (
    <div className="space-y-8">
      {/* Input Card */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-rose-100/50">
        <form onSubmit={analyzeWord} className="space-y-6">
          <div>
            <label
              htmlFor="wordInput"
              className="block text-sm font-semibold text-rose-900 mb-3 uppercase tracking-wide"
            >
              Vnesite besedo
            </label>
            <div className="flex gap-2 sm:gap-3">
              <input
                id="wordInput"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="na primer: gasilec"
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-900/20 focus:border-rose-900 outline-none transition bg-white/80 placeholder:text-neutral-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-bold text-base sm:text-lg rounded-2xl hover:from-rose-800 hover:to-rose-600 disabled:from-neutral-400 disabled:to-neutral-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Analiziram</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Analiziraj</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Examples */}
          <div className="flex flex-wrap gap-3 items-center pt-2">
            <span className="text-sm font-medium text-neutral-600">
              Primeri:
            </span>
            {exampleWords.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setWord(example)}
                className="px-4 py-2 text-sm font-medium bg-amber-100/60 hover:bg-rose-100 text-rose-900 rounded-xl transition-all hover:shadow-md"
              >
                {example}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-800 px-8 py-5 rounded-2xl shadow-lg">
          <p className="font-bold text-lg">Napaka</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Results Card */}
      {result && (
        <div className="bg-gradient-to-br from-white via-amber-50/20 to-rose-50/30 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-rose-100/50 animate-fadeIn">
          {/* Check if it's not a derivative word */}
          {result.analysis.toLowerCase().includes("ni tvorjenka") ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800">
                  <span className="text-rose-900">{result.word}</span> ni
                  tvorjenka
                </p>
              </div>

              {/* Vote Buttons */}
              <div className="pt-4">
                <VoteButtons
                  wordId={result._id}
                  initialLikes={result.likes || 0}
                  initialDislikes={result.dislikes || 0}
                  word={result.word}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="text-3xl sm:text-4xl font-black text-rose-900">
                    {result.word}
                  </p>
                  {result.type && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-200 to-orange-200 text-rose-900 text-xs sm:text-sm font-semibold rounded-lg relative -top-1">
                      {result.type}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-rose-900 mb-3 uppercase tracking-wide">
                  Besedotvorna podstava
                </p>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 sm:p-6 border border-rose-200/30 shadow-inner">
                  <p className="text-base sm:text-lg md:text-xl text-neutral-800 whitespace-pre-wrap leading-relaxed font-medium">
                    {result.analysis}
                  </p>
                </div>
              </div>

              {/* Vote Buttons */}
              <div className="pt-4">
                <VoteButtons
                  wordId={result._id}
                  initialLikes={result.likes || 0}
                  initialDislikes={result.dislikes || 0}
                  word={result.word}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WordAnalyzer;
