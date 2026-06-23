export default function WhoSection({ newcomerImg, seniorImg, authorityImg }) {
  return (
    <section id="who-section" className="who-section">
      <h2 className="who-title">Who We Serve</h2>

      <div className="who-container">
        <div className="who-card">
          <img src={newcomerImg} alt="Newcomers" className="who-img" />

          <h3>Newcomers</h3>

          <p>
            Find housing, transport, and food guidance. Get paired with a
            senior from your district who knows Chittagong inside and out.
          </p>
        </div>

        <div className="who-card">
          <img src={seniorImg} alt="Seniors" className="who-img" />

          <h3>Seniors</h3>

          <p>
            Help juniors while earning recognition. Share guides, answer
            questions, and build trust through badges and reputation.
          </p>
        </div>

        <div className="who-card">
          <img src={authorityImg} alt="Authorities" className="who-img" />

          <h3>Authorities</h3>

          <p>
            Support student safety and well-being. Share official updates and
            manage emergency alerts across the community.
          </p>
        </div>
      </div>
    </section>
  );
}