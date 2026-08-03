export default function ReviewsSection() {
  return (
    <section className="reviews-section">
      <h2 className="reviews-title">What People Say About PeerConnect</h2>

      <div className="reviews-container">
        <div className="review-card">
          <div className="stars">★★★★★</div>

          <span className="student-tag senior">Senior Student (4th Year)</span>

          <p>
            "I've been using PeerConnect to help junior students from my
            district. It feels great guiding newcomers and making their
            university life easier."
          </p>

          <h4>- Tanvir Ahmed</h4>
        </div>

        <div className="review-card">
          <div className="stars">★★★★☆</div>

          <span className="student-tag fresher">1st Year Student</span>

          <p>
            "As a new student in Chattogram, I had no idea where to start. My
            buddy helped me find housing and settle within days."
          </p>

          <h4>- Nusrat Jahan</h4>
        </div>

        <div className="review-card">
          <div className="stars">★★★★★</div>

          <span className="student-tag fresher">1st Year Student</span>

          <p>
            "PeerConnect made my transition smooth. I got guidance on
            transport, food spots, and campus life from day one."
          </p>

          <h4>- Arif Hossain</h4>
        </div>
      </div>
    </section>
  );
}
