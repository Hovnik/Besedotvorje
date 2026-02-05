import WordAnalyzer from "./components/WordAnalyzer";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <header className="text-center mb-8 sm:mb-16 max-w-4xl w-full px-2">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight">
          Besedotvorje
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 font-light px-4">
          Analizirajte besedotvorno podstavo slovenskih besed
        </p>
      </header>

      <div className="w-full max-w-4xl">
        <WordAnalyzer />
      </div>
    </div>
  );
}

export default App;
