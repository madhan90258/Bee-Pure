import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  X,
  Phone,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/Addresses.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
};

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
};

const Addresses = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [defaultId, setDefaultId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load addresses"
        );
      }

      const addressList =
        result.addresses ||
        result.data?.addresses ||
        result.data ||
        [];

      setAddresses(
        Array.isArray(addressList) ? addressList : []
      );
    } catch (err) {
      console.error("Load addresses error:", err);
      setError(
        err.message || "Unable to load your saved addresses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingAddress(address);

    setForm({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      latitude: address.latitude ?? "",
      longitude: address.longitude ?? "",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingAddress(null);
    setForm(emptyForm);
    setFormError("");
  };

  const validateForm = () => {
    if (!form.full_name.trim()) {
      return "Please enter the full name.";
    }

    if (!form.phone.trim()) {
      return "Please enter the phone number.";
    }

    if (!/^[0-9+\-\s()]{10,15}$/.test(form.phone.trim())) {
      return "Please enter a valid phone number.";
    }

    if (!form.address_line_1.trim()) {
      return "Please enter the address.";
    }

    if (!form.city.trim()) {
      return "Please enter the city.";
    }

    if (!form.state.trim()) {
      return "Please enter the state.";
    }

    if (!form.pincode.trim()) {
      return "Please enter the pincode.";
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return "Please enter a valid 6-digit pincode.";
    }

    return "";
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line_1: form.address_line_1.trim(),
        address_line_2: form.address_line_2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        latitude:
          form.latitude !== ""
            ? Number(form.latitude)
            : null,
        longitude:
          form.longitude !== ""
            ? Number(form.longitude)
            : null,
      };

      const url = editingAddress
        ? `${API_URL}/api/addresses/${editingAddress.id}`
        : `${API_URL}/api/addresses`;

      const method = editingAddress ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save address"
        );
      }

      closeForm();

      await loadAddresses();
    } catch (err) {
      console.error("Save address error:", err);

      setFormError(
        err.message || "Unable to save this address"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setDefaultId(addressId);
      setError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/addresses/${addressId}/default`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to set default address"
        );
      }

      await loadAddresses();
    } catch (err) {
      console.error("Set default address error:", err);

      setError(
        err.message || "Unable to set default address"
      );
    } finally {
      setDefaultId(null);
    }
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(addressId);
      setError("");

      const token = await getAccessToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete address"
        );
      }

      await loadAddresses();
    } catch (err) {
      console.error("Delete address error:", err);

      setError(
        err.message || "Unable to delete this address"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="addresses-page">
      <div className="addresses-container">

        {/* Header */}

        <div className="addresses-header">
          <button
            type="button"
            className="addresses-back-button"
            onClick={() => navigate("/account")}
          >
            <ArrowLeft size={18} />
            Back to Account
          </button>

          <div className="addresses-title-row">
            <div className="addresses-title">
              <MapPin size={30} />

              <div>
                <h1>Saved Addresses</h1>
                <p>
                  Manage your delivery addresses
                </p>
              </div>
            </div>

            {!showForm && (
              <button
                type="button"
                className="add-address-button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add Address
              </button>
            )}
          </div>
        </div>

        {/* Global error */}

        {error && (
          <div className="addresses-error">
            <AlertCircle size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Add/Edit form */}

        {showForm && (
          <div className="address-form-card">
            <div className="address-form-header">
              <div>
                <h2>
                  {editingAddress
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>

                <p>
                  Enter your delivery details below.
                </p>
              </div>

              <button
                type="button"
                className="close-address-form"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="address-form-error">
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form
              className="address-form"
              onSubmit={handleSaveAddress}
            >
              <div className="address-form-grid">

                <div className="address-field">
                  <label htmlFor="full_name">
                    Full Name *
                  </label>

                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    disabled={saving}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="phone">
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    disabled={saving}
                  />
                </div>

                <div className="address-field address-field-full">
                  <label htmlFor="address_line_1">
                    Address Line 1 *
                  </label>

                  <input
                    id="address_line_1"
                    name="address_line_1"
                    type="text"
                    value={form.address_line_1}
                    onChange={handleInputChange}
                    placeholder="House / Flat / Street"
                    disabled={saving}
                  />
                </div>

                <div className="address-field address-field-full">
                  <label htmlFor="address_line_2">
                    Address Line 2
                  </label>

                  <input
                    id="address_line_2"
                    name="address_line_2"
                    type="text"
                    value={form.address_line_2}
                    onChange={handleInputChange}
                    placeholder="Apartment, landmark, area (optional)"
                    disabled={saving}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="city">
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    disabled={saving}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="state">
                    State *
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    disabled={saving}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="pincode">
                    Pincode *
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    disabled={saving}
                  />
                </div>

              </div>

              <div className="address-form-actions">
                <button
                  type="button"
                  className="address-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="address-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="addresses-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {editingAddress
                        ? "Update Address"
                        : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="addresses-state">
            <Loader2
              size={36}
              className="addresses-spinner"
            />

            <p>Loading your addresses...</p>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !showForm &&
          addresses.length === 0 && (
            <div className="addresses-state addresses-empty">
              <MapPin size={55} />

              <h2>No saved addresses</h2>

              <p>
                Add an address to make checkout faster
                and easier.
              </p>

              <button
                type="button"
                className="empty-add-address-button"
                onClick={openAddForm}
              >
                <Plus size={17} />
                Add Your First Address
              </button>
            </div>
          )}

        {/* Address list */}

        {!loading &&
          addresses.length > 0 && (
            <div className="addresses-list">

              {addresses.map((address) => (
                <div
                  className={`address-card ${
                    address.is_default
                      ? "address-card-default"
                      : ""
                  }`}
                  key={address.id}
                >
                  <div className="address-card-top">
                    <div className="address-card-title">
                      <MapPin size={20} />

                      <div>
                        <h2>
                          {address.full_name}
                        </h2>

                        {address.is_default && (
                          <span className="default-badge">
                            <Check size={13} />
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="address-card-actions">

                      <button
                        type="button"
                        className="address-edit-button"
                        onClick={() =>
                          openEditForm(address)
                        }
                        title="Edit address"
                      >
                        <Pencil size={17} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="address-delete-button"
                        onClick={() =>
                          handleDelete(address.id)
                        }
                        disabled={
                          deletingId === address.id
                        }
                        title="Delete address"
                      >
                        {deletingId === address.id ? (
                          <Loader2
                            size={17}
                            className="addresses-spinner"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}

                        <span>Delete</span>
                      </button>

                    </div>
                  </div>

                  <div className="address-card-content">

                    <p className="address-phone">
                      <Phone size={15} />
                      {address.phone}
                    </p>

                    <p>
                      {address.address_line_1}
                    </p>

                    {address.address_line_2 && (
                      <p>
                        {address.address_line_2}
                      </p>
                    )}

                    <p>
                      {address.city},{" "}
                      {address.state} -{" "}
                      {address.pincode}
                    </p>

                  </div>

                  {!address.is_default && (
                    <button
                      type="button"
                      className="set-default-button"
                      onClick={() =>
                        handleSetDefault(address.id)
                      }
                      disabled={
                        defaultId === address.id
                      }
                    >
                      {defaultId === address.id ? (
                        <>
                          <Loader2
                            size={15}
                            className="addresses-spinner"
                          />
                          Setting...
                        </>
                      ) : (
                        <>
                          <Check size={15} />
                          Set as Default
                        </>
                      )}
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}

        {/* Checkout shortcut */}

        {!loading && addresses.length > 0 && (
          <div className="addresses-footer-note">
            <Link to="/checkout">
              Continue to Checkout
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Addresses;