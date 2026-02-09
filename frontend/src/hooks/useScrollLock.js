import { useEffect } from "react";

/**
 * Custom hook to lock/unlock body scroll when a modal is open
 * @param {boolean} isOpen - Whether the modal is open
 */
export function useScrollLock(isOpen) {
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
}
