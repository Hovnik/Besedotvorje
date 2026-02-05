import { useState, useEffect } from "react";
import { LogIn, LogOut } from "lucide-react";

function SignInButton({ onClick }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  if (user) {
    return (
      <div className="fixed top-4 left-4 sm:top-8 sm:left-24 z-[100] flex flex-col sm:flex-col items-start gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-rose-900 hover:text-rose-700 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Odjava</span>
          </button>
          <p className="text-xs sm:text-sm text-neutral-600 sm:hidden">
            Prijavljeni ste kot{" "}
            <span className="font-semibold text-rose-900">{user.username}</span>
          </p>
        </div>
        <p className="hidden sm:block text-sm text-neutral-600">
          Prijavljeni ste kot{" "}
          <span className="font-semibold text-rose-900">{user.username}</span>
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 sm:top-8 sm:left-24 z-[100] flex items-center gap-2 text-lg sm:text-xl font-semibold text-rose-900 hover:text-rose-700 transition-colors duration-300"
    >
      <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
      <span className="hidden sm:inline">Prijava</span>
    </button>
  );
}

export default SignInButton;
