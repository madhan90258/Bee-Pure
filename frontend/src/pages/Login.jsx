import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [loginType, setLoginType] = useState("customer");

  // Customer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Seller
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPassword, setSellerPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // -----------------------------
  // CUSTOMER LOGIN
  // -----------------------------
  const handleCustomerLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Unable to login. Please try again.");
      }

      setMessage("Login successful!");

      // Go to customer account page
      setTimeout(() => {
        navigate("/account");
      }, 500);
    } catch (err) {
      console.error("Customer login error:", err);

      if (err.message?.toLowerCase().includes("invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // SELLER LOGIN
  // -----------------------------
  const handleSellerLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!sellerEmail.trim() || !sellerPassword) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sellerEmail.trim(),
        password: sellerPassword,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Unable to login. Please try again.");
      }

      // Check the user's role from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile lookup error:", profileError);

        // Sign out if we cannot verify the seller role
        await supabase.auth.signOut();

        throw new Error("Unable to verify seller account.");
      }

      if (profile.role !== "seller" && profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This account is not registered as a seller.");
      }

      setMessage("Seller login successful!");

      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 500);
    } catch (err) {
      console.error("Seller login error:", err);

      if (err.message?.toLowerCase().includes("invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Seller login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FORGOT PASSWORD
  // -----------------------------
  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    const resetEmail =
      loginType === "customer" ? email.trim() : sellerEmail.trim();

    if (!resetEmail) {
      setError("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage("Password reset instructions have been sent to your email.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Unable to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // GOOGLE LOGIN
  // -----------------------------
  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed.");
      setLoading(false);
    }
  };

  // -----------------------------
  // SWITCH LOGIN TYPE
  // -----------------------------
  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setError("");
    setMessage("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">

          {/* Header */}
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Login to your Bee Pure account</p>
          </div>

          {/* Customer / Seller Tabs */}
          <div className="login-type-tabs">
            <button
              type="button"
              className={loginType === "customer" ? "active" : ""}
              onClick={() => handleLoginTypeChange("customer")}
            >
              <User size={18} />
              Customer
            </button>

            <button
              type="button"
              className={loginType === "seller" ? "active" : ""}
              onClick={() => handleLoginTypeChange("seller")}
            >
              <Store size={18} />
              Seller
            </button>
          </div>

          {/* Messages */}
          {error && <div className="login-error">{error}</div>}

          {message && <div className="login-success">{message}</div>}

          {/* =========================
              CUSTOMER LOGIN
          ========================== */}
          {loginType === "customer" && (
            <form onSubmit={handleCustomerLogin}>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="customer-email">Email Address</label>

                <div className="input-wrapper">
                  <Mail size={19} />

                  <input
                    id="customer-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label htmlFor="customer-password">Password</label>

                <div className="input-wrapper">
                  <Lock size={19} />

                  <input
                    id="customer-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
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
              </div>

              {/* Forgot Password */}
              <div className="forgot-password">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <ArrowRight size={18} />}
              </button>

              {/* Divider */}
              <div className="login-divider">
                <span>OR</span>
              </div>

              {/* Google */}
              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="google-icon">G</span>
                Continue with Google
              </button>

              {/* Register */}
              <div className="register-text">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* =========================
              SELLER LOGIN
          ========================== */}
          {loginType === "seller" && (
            <form onSubmit={handleSellerLogin}>

              {/* Seller Email */}
              <div className="input-group">
                <label htmlFor="seller-email">Seller Email</label>

                <div className="input-wrapper">
                  <Mail size={19} />

                  <input
                    id="seller-email"
                    type="email"
                    placeholder="Enter seller email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Seller Password */}
              <div className="input-group">
                <label htmlFor="seller-password">Password</label>

                <div className="input-wrapper">
                  <Lock size={19} />

                  <input
                    id="seller-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={sellerPassword}
                    onChange={(e) => setSellerPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
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
              </div>

              {/* Forgot Password */}
              <div className="forgot-password">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Seller Login */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Seller Login"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;