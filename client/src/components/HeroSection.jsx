export default function HeroSection({ chittagongCityImg, onJoin }) {
  return (
    <section className="hero">
      <img
        src={chittagongCityImg}
        alt="Chittagong City"
        className="hero-img"
      />

      <div className="hero-overlay"></div>

      <div className="hero-content-box">
        <h1 className="hero-title">
          New City.
          <br />
          New Campus.
          <br />
          <span className="highlight">Same Community.</span>
        </h1>

        <p className="hero-description">
          Connect with experienced seniors from your hometown, discover trusted
          housing, transportation, food spots, and get the guidance you need to
          feel at home in Chattogram.
        </p>

        <div className="hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => {
              const token = localStorage.getItem("token");

              if (token) {
                window.location.reload();
              } else {
                onJoin();
              }
            }}
          >
            Explore
          </button>

          <button
            className="btn btn-primary"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}