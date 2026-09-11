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
  // PERSONAL DETAILS EDIT
  // =========================================

  const [isEditingProfile, setIsEditingProfile] =
    useState(false);

  const [editName, setEditName] = useState(
    seller.name
  );

  const [editMobile, setEditMobile] = useState(
    seller.mobile
  );

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

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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
  // EDIT PERSONAL DETAILS
  // =========================================

  const handleEditProfile = () => {
    clearMessages();

    setEditName(seller.name);
    setEditMobile(seller.mobile);

    setIsEditingProfile(true);
  };

  // =========================================
  // CANCEL PERSONAL DETAILS EDIT
  // =========================================

  const handleCancelProfileEdit = () => {
    setEditName(seller.name);
    setEditMobile(seller.mobile);

    setIsEditingProfile(false);

    clearMessages();
  };

  // =========================================
  // SAVE PERSONAL DETAILS
  // =========================================

  const handleSaveProfile = (event) => {
    event.preventDefault();

    clearMessages();

    const name = editName.trim();
    const mobile = editMobile.trim();

    // -----------------------------------------
    // NAME VALIDATION
    // -----------------------------------------

    if (!name) {
      setErrorMessage(
        "Please enter your seller name."
      );
      return;
    }

    if (name.length < 2) {
      setErrorMessage(
        "Seller name must contain at least 2 characters."
      );
      return;
    }

    // -----------------------------------------
    // MOBILE VALIDATION
    // -----------------------------------------

    if (!mobile) {
      setErrorMessage(
        "Please enter your mobile number."
      );
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, "");

    if (
      cleanMobile.length !== 10 ||
      !/^[6-9]/.test(cleanMobile)
    ) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // -----------------------------------------
    // UPDATE SELLER
    // -----------------------------------------

    setSeller((previous) => ({
      ...previous,
      name,
      mobile,
    }));

    setEditName(name);
    setEditMobile(mobile);

    setIsEditingProfile(false);

    setSuccessMessage(
      "Personal details updated successfully."
    );
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

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setErrorMessage(
        "Username can contain only letters, numbers, dots, underscores and hyphens."
      );
      return;
    }

    setSeller((previous) => ({
      ...previous,
      username,
    }));

    setNewUsername(username);

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

    if (!confirmPassword) {
      setErrorMessage(
        "Please confirm your new password."
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
      change request to Supabase/backend.
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

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // SELLER NAVIGATION
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

  // =========================================
  // PAGE
  // =========================================

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

          {/* SELLER PROFILE */}

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


          {/* NAVIGATION */}

          <nav className="seller-account-navigation">

            {sellerNavigation.map((item) => {

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

            })}

          </nav>


          {/* LOGOUT */}

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
              SUCCESS MESSAGE
          ========================================= */}

          {successMessage && (
            <div className="seller-account-message success">

              <CheckCircle size={19} />

              <span>
                {successMessage}
              </span>

            </div>
          )}


          {/* =========================================
              ERROR MESSAGE
          ========================================= */}

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

            {/* CARD HEADER */}

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <User size={21} />
              </div>

              <div className="seller-card-header-content">

                <h2>
                  Profile Details
                </h2>

                <p>
                  Your seller account information.
                </p>

              </div>


              {/* EDIT BUTTON */}

              {!isEditingProfile && (
                <button
                  type="button"
                  className="seller-edit-button"
                  onClick={handleEditProfile}
                >

                  <User size={16} />

                  <span>
                    Edit
                  </span>

                </button>
              )}

            </div>


            {/* =====================================
                PROFILE DETAILS
            ===================================== */}

            <div className="seller-profile-details">

              {/* =====================================
                  SELLER NAME
              ===================================== */}

              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Seller Name
                </span>

                {isEditingProfile ? (

                  <div className="seller-inline-input-wrapper">

                    <User size={17} />

                    <input
                      type="text"
                      value={editName}
                      onChange={(event) =>
                        setEditName(
                          event.target.value
                        )
                      }
                      placeholder="Enter seller name"
                      autoComplete="name"
                    />

                  </div>

                ) : (

                  <div className="seller-detail-value">

                    <User size={17} />

                    <span>
                      {seller.name}
                    </span>

                  </div>

                )}

              </div>


              {/* =====================================
                  EMAIL
              ===================================== */}

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


              {/* =====================================
                  MOBILE NUMBER
              ===================================== */}

              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Mobile Number
                </span>

                {isEditingProfile ? (

                  <div className="seller-inline-input-wrapper">

                    <Phone size={17} />

                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(event) =>
                        setEditMobile(
                          event.target.value
                        )
                      }
                      placeholder="Enter mobile number"
                      autoComplete="tel"
                    />

                  </div>

                ) : (

                  <div className="seller-detail-value">

                    <Phone size={17} />

                    <span>
                      {seller.mobile}
                    </span>

                  </div>

                )}

              </div>


              {/* =====================================
                  ACCOUNT TYPE
              ===================================== */}

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


            {/* =====================================
                INLINE EDIT ACTIONS
            ===================================== */}

            {isEditingProfile && (

              <form
                className="seller-inline-edit-actions"
                onSubmit={handleSaveProfile}
              >

                <button
                  type="submit"
                  className="seller-save-button"
                >

                  <Save size={17} />

                  <span>
                    Save Changes
                  </span>

                </button>


                <button
                  type="button"
                  className="seller-cancel-button"
                  onClick={handleCancelProfileEdit}
                >
                  Cancel
                </button>

              </form>

            )}

          </section>


          {/* =========================================
              CHANGE USERNAME
          ========================================= */}

          <section className="seller-account-card">

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <UserCircle size={21} />
              </div>

              <div className="seller-card-header-content">

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

              <div className="seller-card-header-content">

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

              {/* CURRENT PASSWORD */}

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


              {/* NEW PASSWORD */}

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


              {/* CONFIRM PASSWORD */}

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

              <div className="seller-card-header-content">

                <h2>
                  Security
                </h2>

                <p>
                  Manage your account security.
                </p>

              </div>

            </div>


            <div className="seller-security-content">

              <div className="seller-security-status">

                <div className="security-status-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>

                  <strong>
                    Your account is protected
                  </strong>

                  <p>
                    Keep your password secure and
                    never share it with anyone.
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
                  Logout
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