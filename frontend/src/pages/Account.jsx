import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  Edit3,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import "../styles/Account.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// =====================================================
// ACCOUNT
// =====================================================

function Account() {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const [orderCount, setOrderCount] =
    useState(0);

  const [addressCount, setAddressCount] =
    useState(0);


  // ===================================================
  // GET ACCESS TOKEN
  // ===================================================

  const getAccessToken = async () => {
    const {
      data,
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token =
      data?.session?.access_token;

    if (!token) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    return token;
  };


  // ===================================================
  // LOAD PROFILE
  // ===================================================

  const loadProfile = async () => {
    const token =
      await getAccessToken();

    const response = await fetch(
      `${API_URL}/api/profile`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Failed to load profile."
      );
    }

    const profile =
      result?.profile ||
      result?.data ||
      result;

    const profileData = {
      name:
        profile?.full_name ||
        "",
      email:
        profile?.email ||
        "",
      phone:
        profile?.phone ||
        "",
    };

    setUser(profileData);

    setEditName(
      profileData.name
    );

    setEditPhone(
      profileData.phone
    );
  };


  // ===================================================
  // LOAD ORDERS
  // ===================================================

  const loadOrders = async () => {
    try {
      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        return;
      }

      const orders =
        Array.isArray(result)
          ? result
          : result?.orders ||
            result?.data ||
            [];

      setOrderCount(
        orders.length
      );
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );
    }
  };


  // ===================================================
  // LOAD ADDRESSES
  // ===================================================

  const loadAddresses = async () => {
    try {
      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/addresses`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        return;
      }

      const addresses =
        Array.isArray(result)
          ? result
          : result?.addresses ||
            result?.data ||
            [];

      setAddressCount(
        addresses.length
      );
    } catch (error) {
      console.error(
        "Load addresses error:",
        error
      );
    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!data?.session) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        await loadProfile();

        await Promise.all([
          loadOrders(),
          loadAddresses(),
        ]);
      } catch (error) {
        console.error(
          "Account loading error:",
          error
        );

        if (
          mounted
        ) {
          setError(
            error?.message ||
              "Unable to load your account."
          );
        }

        if (
          error?.message?.toLowerCase()
            .includes("session")
        ) {
          await supabase.auth.signOut();

          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [navigate]);


  // ===================================================
  // EDIT PROFILE
  // ===================================================

  const handleEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setError("");
    setIsEditing(true);
  };


  // ===================================================
  // CANCEL EDIT
  // ===================================================

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setError("");
    setIsEditing(false);
  };


  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSaveProfile = async () => {
    const name =
      editName.trim();

    const phone =
      editPhone.trim();

    if (!name) {
      setError(
        "Please enter your name."
      );
      return;
    }

    if (!phone) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token =
        await getAccessToken();

      const response =
        await fetch(
          `${API_URL}/api/profile`,
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              full_name: name,
              phone,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to update profile."
        );
      }

      const updatedProfile =
        result?.profile ||
        result?.data ||
        result;

      setUser({
        name:
          updatedProfile?.full_name ||
          name,

        email:
          updatedProfile?.email ||
          user.email,

        phone:
          updatedProfile?.phone ||
          phone,
      });

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError("");

      const {
        error: logoutError,
      } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      // Remove old temporary frontend login data
      localStorage.removeItem(
        "customerLoggedIn"
      );

      localStorage.removeItem(
        "beePureUser"
      );

      navigate("/", {
        replace: true,
      });

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setError(
        error?.message ||
          "Unable to logout. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <main className="account-page">
        <div className="account-container">

          <div
            className="account-loading"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Loader2
              size={22}
              className="account-spinner"
            />

            <span>
              Loading your account...
            </span>
          </div>

        </div>
      </main>
    );
  }


  // ===================================================
  // PAGE
  // ===================================================

  return (
    <main className="account-page">

      <div className="account-container">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="account-header">

          <div className="account-header-icon">
            <User size={28} />
          </div>

          <div>

            <p className="account-eyebrow">
              BEE PURE ACCOUNT
            </p>

            <h1>
              My Account
            </h1>

            <p>
              Manage your profile, orders and saved
              information.
            </p>

          </div>

        </div>


        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div
            className="account-error"
            role="alert"
          >
            <AlertCircle size={18} />

            <span>
              {error}
            </span>
          </div>
        )}


        {/* =========================================
            ACCOUNT LAYOUT
        ========================================= */}

        <div className="account-layout">

          {/* =========================================
              PROFILE CARD
          ========================================= */}

          <section className="account-profile-card">

            <div className="account-profile-top">

              <div className="account-avatar">
                <User size={30} />
              </div>

              <div className="account-profile-name">

                <h2>
                  {user.name ||
                    "Bee Pure Customer"}
                </h2>

                <span>
                  Bee Pure Customer
                </span>

              </div>


              {!isEditing ? (

                <button
                  type="button"
                  className="account-edit-button"
                  aria-label="Edit profile"
                  onClick={handleEdit}
                >
                  <Edit3 size={16} />

                  Edit
                </button>

              ) : (

                <div className="account-edit-actions">

                  <button
                    type="button"
                    className="account-edit-button"
                    onClick={
                      handleSaveProfile
                    }
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={15}
                          className="account-spinner"
                        />

                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>


                  <button
                    type="button"
                    className="account-edit-button"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

              )}

            </div>


            {/* =====================================
                PROFILE DETAILS
            ====================================== */}

            {isEditing ? (

              <div className="account-profile-details">

                {/* NAME */}

                <div className="account-detail">

                  <div className="account-detail-icon">
                    <User size={17} />
                  </div>

                  <div>

                    <span>
                      Name
                    </span>

                    <input
                      type="text"
                      value={editName}
                      onChange={(event) =>
                        setEditName(
                          event.target.value
                        )
                      }
                      maxLength={100}
                      disabled={saving}
                    />

                  </div>

                </div>


                {/* PHONE */}

                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Phone size={17} />
                  </div>

                  <div>

                    <span>
                      Phone
                    </span>

                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(event) =>
                        setEditPhone(
                          event.target.value
                        )
                      }
                      maxLength={20}
                      disabled={saving}
                    />

                  </div>

                </div>


                {/* EMAIL */}

                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Mail size={17} />
                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {user.email || "—"}
                    </strong>

                  </div>

                </div>

              </div>

            ) : (

              <div className="account-profile-details">

                {/* EMAIL */}

                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Mail size={17} />
                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {user.email || "—"}
                    </strong>

                  </div>

                </div>


                {/* PHONE */}

                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Phone size={17} />
                  </div>

                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      {user.phone || "—"}
                    </strong>

                  </div>

                </div>

              </div>

            )}

          </section>


          {/* =========================================
              ACCOUNT MENU
          ========================================= */}

          <section className="account-menu">

            <h2>
              Account
            </h2>


            {/* ORDERS */}

            <Link
              to="/orders"
              className="account-menu-item"
            >

              <div className="account-menu-icon">
                <Package size={20} />
              </div>

              <div className="account-menu-content">

                <strong>
                  My Orders
                </strong>

                <span>
                  {orderCount > 0
                    ? `${orderCount} order${
                        orderCount === 1
                          ? ""
                          : "s"
                      } · View your orders and track deliveries`
                    : "View your orders and track deliveries"}
                </span>

              </div>

              <ChevronRight
                size={18}
                className="account-menu-arrow"
              />

            </Link>


            {/* ADDRESSES */}

            <Link
              to="/addresses"
              className="account-menu-item"
            >

              <div className="account-menu-icon">
                <MapPin size={20} />
              </div>

              <div className="account-menu-content">

                <strong>
                  Saved Addresses
                </strong>

                <span>
                  {addressCount > 0
                    ? `${addressCount} saved address${
                        addressCount === 1
                          ? ""
                          : "es"
                      } · Manage your delivery addresses`
                    : "Manage your delivery addresses"}
                </span>

              </div>

              <ChevronRight
                size={18}
                className="account-menu-arrow"
              />

            </Link>


            {/* FAVOURITES */}

            <Link
              to="/favorites"
              className="account-menu-item"
            >

              <div className="account-menu-icon">
                <Heart size={20} />
              </div>

              <div className="account-menu-content">

                <strong>
                  My Favourites
                </strong>

                <span>
                  View products you've saved
                </span>

              </div>

              <ChevronRight
                size={18}
                className="account-menu-arrow"
              />

            </Link>

          </section>


          {/* =========================================
              LOGOUT
          ========================================= */}

          <section className="account-logout-section">

            <button
              type="button"
              className="account-logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >

              {loggingOut ? (
                <Loader2
                  size={18}
                  className="account-spinner"
                />
              ) : (
                <LogOut size={18} />
              )}

              {loggingOut
                ? "Logging out..."
                : "Logout"}

            </button>

          </section>

        </div>


        {/* =========================================
            ACCOUNT NOTE
        ========================================= */}

        <div className="account-security-note">

          <strong>
            Your information is safe with Bee Pure.
          </strong>

          <span>
            Account and order information will be
            securely connected to your account.
          </span>

        </div>

      </div>

    </main>
  );
}

export default Account;