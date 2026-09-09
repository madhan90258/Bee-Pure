import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
} from "lucide-react";

import "../styles/Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <main className="contact-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="contact-hero">

        <div className="contact-container">

          <div className="contact-hero-content">

            <p className="contact-eyebrow">
              WE'D LOVE TO HEAR FROM YOU
            </p>

            <h1>
              Let's Stay
              <br />
              <span>Connected.</span>
            </h1>

            <p>
              Have a question about our products, farmers,
              orders or anything else? We're here to help.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          CONTACT CONTENT
      ========================================= */}

      <section className="contact-section">

        <div className="contact-container">

          <div className="contact-grid">

            {/* =====================================
                CONTACT INFORMATION
            ===================================== */}

            <div className="contact-info">

              <div className="contact-info-header">

                <p className="contact-section-eyebrow">
                  GET IN TOUCH
                </p>

                <h2>
                  We're here
                  <br />
                  to help.
                </h2>

                <p>
                  Whether you want to know more about our
                  products or simply want to say hello,
                  feel free to reach out.
                </p>

              </div>


              {/* EMAIL */}

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Mail size={20} />
                </div>

                <div>
                  <span>Email</span>

                  <a href="mailto:hello@beepure.com">
                    hello@beepure.com
                  </a>
                </div>

              </div>


              {/* PHONE */}

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Phone size={20} />
                </div>

                <div>
                  <span>Phone</span>

                  <a href="tel:+919999999999">
                    +91 99999 99999
                  </a>
                </div>

              </div>


              {/* LOCATION */}

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <span>Location</span>

                  <p>
                    India
                  </p>
                </div>

              </div>


              {/* HOURS */}

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Clock size={20} />
                </div>

                <div>
                  <span>Business Hours</span>

                  <p>
                    Monday – Saturday
                    <br />
                    9:00 AM – 6:00 PM
                  </p>
                </div>

              </div>


              {/* WHATSAPP */}

              <a
                href="https://wa.me/919999999999"
                className="contact-whatsapp"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} />

                <span>
                  Chat with us on WhatsApp
                </span>
              </a>

            </div>


            {/* =====================================
                CONTACT FORM
            ===================================== */}

            <div className="contact-form-card">

              <div className="contact-form-header">

                <h2>
                  Send us a message
                </h2>

                <p>
                  Fill in the details below and we'll
                  get back to you as soon as possible.
                </p>

              </div>


              {submitted && (
                <div className="contact-success">
                  <strong>
                    Message sent successfully!
                  </strong>

                  <span>
                    Thank you for reaching out to Bee Pure.
                  </span>
                </div>
              )}


              <form onSubmit={handleSubmit}>

                {/* NAME */}

                <div className="contact-form-group">

                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* EMAIL + PHONE */}

                <div className="contact-form-row">

                  <div className="contact-form-group">

                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="contact-form-group">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91"
                      value={formData.phone}
                      onChange={handleChange}
                    />

                  </div>

                </div>


                {/* SUBJECT */}

                <div className="contact-form-group">

                  <label htmlFor="subject">
                    Subject
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select a subject
                    </option>

                    <option value="product">
                      Product Enquiry
                    </option>

                    <option value="order">
                      Order Support
                    </option>

                    <option value="delivery">
                      Delivery Question
                    </option>

                    <option value="farmer">
                      Farmer / Sourcing
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>


                {/* MESSAGE */}

                <div className="contact-form-group">

                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  className="contact-submit"
                >
                  <Send size={17} />

                  Send Message
                </button>

              </form>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          BOTTOM CTA
      ========================================= */}

      <section className="contact-bottom">

        <div className="contact-container">

          <div className="contact-bottom-content">

            <p className="contact-section-eyebrow">
              BEE PURE
            </p>

            <h2>
              Naturally good.
              <br />
              Always connected.
            </h2>

            <p>
              From our farmers to your home,
              we're building a better way to enjoy
              naturally good products.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Contact;