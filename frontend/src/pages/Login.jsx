import { useState } from "react";
import {
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Leaf,
} from "lucide-react";

import "../styles/Login.css";

function Login() {
  const [loginType, setLoginType] = useState("customer");

  const [customerMethod, setCustomerMethod] = useState("email");

  const [customerValue, setCustomerValue] = useState("");
  const [sellerUsername, setSellerUsername] = useState("");
  const [sellerPassword, setSellerPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // =========================================
  // CUSTOMER OTP
  // =========================================

  const handleSendOtp = (event) => {
    event.preventDefault();

    if (!customerValue.trim()) {
      return;
    }

    /*
      Temporary frontend behavior.

      Later this will be replaced with:
      Supabase Auth → Email OTP / Phone OTP
    */

    setOtpSent(true);
  };

  // =========================================
  // VERIFY OTP
  // =========================================

  const handleVerifyOtp = (event) => {
    event.preventDefault();

    if (!otp.trim()) {
      return;
    }

    /*
      Temporary frontend behavior.

      Later:
      Supabase will verify the OTP and
      create the authenticated session.
    */

    console.log("OTP:", otp);
  };

  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin = () => {
    /*
      Later this will use:

      supabase.auth.signInWithOAuth({
        provider: "google"
      })
    */

    console.log("Google login");
  };

  // =========================================
  // SELLER LOGIN
  // =========================================

  const handleSellerLogin = (event) => {
    event.preventDefault();

    if (
      !sellerUsername.trim() ||
      !sellerPassword.trim()
    ) {
      return;
    }

    /*
      Temporary frontend behavior.

      Seller authentication will later be
      connected securely to Supabase.
    */

    console.log("Seller login");
  };

  // =========================================
  // RESET CUSTOMER LOGIN
  // =========================================

  const handleCustomerMethodChange = (method) => {
    setCustomerMethod(method);
    setCustomerValue("");
    setOtp("");
    setOtpSent(false);
  };

  return (
    <main className="login-page">

      <div className="login-container">

        {/* =====================================
            LEFT BRAND PANEL
        ====================================== */}

        <section className="login-brand">

          <div className="login-brand-content">

            <div className="login-brand-icon">
              🐝
            </div>

            <p className="login-brand-eyebrow">
              WELCOME TO BEE PURE
            </p>

            <h1>
              Pure goodness,
              <br />
              straight from
              <br />
              <span>the source.</span>
            </h1>

            <p className="login-brand-description">
              Shop naturally good products sourced
              directly from trusted farmers and
              beekeepers.
            </p>

            <div className="login-brand-benefits">

              <div>
                <Leaf size={18} />
                <span>
                  Naturally sourced products
                </span>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>
                  Trusted quality
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            LOGIN PANEL
        ====================================== */}

        <section className="login-card">

          <div className="login-card-header">

            <p className="login-eyebrow">
              ACCOUNT
            </p>

            <h2>
              Welcome back
            </h2>

            <p>
              Login to continue to Bee Pure.
            </p>

          </div>


          {/* ===================================
              LOGIN TYPE
          ==================================== */}

          <div className="login-type-tabs">

            <button
              type="button"
              className={
                loginType === "customer"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setLoginType("customer");
                setOtpSent(false);
                setOtp("");
              }}
            >
              <User size={16} />
              Customer
            </button>

            <button
              type="button"
              className={
                loginType === "seller"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setLoginType("seller");
                setOtpSent(false);
                setOtp("");
              }}
            >
              <ShieldCheck size={16} />
              Seller
            </button>

          </div>


          {/* ===================================
              CUSTOMER LOGIN
          ==================================== */}

          {loginType === "customer" && (

            <div className="login-form-wrapper">

              {!otpSent ? (
                <form
                  className="login-form"
                  onSubmit={handleSendOtp}
                >

                  {/* Method */}

                  <div className="login-method-tabs">

                    <button
                      type="button"
                      className={
                        customerMethod === "email"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handleCustomerMethodChange(
                          "email"
                        )
                      }
                    >
                      <Mail size={15} />
                      Email
                    </button>

                    <button
                      type="button"
                      className={
                        customerMethod === "mobile"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handleCustomerMethodChange(
                          "mobile"
                        )
                      }
                    >
                      <Phone size={15} />
                      Mobile
                    </button>

                  </div>


                  {/* Input */}

                  <div className="login-input-group">

                    <label htmlFor="customer-value">
                      {customerMethod === "email"
                        ? "Email address"
                        : "Mobile number"}
                    </label>

                    <div className="login-input">

                      {customerMethod === "email" ? (
                        <Mail size={17} />
                      ) : (
                        <Phone size={17} />
                      )}

                      <input
                        id="customer-value"
                        type={
                          customerMethod === "email"
                            ? "email"
                            : "tel"
                        }
                        placeholder={
                          customerMethod === "email"
                            ? "Enter your email"
                            : "Enter your mobile number"
                        }
                        value={customerValue}
                        onChange={(event) =>
                          setCustomerValue(
                            event.target.value
                          )
                        }
                        required
                      />

                    </div>

                  </div>


                  {/* OTP Button */}

                  <button
                    type="submit"
                    className="login-primary-button"
                  >
                    Send OTP
                    <ArrowRight size={17} />
                  </button>


                  {/* Divider */}

                  <div className="login-divider">
                    <span>OR</span>
                  </div>


                  {/* Google */}

                  <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                  >

                    <span className="google-icon">
                      G
                    </span>

                    Continue with Google

                  </button>

                </form>
              ) : (

                /* =================================
                   OTP FORM
                ================================= */

                <form
                  className="login-form"
                  onSubmit={handleVerifyOtp}
                >

                  <button
                    type="button"
                    className="login-back-button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                  >
                    ← Change {customerMethod}
                  </button>

                  <div className="otp-header">

                    <div className="otp-icon">
                      {customerMethod === "email" ? (
                        <Mail size={21} />
                      ) : (
                        <Phone size={21} />
                      )}
                    </div>

                    <h3>
                      Verify your account
                    </h3>

                    <p>
                      We've sent a verification code
                      to your{" "}
                      {customerMethod === "email"
                        ? "email"
                        : "mobile number"}.
                    </p>

                  </div>


                  <div className="login-input-group">

                    <label htmlFor="otp">
                      Enter OTP
                    </label>

                    <div className="login-input">

                      <Lock size={17} />

                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(event) =>
                          setOtp(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        required
                      />

                    </div>

                  </div>


                  <button
                    type="submit"
                    className="login-primary-button"
                  >
                    Verify & Continue
                    <ArrowRight size={17} />
                  </button>


                  <button
                    type="button"
                    className="resend-otp-button"
                    onClick={handleSendOtp}
                  >
                    Resend OTP
                  </button>

                </form>
              )}

            </div>
          )}


          {/* ===================================
              SELLER LOGIN
          ==================================== */}

          {loginType === "seller" && (

            <form
              className="login-form"
              onSubmit={handleSellerLogin}
            >

              <div className="seller-login-notice">

                <ShieldCheck size={19} />

                <div>
                  <strong>
                    Seller access
                  </strong>

                  <span>
                    This login is only for the
                    Bee Pure seller.
                  </span>
                </div>

              </div>


              {/* Username */}

              <div className="login-input-group">

                <label htmlFor="seller-username">
                  Username
                </label>

                <div className="login-input">

                  <User size={17} />

                  <input
                    id="seller-username"
                    type="text"
                    placeholder="Enter seller username"
                    value={sellerUsername}
                    onChange={(event) =>
                      setSellerUsername(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {/* Password */}

              <div className="login-input-group">

                <label htmlFor="seller-password">
                  Password
                </label>

                <div className="login-input">

                  <Lock size={17} />

                  <input
                    id="seller-password"
                    type="password"
                    placeholder="Enter password"
                    value={sellerPassword}
                    onChange={(event) =>
                      setSellerPassword(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              <button
                type="submit"
                className="login-primary-button"
              >
                Seller Login
                <ArrowRight size={17} />
              </button>

            </form>
          )}


          {/* ===================================
              FOOTER
          ==================================== */}

          <p className="login-footer-text">
            By continuing, you agree to Bee Pure's
            terms and privacy policy.
          </p>

        </section>

      </div>

    </main>
  );
}

export default Login;