import { ChevronDown, MessageSquare, ArrowRight } from "lucide-react";

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
          {faqData.map((faq, index) => {
            // ✅ faq.icon is a lucide component — render it as a component
            const IconComp = faq.icon;
            return (
              <div className="faq-item" key={index}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {/* ✅ render icon component, not emoji text */}
                  <span className="faq-icon">
                    <IconComp size={22} strokeWidth={1.8} />
                  </span>

                  <h3>{faq.question}</h3>

                  {/* ✅ ChevronDown icon replaces ▼ text character */}
                  <span className={`faq-arrow ${openFaq === index ? "open" : ""}`}>
                    <ChevronDown size={18} strokeWidth={2} />
                  </span>
                </button>

                <div className={`faq-answer ${openFaq === index ? "open" : ""}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-contact">
          <div className="contact-card">
            {/* ✅ MessageSquare icon replaces 💬 emoji */}
            <span className="contact-emoji">
              <MessageSquare size={36} strokeWidth={1.5} color="#ffffff" />
            </span>

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
              {/* ✅ ArrowRight icon replaces → text */}
              <ArrowRight size={16} strokeWidth={2} className="btn-arrow" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}