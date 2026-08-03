export default function FeaturesSection({
  features,
  currentFeature,
  setCurrentFeature,
}) {
  return (
    <section id="features" className="features-section">
      <div className="feature-reel">
        <div className="feature-counter">
          {currentFeature + 1} / {features.length}
        </div>

        <div className="feature-row">
          <div className="feature-image">
            <img
              src={features[currentFeature].image}
              alt={features[currentFeature].title}
            />
          </div>

          <div className="feature-content">
            <span className="feature-tag">
              {features[currentFeature].tag}
            </span>

            <h2>{features[currentFeature].title}</h2>

            <p>{features[currentFeature].text}</p>

            {currentFeature < features.length - 1 ? (
              <button
                className="feature-btn"
                onClick={() => setCurrentFeature(currentFeature + 1)}
              >
                More Features →
              </button>
            ) : (
              <button
                className="join-btn"
                onClick={() =>
                  document
                    .getElementById("who-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
