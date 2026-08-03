import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      {/* ✅ ArrowUp icon replaces ↑ text character */}
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  );
}