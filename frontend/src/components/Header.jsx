function Header({ hasResult }) {
  const handleTitleClick = () => {
    // Emit a global event so the analyzer can clear its result
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clearResults"));
    }
  };

  return (
    <header
      className={`text-center max-w-5xl w-full px-2 transition-all duration-700 ${
        hasResult ? "mb-6 sm:mb-8" : "mb-8 sm:mb-16"
      }`}
    >
      <h1
        onClick={handleTitleClick}
        role="button"
        tabIndex={0}
        className={`cursor-pointer font-black bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 bg-clip-text text-transparent tracking-tight transition-all duration-700 ${
          hasResult
            ? "text-3xl sm:text-4xl md:text-5xl mb-2"
            : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4"
        }`}
      >
        Besedotvorje
      </h1>
      <p
        className={`text-neutral-600 font-light px-4 transition-all duration-700 ${
          hasResult ? "text-sm sm:text-base" : "text-base sm:text-lg md:text-xl"
        }`}
      >
        Analizirajte besedotvorno podstavo slovenskih besed
      </p>
    </header>
  );
}

export default Header;
