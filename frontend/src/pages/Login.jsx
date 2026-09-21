import { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Store,
  ArrowRight,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  // =========================================
  // LOGIN TYPE
  // =========================================

  const [loginType, setLoginType] =
    useState("customer");

  // =========================================
  // CUSTOMER
  // =========================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // =========================================
  // SELLER
  // =========================================

  const [sellerEmail, setSellerEmail] =
    useState("");

  const [sellerPassword, setSellerPassword] =
    useState("");

  // =========================================
  // UI STATE
  // =========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =========================================
  // BACKEND AUTH TEST
  // =========================================

  const testBackendAuthentication =
    async () => {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session?.access_token) {
          console.error(
            "Backend auth test: No access token found."
          );

          return null;
        }

        const API_URL =
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000";

        const response =
          await fetch(
            `${API_URL}/api/auth/me`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        const result =
          await response.json();

        console.log(
          "BACKEND AUTH RESPONSE:",
          result
        );

        return result;
      } catch (error) {
        console.error(
          "Backend authentication test failed:",
          error
        );

        return null;
      }
    };

  // =========================================
  // CUSTOMER LOGIN
  // =========================================

  const handleCustomerLogin =
    async (e) => {
      e.preventDefault();

      setError("");
      setMessage("");

      // Validate input
      if (
        !email.trim() ||
        !password
      ) {
        setError(
          "Please enter your email and password."
        );

        return;
      }

      setLoading(true);

      try {
        // -----------------------------------------
        // SUPABASE LOGIN
        // -----------------------------------------

        const {
          data,
          error: loginError,
        } =
          await supabase.auth.signInWithPassword(
            {
              email:
                email.trim(),
              password,
            }
          );

        if (loginError) {
          throw loginError;
        }

        if (!data?.user) {
          throw new Error(
            "Unable to login. Please try again."
          );
        }

        // -----------------------------------------
        // GET PROFILE ROLE
        // -----------------------------------------

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select("role")
            .eq(
              "id",
              data.user.id
            )
            .single();

        if (profileError) {
          console.error(
            "Customer profile lookup error:",
            profileError
          );

          await supabase.auth.signOut();

          throw new Error(
            "Unable to verify customer account."
          );
        }

        const role =
          profile?.role;

        // -----------------------------------------
        // SELLER USING CUSTOMER LOGIN
        // -----------------------------------------

        if (
          role === "seller" ||
          role === "admin"
        ) {
          await supabase.auth.signOut();

          throw new Error(
            "This account is registered as a seller. Please use Seller Login."
          );
        }

        // -----------------------------------------
        // INVALID ROLE
        // -----------------------------------------

        if (role !== "customer") {
          await supabase.auth.signOut();

          throw new Error(
            "This account is not registered as a customer."
          );
        }

        // -----------------------------------------
        // BACKEND AUTH TEST
        // -----------------------------------------

        await testBackendAuthentication();

        setMessage(
          "Login successful!"
        );

        // -----------------------------------------
        // CUSTOMER ACCOUNT
        // -----------------------------------------

        setTimeout(() => {
          navigate(
            "/account",
            {
              replace: true,
            }
          );
        }, 500);

      } catch (err) {
        console.error(
          "Customer login error:",
          err
        );

        const errorMessage =
          err?.message || "";

        if (
          errorMessage
            .toLowerCase()
            .includes(
              "invalid login"
            )
        ) {
          setError(
            "Invalid email or password."
          );
        } else {
          setError(
            errorMessage ||
              "Login failed. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================================
  // SELLER LOGIN
  // =========================================

  const handleSellerLogin =
    async (e) => {
      e.preventDefault();

      setError("");
      setMessage("");

      // Validate input
      if (
        !sellerEmail.trim() ||
        !sellerPassword
      ) {
        setError(
          "Please enter your seller email and password."
        );

        return;
      }

      setLoading(true);

      try {
        // -----------------------------------------
        // SUPABASE LOGIN
        // -----------------------------------------

        const {
          data,
          error: loginError,
        } =
          await supabase.auth.signInWithPassword(
            {
              email:
                sellerEmail.trim(),
              password:
                sellerPassword,
            }
          );

        if (loginError) {
          throw loginError;
        }

        if (!data?.user) {
          throw new Error(
            "Unable to login. Please try again."
          );
        }

        // -----------------------------------------
        // GET PROFILE ROLE
        // -----------------------------------------

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select("role")
            .eq(
              "id",
              data.user.id
            )
            .single();

        if (profileError) {
          console.error(
            "Seller profile lookup error:",
            profileError
          );

          await supabase.auth.signOut();

          throw new Error(
            "Unable to verify seller account."
          );
        }

        const role =
          profile?.role;

        // -----------------------------------------
        // CUSTOMER USING SELLER LOGIN
        // -----------------------------------------

        if (
          role === "customer"
        ) {
          await supabase.auth.signOut();

          throw new Error(
            "This account is registered as a customer. Please use Customer Login."
          );
        }

        // -----------------------------------------
        // ONLY SELLER / ADMIN ALLOWED
        // -----------------------------------------

        if (
          role !== "seller" &&
          role !== "admin"
        ) {
          await supabase.auth.signOut();

          throw new Error(
            "This account is not registered as a seller."
          );
        }

        // -----------------------------------------
        // BACKEND AUTH TEST
        // -----------------------------------------

        await testBackendAuthentication();

        setMessage(
          "Seller login successful!"
        );

        // -----------------------------------------
        // SELLER ACCOUNT FIRST
        // -----------------------------------------

        setTimeout(() => {
          navigate(
            "/seller/account",
            {
              replace: true,
            }
          );
        }, 500);

      } catch (err) {
        console.error(
          "Seller login error:",
          err
        );

        const errorMessage =
          err?.message || "";

        if (
          errorMessage
            .toLowerCase()
            .includes(
              "invalid login"
            )
        ) {
          setError(
            "Invalid email or password."
          );
        } else {
          setError(
            errorMessage ||
              "Seller login failed."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword =
    async () => {
      setError("");
      setMessage("");

      const resetEmail =
        loginType === "customer"
          ? email.trim()
          : sellerEmail.trim();

      if (!resetEmail) {
        setError(
          "Enter your email address first."
        );

        return;
      }

      setLoading(true);

      try {
        const {
          error: resetError,
        } =
          await supabase.auth.resetPasswordForEmail(
            resetEmail,
            {
              redirectTo:
                `${window.location.origin}/reset-password`,
            }
          );

        if (resetError) {
          throw resetError;
        }

        setMessage(
          "Password reset instructions have been sent to your email."
        );
      } catch (err) {
        console.error(
          "Password reset error:",
          err
        );

        setError(
          err?.message ||
            "Unable to send password reset email."
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin =
    async () => {
      setError("");
      setMessage("");
      setLoading(true);

      try {
        /*
         * Google login is treated as customer login.
         *
         * The RoleProtectedRoute will still verify
         * the actual profile role after redirect.
         */

        const {
          error: googleError,
        } =
          await supabase.auth.signInWithOAuth(
            {
              provider: "google",

              options: {
                redirectTo:
                  `${window.location.origin}/account`,
              },
            }
          );

        if (googleError) {
          throw googleError;
        }
      } catch (err) {
        console.error(
          "Google login error:",
          err
        );

        setError(
          err?.message ||
            "Google login failed."
        );

        setLoading(false);
      }
    };

  // =========================================
  // SWITCH LOGIN TYPE
  // =========================================

  const handleLoginTypeChange =
    (type) => {
      setLoginType(type);

      setError("");
      setMessage("");
      setShowPassword(false);
    };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-card">

          {/* =====================================
              HEADER
          ====================================== */}

          <div className="login-header">

            <h1>
              Welcome Back
            </h1>

            <p>
              Login to your Bee Pure account
            </p>

          </div>

          {/* =====================================
              LOGIN TYPE
          ====================================== */}

          <div className="login-type-tabs">

            <button
              type="button"
              className={
                loginType ===
                "customer"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleLoginTypeChange(
                  "customer"
                )
              }
            >
              <User size={18} />

              Customer
            </button>

            <button
              type="button"
              className={
                loginType ===
                "seller"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleLoginTypeChange(
                  "seller"
                )
              }
            >
              <Store size={18} />

              Seller
            </button>

          </div>

          {/* =====================================
              ERROR
          ====================================== */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* =====================================
              SUCCESS
          ====================================== */}

          {message && (
            <div className="login-success">
              {message}
            </div>
          )}

          {/* =====================================
              CUSTOMER LOGIN
          ====================================== */}

          {loginType ===
            "customer" && (
            <form
              onSubmit={
                handleCustomerLogin
              }
            >

              {/* EMAIL */}

              <div className="input-group">

                <label htmlFor="customer-email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <Mail size={19} />

                  <input
                    id="customer-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="input-group">

                <label htmlFor="customer-password">
                  Password
                </label>

                <div className="input-wrapper">

                  <Lock size={19} />

                  <input
                    id="customer-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>

                </div>

              </div>

              {/* FORGOT PASSWORD */}

              <div className="forgot-password">

                <button
                  type="button"
                  onClick={
                    handleForgotPassword
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}

                {!loading && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>

              {/* DIVIDER */}

              <div className="login-divider">
                <span>
                  OR
                </span>
              </div>

              {/* GOOGLE */}

              <button
                type="button"
                className="google-login-btn"
                onClick={
                  handleGoogleLogin
                }
                disabled={loading}
              >
                <span className="google-icon">
                  G
                </span>

                Continue with Google
              </button>

              {/* REGISTER */}

              <div className="register-text">

                Don't have an account?{" "}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/signup"
                    )
                  }
                >
                  Create Account
                </button>

              </div>

            </form>
          )}

          {/* =====================================
              SELLER LOGIN
          ====================================== */}

          {loginType ===
            "seller" && (
            <form
              onSubmit={
                handleSellerLogin
              }
            >

              {/* EMAIL */}

              <div className="input-group">

                <label htmlFor="seller-email">
                  Seller Email
                </label>

                <div className="input-wrapper">

                  <Mail size={19} />

                  <input
                    id="seller-email"
                    type="email"
                    placeholder="Enter seller email"
                    value={sellerEmail}
                    onChange={(e) =>
                      setSellerEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="input-group">

                <label htmlFor="seller-password">
                  Password
                </label>

                <div className="input-wrapper">

                  <Lock size={19} />

                  <input
                    id="seller-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    value={
                      sellerPassword
                    }
                    onChange={(e) =>
                      setSellerPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>

                </div>

              </div>

              {/* FORGOT PASSWORD */}

              <div className="forgot-password">

                <button
                  type="button"
                  onClick={
                    handleForgotPassword
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>

              </div>

              {/* SELLER LOGIN */}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Seller Login"}

                {!loading && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;