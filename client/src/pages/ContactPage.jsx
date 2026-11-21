import { useState } from 'react';
import PageBanner from '../components/common/PageBanner';
import SubHeading from '../components/common/SubHeading';
import ScrollReveal from '../components/common/ScrollReveal';
import api from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      await api.contact.sendMessage(form);
      setSubmitting(false);
      setStatusMessage({
        type: 'success',
        text: 'Thank you! Your inquiry has been received and logged at our Front Desk. We will get back to you shortly.',
      });
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setStatusMessage(null), 8000);
    } catch (err) {
      setSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to send message. Please contact front desk directly.',
      });
    }
  };

  return (
    <main>
      <PageBanner title="Get in Touch" current="Contact Us" bannerClass="banner-inner-contact" />

      <div className="section">
        <div className="hero-container overflow-hidden">
          <div className="row row-cols-xl-2 row-cols-1 grid-spacer-5 grid-spacer-xl-100 align-items-start">
            {/* Left Contact Details */}
            <div className="col">
              <ScrollReveal animation="fade-right">
                <div className="d-flex flex-column gspace-5">
                  <div className="d-flex flex-column gspace-2">
                    <SubHeading title="We're Here to Help!" />
                    <h2>Get in Touch with Adelux Padel Club</h2>
                    <p>
                      Whether you're ready to book a court, join our club, or simply have a question, our team is always available to assist you. Connect with us today and be part of the growing padel community.
                    </p>
                  </div>

                  <div className="d-flex flex-column gspace-2">
                    <div className="d-flex flex-row gspace-2 align-items-start">
                      <div>
                        <div className="contact-icon">
                          <i className="fa-solid fa-phone-volume"></i>
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        <h6 className="contact-info-heading">Phone Number</h6>
                        <h4>+1 (800) 123-4567</h4>
                      </div>
                    </div>

                    <div className="d-flex flex-row gspace-1 align-items-start">
                      <div>
                        <div className="contact-icon">
                          <i className="fa-solid fa-envelope"></i>
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        <h6 className="contact-info-heading">Email Address</h6>
                        <h4>hello@adeluxpadel.com</h4>
                      </div>
                    </div>

                    <div className="d-flex flex-row gspace-1 align-items-start">
                      <div>
                        <div className="contact-icon">
                          <i className="fa-solid fa-clock"></i>
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        <h6 className="contact-info-heading">Opening Hours</h6>
                        <h4>Mon - Fri: 08:00 AM - 10:00 PM</h4>
                        <h4>Sat - Sun: 09:00 AM - 11:00 PM</h4>
                      </div>
                    </div>

                    <div className="d-flex flex-row gspace-1 align-items-start">
                      <div>
                        <div className="contact-icon">
                          <i className="fa-solid fa-map-location-dot"></i>
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        <h6 className="contact-info-heading">Location</h6>
                        <h4>Adelux Padel Center, 123 Avenue Court, New York, NY</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Contact Form Card */}
            <div className="col">
              <ScrollReveal animation="fade-left" delay={150}>
                <div className="card card-contact-form p-5 bg-black text-white rounded-3xl">
                  <h3 className="secondary-accent mb-2">Send Us a Message</h3>
                  <p className="accent-color-8 text-sm mb-4">
                    Have questions, booking inquiries, or feedback? Fill out the form below and our team will respond within 24 hours.
                  </p>

                  {statusMessage && (
                    <div
                      className={`p-4 rounded-2xl mb-4 d-flex align-items-center gap-3 ${
                        statusMessage.type === 'success'
                          ? 'bg-[#C6EF2E]/10 border border-[#C6EF2E] text-[#C6EF2E]'
                          : 'bg-red-500/10 border border-red-500 text-red-400'
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          statusMessage.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                        } text-xl`}
                      ></i>
                      <p className="mb-0 text-sm font-semibold">{statusMessage.text}</p>
                    </div>
                  )}

                  <form id="contact-form" onSubmit={handleSubmit} className="form">
                    <div className="row row-cols-md-2 row-cols-1 grid-spacer-2 mb-3">
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="name" className="text-white text-sm font-semibold">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Your Name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="email" className="text-white text-sm font-semibold">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="Your Email"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row row-cols-md-2 row-cols-1 grid-spacer-2 mb-3">
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="phone" className="text-white text-sm font-semibold">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="Your Phone Number"
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="d-flex flex-column gspace-1">
                          <label htmlFor="subject" className="text-white text-sm font-semibold">
                            Subject
                          </label>
                          <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            placeholder="Subject"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gspace-1 mb-4">
                      <label htmlFor="message" className="text-white text-sm font-semibold">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        id="message"
                        rows="4"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="How can we assist you?"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`btn btn-accent w-100 justify-content-center ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="btn-title">{submitting ? 'Sending Message...' : 'Send Message'}</span>
                        <span className="icon-circle">
                          <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
