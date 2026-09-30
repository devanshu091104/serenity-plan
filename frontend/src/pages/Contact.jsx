import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import api from "../api/axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await api.post("/inquiries", form);

      setSuccess(
        "Thank you for contacting us. Our team will get back to you soon."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <span className="eyebrow">GET IN TOUCH</span>

          <h1>
            Let’s plan your
            <br />
            <span>perfect journey.</span>
          </h1>

          <p>
            Have a question about a trip, booking, or destination?
            Our team is here to help you.
          </p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-grid">
          
          {/* LEFT */}
          <div className="contact-info">
            <span className="eyebrow">CONTACT US</span>

            <h2>We’d love to hear from you.</h2>

            <p>
              Whether you need help choosing a trip or have a question
              about an existing booking, feel free to reach out.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>

                <div>
                  <strong>Email</strong>
                  <span>hello@serenityplan.com</span>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-icon">
                  <Phone size={20} />
                </div>

                <div>
                  <strong>Phone</strong>
                  <span>+91 98765 43210</span>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <strong>Location</strong>
                  <span>India</span>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="contact-card">
            <h3>Send us a message</h3>

            <p>
              Fill in the details below and we’ll get back to you.
            </p>

            {success && (
              <div className="contact-success">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            {error && (
              <div className="contact-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>

                  <input
                    type="text"
                    name="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message</label>

                <textarea
                  name="message"
                  rows="6"
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary contact-submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
                {!loading && <Send size={17} />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}