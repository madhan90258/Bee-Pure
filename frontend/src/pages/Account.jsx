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
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import "../styles/Account.css";

function Account() {
  const navigate = useNavigate();

  // =========================================
  // USER DATA
  // =========================================

  const [user, setUser] = useState({
    name: "Bee Pure Customer",
    email: "customer@example.com",
    phone: "+91 98765 43210",
  });

  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(
    user.name
  );

  const [editPhone, setEditPhone] = useState(
    user.phone
  );

  // =========================================
  // EDIT PROFILE
  // =========================================

  const handleEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      return;
    }

    if (!editPhone.trim()) {
      return;
    }

    setUser((current) => ({
      ...current,
      name: editName.trim(),
      phone: editPhone.trim(),
    }));

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setIsEditing(false);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    // Remove temporary customer login state
    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("beePureUser");

    // Redirect to Home
    navigate("/", {
      replace: true,
    });

    // Make sure page starts at the top
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

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
                  {user.name}
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
                    onClick={handleSaveProfile}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="account-edit-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>

                </div>

              )}

            </div>


            {/* =====================================
                EDIT FORM
            ====================================== */}

            {isEditing ? (

              <div className="account-profile-details">

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
                    />

                  </div>

                </div>


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
                    />

                  </div>

                </div>


                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Mail size={17} />
                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {user.email}
                    </strong>

                  </div>

                </div>

              </div>

            ) : (

              /* =====================================
                 USER DETAILS
              ====================================== */

              <div className="account-profile-details">

                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Mail size={17} />
                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {user.email}
                    </strong>

                  </div>

                </div>


                <div className="account-detail">

                  <div className="account-detail-icon">
                    <Phone size={17} />
                  </div>

                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      {user.phone}
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
                  View your orders and track deliveries
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
                  Manage your delivery addresses
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
            >

              <LogOut size={18} />

              Logout

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