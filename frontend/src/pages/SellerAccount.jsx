import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  LogOut,
  LayoutDashboard,
  Package,
  FolderTree,
  TicketPercent,
  MessageSquare,
  Star,
  ShoppingBag,
  UserCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import "../styles/SellerAccount.css";

function SellerAccount() {
  const navigate = useNavigate();

  // =========================================
  // SELLER INFORMATION
  // =========================================

  const [seller, setSeller] = useState({
    name: "Bee Pure Seller",
    username: "seller",
    email: "seller@beepure.com",
    mobile: "+91 98765 43210",
  });

  // =========================================
  // USERNAME FORM
  // =========================================

  const [newUsername, setNewUsername] = useState(
    seller.username
  );

  // =========================================
  // PASSWORD FORM
  // =========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =========================================
  // MESSAGES
  // =========================================

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =========================================
  // CLEAR MESSAGES
  // =========================================

  const clearMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  // =========================================
  // UPDATE USERNAME
  // =========================================

  const handleUsernameUpdate = (event) => {
    event.preventDefault();

    clearMessages();

    const username = newUsername.trim();

    if (!username) {
      setErrorMessage(
        "Please enter a valid username."
      );
      return;
    }

    if (username.length < 4) {
      setErrorMessage(
        "Username must contain at least 4 characters."
      );
      return;
    }

    setSeller((previous) => ({
      ...previous,
      username,
    }));

    setSuccessMessage(
      "Username updated successfully."
    );
  };

  // =========================================
  // UPDATE PASSWORD
  // =========================================

  const handlePasswordUpdate = (event) => {
    event.preventDefault();

    clearMessages();

    if (!currentPassword) {
      setErrorMessage(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setErrorMessage(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    /*
      BACKEND TODO

      Later this section will send the password
      change request to your backend.

      Example:

      await api.put("/seller/account/password", {
        currentPassword,
        newPassword
      });
    */

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setSuccessMessage(
      "Password updated successfully."
    );
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    /*
      BACKEND TODO

      Later:

      - Clear seller authentication token
      - Clear seller session
      - Redirect to login
    */

    localStorage.removeItem("sellerLoggedIn");

    navigate("/login");
  };

  // =========================================
  // DASHBOARD NAVIGATION
  // =========================================

  const sellerNavigation = [
    {
      name: "Dashboard",
      path: "/seller/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/seller/products",
      icon: Package,
    },
    {
      name: "Categories",
      path: "/seller/categories",
      icon: FolderTree,
    },
    {
      name: "Coupons",
      path: "/seller/coupons",
      icon: TicketPercent,
    },
    {
      name: "Messages",
      path: "/seller/messages",
      icon: MessageSquare,
    },
    {
      name: "Reviews",
      path: "/seller/reviews",
      icon: Star,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: ShoppingBag,
    },
    {
      name: "Account",
      path: "/seller/account",
      icon: UserCircle,
      active: true,
    },
  ];

  return (
    <main className="seller-account-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <section className="seller-account-header">

        <div className="seller-account-header-inner">

          <div>
            <span className="seller-account-eyebrow">
              Seller Panel
            </span>

            <h1>
              Seller Account
            </h1>

            <p>
              Manage your seller profile and account
              security.
            </p>
          </div>

          <div className="seller-account-header-icon">
            <UserCircle size={42} />
          </div>

        </div>

      </section>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <section className="seller-account-container">

        {/* =========================================
            SIDEBAR
        ========================================= */}

        <aside className="seller-account-sidebar">

          <div className="seller-profile-card">

            <div className="seller-avatar">
              <User size={30} />
            </div>

            <div className="seller-profile-info">

              <h3>
                {seller.name}
              </h3>

              <p>
                @{seller.username}
              </p>

            </div>

          </div>


          <nav className="seller-account-navigation">

            {sellerNavigation.map(
              (item) => {

                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`seller-account-nav-link ${
                      item.active
                        ? "active"
                        : ""
                    }`}
                  >
                    <Icon size={18} />

                    <span>
                      {item.name}
                    </span>
                  </Link>
                );
              }
            )}

          </nav>


          <button
            type="button"
            className="seller-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />

            <span>
              Logout
            </span>
          </button>

        </aside>


        {/* =========================================
            ACCOUNT CONTENT
        ========================================= */}

        <div className="seller-account-content">

          {/* =========================================
              NOTIFICATIONS
          ========================================= */}

          {successMessage && (
            <div className="seller-account-message success">

              <CheckCircle size={19} />

              <span>
                {successMessage}
              </span>

            </div>
          )}

          {errorMessage && (
            <div className="seller-account-message error">

              <AlertCircle size={19} />

              <span>
                {errorMessage}
              </span>

            </div>
          )}


          {/* =========================================
              PROFILE DETAILS
          ========================================= */}

          <section className="seller-account-card">

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <User size={21} />
              </div>

              <div>
                <h2>
                  Profile Details
                </h2>

                <p>
                  Your seller account information.
                </p>
              </div>

            </div>


            <div className="seller-profile-details">

              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Seller Name
                </span>

                <div className="seller-detail-value">
                  <User size={17} />

                  <span>
                    {seller.name}
                  </span>
                </div>

              </div>


              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Email Address
                </span>

                <div className="seller-detail-value">
                  <Mail size={17} />

                  <span>
                    {seller.email}
                  </span>
                </div>

              </div>


              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Mobile Number
                </span>

                <div className="seller-detail-value">
                  <Phone size={17} />

                  <span>
                    {seller.mobile}
                  </span>
                </div>

              </div>


              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Account Type
                </span>

                <div className="seller-detail-value">

                  <ShieldCheck size={17} />

                  <span>
                    Administrator / Seller
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =========================================
              CHANGE USERNAME
          ========================================= */}

          <section className="seller-account-card">

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <UserCircle size={21} />
              </div>

              <div>

                <h2>
                  Change Username
                </h2>

                <p>
                  Update the username used to access
                  your seller account.
                </p>

              </div>

            </div>


            <form
              className="seller-account-form"
              onSubmit={handleUsernameUpdate}
            >

              <div className="seller-form-group">

                <label htmlFor="seller-username">
                  Username
                </label>

                <div className="seller-input-wrapper">

                  <User size={18} />

                  <input
                    id="seller-username"
                    type="text"
                    value={newUsername}
                    onChange={(event) =>
                      setNewUsername(
                        event.target.value
                      )
                    }
                    placeholder="Enter username"
                    autoComplete="username"
                  />

                </div>

              </div>


              <button
                type="submit"
                className="seller-save-button"
              >
                <Save size={17} />

                <span>
                  Save Username
                </span>
              </button>

            </form>

          </section>


          {/* =========================================
              CHANGE PASSWORD
          ========================================= */}

          <section className="seller-account-card">

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <Lock size={21} />
              </div>

              <div>

                <h2>
                  Change Password
                </h2>

                <p>
                  Keep your seller account secure with
                  a strong password.
                </p>

              </div>

            </div>


            <form
              className="seller-account-form"
              onSubmit={handlePasswordUpdate}
            >

              {/* Current Password */}

              <div className="seller-form-group">

                <label htmlFor="current-password">
                  Current Password
                </label>

                <div className="seller-input-wrapper">

                  <Lock size={18} />

                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowCurrentPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* New Password */}

              <div className="seller-form-group">

                <label htmlFor="new-password">
                  New Password
                </label>

                <div className="seller-input-wrapper">

                  <Lock size={18} />

                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <small>
                  Password must contain at least
                  8 characters.
                </small>

              </div>


              {/* Confirm Password */}

              <div className="seller-form-group">

                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>

                <div className="seller-input-wrapper">

                  <Lock size={18} />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              <button
                type="submit"
                className="seller-save-button"
              >
                <Save size={17} />

                <span>
                  Update Password
                </span>
              </button>

            </form>

          </section>


          {/* =========================================
              SECURITY
          ========================================= */}

          <section className="seller-account-card seller-security-card">

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <ShieldCheck size={21} />
              </div>

              <div>

                <h2>
                  Account Security
                </h2>

                <p>
                  Manage your seller session and
                  account access.
                </p>

              </div>

            </div>


            <div className="seller-security-content">

              <div className="seller-security-status">

                <div className="security-status-icon">
                  <ShieldCheck size={22} />
                </div>

                <div>

                  <strong>
                    Seller account protected
                  </strong>

                  <p>
                    Your seller account is currently
                    active.
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="seller-security-logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />

                <span>
                  Logout from Seller Account
                </span>
              </button>

            </div>

          </section>

        </div>

      </section>

    </main>
  );
}

export default SellerAccount;