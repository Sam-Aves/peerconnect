export default function FAQSection({ faqData, openFaq, setOpenFaq }) {
  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-badge">Questions?</span>

          <h2 className="faq-title">Frequently Asked Questions</h2>

          <p className="faq-subtitle">
            Everything you need to know about using PeerConnect safely and
            confidently.
          </p>
        </div>

        <div className="faq-grid">
          {faqData.map((faq, index) => (
            <div className="faq-item" key={index}>
              <button
                className="faq-question"
                onClick={() =>
                  setOpenFaq(openFaq === index ? null : index)
                }
              >
                <span className="faq-icon">{faq.icon}</span>

                <h3>{faq.question}</h3>

                <span
                  className={`faq-arrow ${
                    openFaq === index ? "open" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`faq-answer ${
                  openFaq === index ? "open" : ""
                }`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <div className="contact-card">
            <span className="contact-emoji">💬</span>

            <h3>Still have questions?</h3>

            <p>
              Reach out to the PeerConnect team. We are here to help students
              feel safer, supported, and connected.
            </p>

            <button
              className="contact-btn"
              onClick={() =>
                document
                  .getElementById("contact-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Contact us
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}