import { useState, useEffect } from "react";
import { ChartBar } from "lucide-react";
import WordAnalyzer from "./components/WordAnalyzer";
import DecorativeElements from "./components/DecorativeElements";
import Header from "./components/Header";
import SignInButton from "./components/SignInButton";
import SignInModal from "./modals/SignInModal";
import StatsModal from "./modals/StatsModal";
import Footer from "./components/Footer";

function App() {
  const [hasResult, setHasResult] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      <DecorativeElements />
      <SignInButton onClick={() => setIsSignInOpen(true)} />

      {/* Stats button (top-right, only for logged-in users) */}
      {user && (
        <button
          onClick={() => setIsStatsOpen(true)}
          className="fixed top-4 right-4 sm:top-8 sm:right-24 z-[100] flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-semibold rounded-2xl hover:from-rose-800 hover:to-rose-600 transition shadow-lg"
        >
          <ChartBar className="w-5 h-5" />
          <span className="hidden sm:inline">Statistika</span>
        </button>
      )}

      <div
        className={`relative flex flex-col items-center px-4 py-8 sm:py-12 min-h-screen transition-all duration-700 ${
          hasResult ? "justify-start pt-12" : "justify-center"
        }`}
      >
        <Header hasResult={hasResult} />
        <div className="w-full max-w-5xl">
          <WordAnalyzer onResultChange={setHasResult} />
        </div>
      </div>

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      <Footer />
    </div>
  );
}

export default App;
