import { useEffect, useState } from "react";

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
  Loader2,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

import "../styles/SellerAccount.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


function SellerAccount() {
  const navigate = useNavigate();

  // =========================================
  // SELLER INFORMATION
  // =========================================

  const [seller, setSeller] = useState({
    name: "",
    username: "seller",
    email: "",
    mobile: "",
    role: "",
  });

  // =========================================
  // PAGE STATE
  // =========================================

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [updatingPassword, setUpdatingPassword] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  // =========================================
  // PERSONAL DETAILS EDIT
  // =========================================

  const [isEditingProfile, setIsEditingProfile] =
    useState(false);

  const [editName, setEditName] =
    useState("");

  const [editMobile, setEditMobile] =
    useState("");

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
  // GET ACCESS TOKEN
  // =========================================

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return session?.access_token || null;
  };

  // =========================================
  // LOAD SELLER PROFILE
  // =========================================

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load seller profile."
        );
      }

      const profile =
        result.profile ||
        result.data?.profile ||
        result.data ||
        result;

      // ---------------------------------------
      // SELLER ROLE CHECK
      // ---------------------------------------

      if (
        profile.role &&
        profile.role !== "seller" &&
        profile.role !== "admin"
      ) {
        await supabase.auth.signOut();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // ---------------------------------------
      // AUTH EMAIL
      // ---------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const email =
        profile.email ||
        user?.email ||
        "";

      const name =
        profile.full_name ||
        "";

      const mobile =
        profile.phone ||
        "";

      setSeller({
        name,
        username: "seller",
        email,
        mobile,
        role: profile.role || "seller",
      });

      setEditName(name);
      setEditMobile(mobile);

    } catch (error) {
      console.error(
        "Load seller profile error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load seller profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadSellerProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "SIGNED_OUT" ||
          !session
        ) {
          navigate("/login", {
            replace: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const handleSaveProfile = async (event) => {
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

    const cleanMobile =
      mobile.replace(/\D/g, "");

    if (
      cleanMobile.length !== 10 ||
      !/^[6-9]/.test(cleanMobile)
    ) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setSavingProfile(true);

      const token =
        await getAccessToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: name,
            phone: mobile,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update profile."
        );
      }

      const updatedProfile =
        result.profile ||
        result.data?.profile ||
        result.data ||
        {};

      setSeller((previous) => ({
        ...previous,
        name:
          updatedProfile.full_name ||
          name,
        mobile:
          updatedProfile.phone ||
          mobile,
      }));

      setEditName(name);
      setEditMobile(mobile);

      setIsEditingProfile(false);

      setSuccessMessage(
        "Personal details updated successfully."
      );

    } catch (error) {
      console.error(
        "Save seller profile error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================
  // PASSWORD UPDATE
  // =========================================

  const handlePasswordUpdate = async (
    event
  ) => {
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

    try {
      setUpdatingPassword(true);

      // ---------------------------------------
      // GET CURRENT USER
      // ---------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user?.email) {
        throw new Error(
          "Unable to identify your seller account."
        );
      }

      // ---------------------------------------
      // VERIFY CURRENT PASSWORD
      // ---------------------------------------

      const {
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error(
          "Current password is incorrect."
        );
      }

      // ---------------------------------------
      // UPDATE PASSWORD
      // ---------------------------------------

      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // ---------------------------------------
      // CLEAR FORM
      // ---------------------------------------

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Password updated successfully."
      );

    } catch (error) {
      console.error(
        "Update seller password error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to update password."
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    try {
      clearMessages();

      setLoggingOut(true);

      const {
        error,
      } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      localStorage.removeItem(
        "sellerLoggedIn"
      );

      navigate("/login", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Seller logout error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to logout. Please try again."
      );

      setLoggingOut(false);
    }
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
  // LOADING
  // =========================================

  if (loading) {
    return (
      <main className="seller-account-page">

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
                Manage your seller profile and
                account security.
              </p>
            </div>

            <div className="seller-account-header-icon">
              <UserCircle size={42} />
            </div>
          </div>
        </section>

        <section className="seller-account-container">
          <div
            style={{
              width: "100%",
              minHeight: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <Loader2
              size={34}
              className="seller-account-spinner"
            />

            <p>
              Loading seller account...
            </p>
          </div>
        </section>

      </main>
    );
  }

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
                {seller.name ||
                  "Bee Pure Seller"}
              </h3>

              <p>
                {seller.email}
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
            disabled={loggingOut}
          >

            {loggingOut ? (
              <Loader2
                size={18}
                className="seller-account-spinner"
              />
            ) : (
              <LogOut size={18} />
            )}

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>

          </button>

        </aside>


        {/* =========================================
            ACCOUNT CONTENT
        ========================================= */}

        <div className="seller-account-content">

          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <div className="seller-account-message success">

              <CheckCircle size={19} />

              <span>
                {successMessage}
              </span>

            </div>
          )}


          {/* ERROR MESSAGE */}

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

              <div className="seller-card-header-content">

                <h2>
                  Profile Details
                </h2>

                <p>
                  Your seller account information.
                </p>

              </div>


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


            {/* PROFILE DETAILS */}

            <div className="seller-profile-details">

              {/* SELLER NAME */}

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
                      disabled={savingProfile}
                    />

                  </div>

                ) : (

                  <div className="seller-detail-value">

                    <User size={17} />

                    <span>
                      {seller.name ||
                        "Not provided"}
                    </span>

                  </div>

                )}

              </div>


              {/* EMAIL */}

              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Email Address
                </span>

                <div className="seller-detail-value">

                  <Mail size={17} />

                  <span>
                    {seller.email ||
                      "Not available"}
                  </span>

                </div>

              </div>


              {/* MOBILE */}

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
                      disabled={savingProfile}
                    />

                  </div>

                ) : (

                  <div className="seller-detail-value">

                    <Phone size={17} />

                    <span>
                      {seller.mobile ||
                        "Not provided"}
                    </span>

                  </div>

                )}

              </div>


              {/* ACCOUNT TYPE */}

              <div className="seller-detail-item">

                <span className="seller-detail-label">
                  Account Type
                </span>

                <div className="seller-detail-value">

                  <ShieldCheck size={17} />

                  <span>
                    {seller.role === "admin"
                      ? "Administrator"
                      : "Seller"}
                  </span>

                </div>

              </div>

            </div>


            {/* EDIT ACTIONS */}

            {isEditingProfile && (

              <form
                className="seller-inline-edit-actions"
                onSubmit={handleSaveProfile}
              >

                <button
                  type="submit"
                  className="seller-save-button"
                  disabled={savingProfile}
                >

                  {savingProfile ? (
                    <>
                      <Loader2
                        size={17}
                        className="seller-account-spinner"
                      />

                      <span>
                        Saving...
                      </span>
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      <span>
                        Save Changes
                      </span>
                    </>
                  )}

                </button>


                <button
                  type="button"
                  className="seller-cancel-button"
                  onClick={
                    handleCancelProfileEdit
                  }
                  disabled={savingProfile}
                >
                  Cancel
                </button>

              </form>

            )}

          </section>


          {/* =========================================
              USERNAME
          ========================================= */}

          <section className="seller-account-card">

            <div className="seller-card-header">

              <div className="seller-card-icon">
                <UserCircle size={21} />
              </div>

              <div className="seller-card-header-content">

                <h2>
                  Username
                </h2>

                <p>
                  Your seller username is currently
                  managed by the authentication system.
                </p>

              </div>

            </div>


            <div className="seller-account-form">

              <div className="seller-form-group">

                <label>
                  Username
                </label>

                <div className="seller-input-wrapper">

                  <User size={18} />

                  <input
                    type="text"
                    value={
                      seller.username
                    }
                    disabled
                    readOnly
                  />

                </div>

                <small>
                  Username changes require a username
                  field in the seller profile database.
                </small>

              </div>

            </div>

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
                    disabled={
                      updatingPassword
                    }
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
                    disabled={
                      updatingPassword
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
                    disabled={
                      updatingPassword
                    }
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
                    disabled={
                      updatingPassword
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
                    disabled={
                      updatingPassword
                    }
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
                    disabled={
                      updatingPassword
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
                disabled={
                  updatingPassword
                }
              >

                {updatingPassword ? (
                  <>
                    <Loader2
                      size={17}
                      className="seller-account-spinner"
                    />

                    <span>
                      Updating...
                    </span>
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    <span>
                      Update Password
                    </span>
                  </>
                )}

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
                disabled={loggingOut}
              >

                {loggingOut ? (
                  <Loader2
                    size={17}
                    className="seller-account-spinner"
                  />
                ) : (
                  <LogOut size={17} />
                )}

                <span>
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
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