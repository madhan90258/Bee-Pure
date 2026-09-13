import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================================
  // PASSWORD RULES
  // =========================================

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const isStrongPassword =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.symbol;

  // =========================================
  // SIGNUP
  // =========================================

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // -----------------------------------------
    // NAME VALIDATION
    // -----------------------------------------

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // -----------------------------------------
    // EMAIL VALIDATION
    // -----------------------------------------

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // -----------------------------------------
    // PASSWORD VALIDATION
    // -----------------------------------------

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (!isStrongPassword) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one symbol."
      );
      return;
    }

    // -----------------------------------------
    // CONFIRM PASSWORD
    // -----------------------------------------

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("Creating Bee Pure account...");

      // ---------------------------------------
      // CREATE SUPABASE ACCOUNT
      // ---------------------------------------

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,

        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Account could not be created. Please try again."
        );
      }

      console.log(
        "Account created successfully:",
        data.user.id
      );

      // ---------------------------------------
      // SIGN OUT
      // ---------------------------------------

      /*
       * If email confirmation is disabled,
       * Supabase creates a session immediately.
       *
       * We intentionally sign the user out here.
       *
       * The required Bee Pure flow is:
       *
       * SIGNUP
       *   ↓
       * ACCOUNT CREATED
       *   ↓
       * LOGOUT
       *   ↓
       * LOGIN
       *   ↓
       * ACCOUNT
       */

      if (data.session) {
        const { error: signOutError } =
          await supabase.auth.signOut();

        if (signOutError) {
          console.error(
            "Sign out after signup failed:",
            signOutError
          );
        }
      }

      // ---------------------------------------
      // SUCCESS MESSAGE
      // ---------------------------------------

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      // ---------------------------------------
      // REDIRECT TO LOGIN
      // ---------------------------------------

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);

    } catch (err) {
      console.error("Signup error:", err);

      const errorMessage =
        err?.message || "";

      if (
        errorMessage
          .toLowerCase()
          .includes("already registered")
      ) {
        setError(
          "An account with this email already exists."
        );
      } else if (
        errorMessage
          .toLowerCase()
          .includes("already exists")
      ) {
        setError(
          "An account with this email already exists."
        );
      } else {
        setError(
          errorMessage ||
            "Unable to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // PASSWORD RULE
  // =========================================

  const PasswordRule = ({
    valid,
    children,
  }) => {
    return (
      <div
        className={`password-rule ${
          valid ? "valid" : "invalid"
        }`}
      >
        {valid ? (
          <Check size={14} />
        ) : (
          <X size={14} />
        )}

        <span>{children}</span>
      </div>
    );
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="signup-page">

      <div className="signup-container">

        <div className="signup-card">

          {/* =================================
              HEADER
          ================================== */}

          <div className="signup-header">

            <h1>
              Create Account
            </h1>

            <p>
              Join Bee Pure and shop naturally
            </p>

          </div>

          {/* =================================
              ERROR MESSAGE
          ================================== */}

          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          {/* =================================
              SUCCESS MESSAGE
          ================================== */}

          {message && (
            <div className="signup-success">
              {message}
            </div>
          )}

          {/* =================================
              SIGNUP FORM
          ================================== */}

          <form
            onSubmit={handleSignup}
            noValidate
          >

            {/* =================================
                FULL NAME
            ================================== */}

            <div className="signup-input-group">

              <label htmlFor="full-name">
                Full Name
              </label>

              <div className="signup-input-wrapper">

                <User size={19} />

                <input
                  id="full-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  autoComplete="name"
                />

              </div>

            </div>

            {/* =================================
                EMAIL
            ================================== */}

            <div className="signup-input-group">

              <label htmlFor="signup-email">
                Email Address
              </label>

              <div className="signup-input-wrapper">

                <Mail size={19} />

                <input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>

            {/* =================================
                PASSWORD
            ================================== */}

            <div className="signup-input-group">

              <label htmlFor="signup-password">
                Password
              </label>

              <div className="signup-input-wrapper">

                <Lock size={19} />

                <input
                  id="signup-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
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
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

              {/* PASSWORD RULES */}

              {password.length > 0 && (
                <div className="password-rules">

                  <PasswordRule
                    valid={
                      passwordRules.length
                    }
                  >
                    At least 8 characters
                  </PasswordRule>

                  <PasswordRule
                    valid={
                      passwordRules.uppercase
                    }
                  >
                    One uppercase letter
                  </PasswordRule>

                  <PasswordRule
                    valid={
                      passwordRules.lowercase
                    }
                  >
                    One lowercase letter
                  </PasswordRule>

                  <PasswordRule
                    valid={
                      passwordRules.number
                    }
                  >
                    One number
                  </PasswordRule>

                  <PasswordRule
                    valid={
                      passwordRules.symbol
                    }
                  >
                    One special character
                  </PasswordRule>

                </div>
              )}

            </div>

            {/* =================================
                CONFIRM PASSWORD
            ================================== */}

            <div className="signup-input-group">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <div className="signup-input-wrapper">

                <Lock size={19} />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

              {/* PASSWORD MATCH */}

              {confirmPassword.length > 0 && (
                <div
                  className={`password-match ${
                    password ===
                    confirmPassword
                      ? "match"
                      : "no-match"
                  }`}
                >
                  {password ===
                  confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </div>
              )}

            </div>

            {/* =================================
                CREATE ACCOUNT
            ================================== */}

            <button
              type="submit"
              className="signup-submit-btn"
              disabled={loading}
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>

          {/* =================================
              LOGIN
          ================================== */}

          <div className="signup-login-text">

            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Signup;