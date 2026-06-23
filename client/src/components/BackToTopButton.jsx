export default function BackToTopButton() {
  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}