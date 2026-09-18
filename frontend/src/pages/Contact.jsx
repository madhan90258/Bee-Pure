import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Loader2,
} from "lucide-react";

import "../styles/Contact.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function Contact() {
  const [formData, setFormData] =
    useState(emptyForm);

  const [errors, setErrors] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");


  // =========================================
  // VALIDATE INDIVIDUAL FIELD
  // =========================================

  const validateField = (
    name,
    value
  ) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error =
            "Please enter your name.";
        } else if (
          !/^[A-Za-z\s.'-]+$/.test(
            value.trim()
          )
        ) {
          error =
            "Name can contain only letters and spaces.";
        } else if (
          value.trim().length < 2
        ) {
          error =
            "Name must be at least 2 characters.";
        } else if (
          value.trim().length > 50
        ) {
          error =
            "Name must be less than 50 characters.";
        }
        break;

      case "email":
        if (!value.trim()) {
          error =
            "Please enter your email address.";
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
            value.trim()
          )
        ) {
          error =
            "Please enter a valid email address.";
        }
        break;

      case "phone":
        if (value.trim()) {
          const cleanPhone =
            value.replace(/\D/g, "");

          if (
            cleanPhone.length !== 10
          ) {
            error =
              "Phone number must contain 10 digits.";
          } else if (
            !/^[6-9]\d{9}$/.test(
              cleanPhone
            )
          ) {
            error =
              "Please enter a valid Indian mobile number.";
          }
        }
        break;

      case "subject":
        if (!value) {
          error =
            "Please select a subject.";
        }
        break;

      case "message":
        if (!value.trim()) {
          error =
            "Please enter your message.";
        } else if (
          value.trim().length < 10
        ) {
          error =
            "Message must be at least 10 characters.";
        } else if (
          value.trim().length > 1000
        ) {
          error =
            "Message must be less than 1000 characters.";
        }
        break;

      default:
        break;
    }

    return error;
  };


  // =========================================
  // VALIDATE ENTIRE FORM
  // =========================================

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach(
      (field) => {
        const error =
          validateField(
            field,
            formData[field]
          );

        if (error) {
          newErrors[field] =
            error;
        }
      }
    );

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };


  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

    setErrors(
      (current) => ({
        ...current,
        [name]: "",
      })
    );

    setSubmitted(false);
    setSubmitError("");
  };


  // =========================================
  // HANDLE FIELD BLUR
  // =========================================

  const handleBlur = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    const error =
      validateField(
        name,
        value
      );

    setErrors(
      (current) => ({
        ...current,
        [name]: error,
      })
    );
  };


  // =========================================
  // HANDLE FORM SUBMIT
  // =========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSubmitted(false);
    setSubmitError("");

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await fetch(
          `${API_URL}/api/contact`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name:
                formData.name.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              phone:
                formData.phone.trim() ||
                null,

              subject:
                formData.subject ||
                null,

              message:
                formData.message.trim(),
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to send your message."
        );
      }

      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      setSubmitted(true);

      setFormData(
        emptyForm
      );

      setErrors({});

      setTimeout(() => {
        setSubmitted(false);
      }, 4000);

    } catch (error) {
      console.error(
        "Contact form submission error:",
        error
      );

      setSubmitError(
        error.message ||
          "Unable to send your message. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
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
          CONTACT SECTION
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


              {/* BUSINESS HOURS */}

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
                href="https://wa.me/919025872161"
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


              {/* SUCCESS MESSAGE */}

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


              {/* ERROR MESSAGE */}

              {submitError && (
                <div
                  className="contact-success"
                  style={{
                    background: "#fff5f5",
                    borderColor: "#e3b5b5",
                  }}
                >
                  <strong
                    style={{
                      color: "#b42318",
                    }}
                  >
                    Unable to send message
                  </strong>

                  <span>
                    {submitError}
                  </span>
                </div>
              )}


              <form
                onSubmit={handleSubmit}
                noValidate
              >

                {/* =================================
                    NAME
                ================================= */}

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
                    onBlur={handleBlur}
                    autoComplete="name"
                    maxLength="50"
                    disabled={submitting}
                    className={
                      errors.name
                        ? "input-error"
                        : ""
                    }
                    aria-invalid={
                      Boolean(
                        errors.name
                      )
                    }
                    aria-describedby={
                      errors.name
                        ? "name-error"
                        : undefined
                    }
                  />

                  {errors.name && (
                    <span
                      id="name-error"
                      className="contact-field-error"
                    >
                      {errors.name}
                    </span>
                  )}

                </div>


                {/* =================================
                    EMAIL + PHONE
                ================================= */}

                <div className="contact-form-row">

                  {/* EMAIL */}

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
                      onBlur={handleBlur}
                      autoComplete="email"
                      disabled={submitting}
                      className={
                        errors.email
                          ? "input-error"
                          : ""
                      }
                      aria-invalid={
                        Boolean(
                          errors.email
                        )
                      }
                      aria-describedby={
                        errors.email
                          ? "email-error"
                          : undefined
                      }
                    />

                    {errors.email && (
                      <span
                        id="email-error"
                        className="contact-field-error"
                      >
                        {errors.email}
                      </span>
                    )}

                  </div>


                  {/* PHONE */}

                  <div className="contact-form-group">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="10 digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength="10"
                      disabled={submitting}
                      className={
                        errors.phone
                          ? "input-error"
                          : ""
                    }
                      aria-invalid={
                        Boolean(
                          errors.phone
                        )
                      }
                      aria-describedby={
                        errors.phone
                          ? "phone-error"
                          : undefined
                      }
                    />

                    {errors.phone && (
                      <span
                        id="phone-error"
                        className="contact-field-error"
                      >
                        {errors.phone}
                      </span>
                    )}

                  </div>

                </div>


                {/* =================================
                    SUBJECT
                ================================= */}

                <div className="contact-form-group">

                  <label htmlFor="subject">
                    Subject
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={submitting}
                    className={
                      errors.subject
                        ? "input-error"
                        : ""
                    }
                    aria-invalid={
                      Boolean(
                        errors.subject
                      )
                    }
                    aria-describedby={
                      errors.subject
                        ? "subject-error"
                        : undefined
                    }
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

                  {errors.subject && (
                    <span
                      id="subject-error"
                      className="contact-field-error"
                    >
                      {errors.subject}
                    </span>
                  )}

                </div>


                {/* =================================
                    MESSAGE
                ================================= */}

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
                    onBlur={handleBlur}
                    maxLength="1000"
                    disabled={submitting}
                    className={
                      errors.message
                        ? "input-error"
                        : ""
                    }
                    aria-invalid={
                      Boolean(
                        errors.message
                      )
                    }
                    aria-describedby={
                      errors.message
                        ? "message-error"
                        : undefined
                    }
                  />

                  <div className="contact-message-footer">

                    {errors.message ? (
                      <span
                        id="message-error"
                        className="contact-field-error"
                      >
                        {errors.message}
                      </span>
                    ) : (
                      <span />
                    )}

                    <span className="contact-character-count">
                      {formData.message.length}/1000
                    </span>

                  </div>

                </div>


                {/* =================================
                    SUBMIT
                ================================= */}

                <button
                  type="submit"
                  className="contact-submit"
                  disabled={submitting}
                >

                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="contact-submit-spinner"
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />

                      Send Message
                    </>
                  )}

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