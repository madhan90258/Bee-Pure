import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Mail,
  MailOpen,
  Trash2,
  X,
  Phone,
  Calendar,
  User,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import "../styles/SellerMessages.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SellerMessages = () => {
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedMessage, setSelectedMessage] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Get authenticated session
  |--------------------------------------------------------------------------
  */

  const getSession = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.access_token) {
      throw new Error("Authentication required");
    }

    return session;
  };

  /*
  |--------------------------------------------------------------------------
  | Load messages
  |--------------------------------------------------------------------------
  */

  const loadMessages = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const session = await getSession();

      const response = await fetch(
        `${API_URL}/api/seller/messages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load messages"
        );
      }

      setMessages(data.messages || []);
    } catch (err) {
      console.error("Load messages error:", err);

      setError(
        err.message || "Failed to load messages"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadMessages();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Clear notifications
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  /*
  |--------------------------------------------------------------------------
  | Update message status
  |--------------------------------------------------------------------------
  */

  const updateMessageStatus = async (messageId, status) => {
    try {
      setError("");

      const session = await getSession();

      const response = await fetch(
        `${API_URL}/api/seller/messages/${messageId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update message"
        );
      }

      const updatedMessage = data.message;

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message.id === messageId
            ? updatedMessage
            : message
        )
      );

      setSelectedMessage((current) => {
        if (!current || current.id !== messageId) {
          return current;
        }

        return updatedMessage;
      });

      setSuccess("Message status updated");
    } catch (err) {
      console.error("Update message status error:", err);

      setError(
        err.message || "Failed to update message status"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Mark as read
  |--------------------------------------------------------------------------
  */

  const markAsRead = async (message) => {
    if (!message || message.status !== "new") {
      return;
    }

    await updateMessageStatus(message.id, "read");
  };

  /*
  |--------------------------------------------------------------------------
  | Mark as unread
  |--------------------------------------------------------------------------
  */

  const markAsUnread = async (message) => {
    if (!message) {
      return;
    }

    await updateMessageStatus(message.id, "new");
  };

  /*
  |--------------------------------------------------------------------------
  | Open message
  |--------------------------------------------------------------------------
  */

  const openMessage = async (message) => {
    setSelectedMessage(message);

    if (message.status === "new") {
      await markAsRead(message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close message modal
  |--------------------------------------------------------------------------
  */

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Delete message
  |--------------------------------------------------------------------------
  */

  const deleteMessage = async (messageId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError("");

      const session = await getSession();

      const response = await fetch(
        `${API_URL}/api/seller/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete message"
        );
      }

      setMessages((previousMessages) =>
        previousMessages.filter(
          (message) => message.id !== messageId
        )
      );

      setSelectedMessage((current) => {
        if (current?.id === messageId) {
          return null;
        }

        return current;
      });

      setSuccess("Message deleted successfully");
    } catch (err) {
      console.error("Delete message error:", err);

      setError(
        err.message || "Failed to delete message"
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search + filter
  |--------------------------------------------------------------------------
  */

  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return messages.filter((message) => {
      /*
      |--------------------------------------------------------------------------
      | Filter
      |--------------------------------------------------------------------------
      */

      if (filter === "unread" && message.status !== "new") {
        return false;
      }

      if (filter === "read" && message.status === "new") {
        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Search
      |--------------------------------------------------------------------------
      */

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        message.name,
        message.email,
        message.phone,
        message.subject,
        message.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [messages, searchTerm, filter]);

  /*
  |--------------------------------------------------------------------------
  | Counts
  |--------------------------------------------------------------------------
  */

  const totalMessages = messages.length;

  const unreadMessages = messages.filter(
    (message) => message.status === "new"
  ).length;

  const readMessages = totalMessages - unreadMessages;

  /*
  |--------------------------------------------------------------------------
  | Date formatter
  |--------------------------------------------------------------------------
  */

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Status label
  |--------------------------------------------------------------------------
  */

  const getStatusLabel = (status) => {
    switch (status) {
      case "new":
        return "Unread";

      case "read":
        return "Read";

      case "replied":
        return "Replied";

      case "closed":
        return "Closed";

      default:
        return status || "Unknown";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Status class
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (status) => {
    switch (status) {
      case "new":
        return "unread";

      case "read":
        return "read";

      case "replied":
        return "replied";

      case "closed":
        return "closed";

      default:
        return "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="seller-messages-page">
        <div className="seller-messages-loading">
          <RefreshCw
            size={28}
            className="seller-messages-spinner"
          />

          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="seller-messages-page">
      <div className="seller-messages-container">
        {/* Header */}
        <div className="seller-messages-header">
          <div>
            <h1>Messages</h1>

            <p>
              Manage messages received from your
              customers.
            </p>
          </div>

          <button
            type="button"
            className="seller-messages-refresh-btn"
            onClick={() => loadMessages(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "seller-messages-spinner"
                  : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="seller-messages-alert seller-messages-error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="seller-messages-alert seller-messages-success">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="seller-messages-stats">
          <div className="seller-message-stat-card">
            <div className="seller-message-stat-icon">
              <MessageSquare size={20} />
            </div>

            <div>
              <span>Total Messages</span>
              <strong>{totalMessages}</strong>
            </div>
          </div>

          <div className="seller-message-stat-card">
            <div className="seller-message-stat-icon">
              <Mail size={20} />
            </div>

            <div>
              <span>Unread</span>
              <strong>{unreadMessages}</strong>
            </div>
          </div>

          <div className="seller-message-stat-card">
            <div className="seller-message-stat-icon">
              <MailOpen size={20} />
            </div>

            <div>
              <span>Read</span>
              <strong>{readMessages}</strong>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="seller-messages-controls">
          <div className="seller-messages-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="seller-messages-filters">
            <button
              type="button"
              className={
                filter === "all" ? "active" : ""
              }
              onClick={() => setFilter("all")}
            >
              All
              <span>{totalMessages}</span>
            </button>

            <button
              type="button"
              className={
                filter === "unread" ? "active" : ""
              }
              onClick={() => setFilter("unread")}
            >
              Unread
              <span>{unreadMessages}</span>
            </button>

            <button
              type="button"
              className={
                filter === "read" ? "active" : ""
              }
              onClick={() => setFilter("read")}
            >
              Read
              <span>{readMessages}</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="seller-messages-list">
          {filteredMessages.length === 0 ? (
            <div className="seller-messages-empty">
              <MessageSquare size={42} />

              <h3>
                {messages.length === 0
                  ? "No messages yet"
                  : "No messages found"}
              </h3>

              <p>
                {messages.length === 0
                  ? "Customer messages will appear here."
                  : "Try changing your search or filter."}
              </p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`seller-message-card ${
                  message.status === "new"
                    ? "seller-message-unread"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="seller-message-main"
                  onClick={() => openMessage(message)}
                >
                  <div className="seller-message-avatar">
                    {message.name
                      ? message.name
                          .charAt(0)
                          .toUpperCase()
                      : "?"}
                  </div>

                  <div className="seller-message-content">
                    <div className="seller-message-top">
                      <div>
                        <h3>
                          {message.name || "Unknown"}
                        </h3>

                        <span>
                          {message.email || "-"}
                        </span>
                      </div>

                      <time>
                        {formatDate(
                          message.created_at
                        )}
                      </time>
                    </div>

                    <div className="seller-message-subject">
                      {message.subject ||
                        "No subject"}
                    </div>

                    <p>
                      {message.message || ""}
                    </p>

                    <div className="seller-message-bottom">
                      <span
                        className={`seller-message-status ${getStatusClass(
                          message.status
                        )}`}
                      >
                        {getStatusLabel(
                          message.status
                        )}
                      </span>

                      {message.phone && (
                        <span className="seller-message-phone">
                          <Phone size={14} />
                          {message.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="seller-message-actions">
                  {message.status === "new" ? (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={() =>
                        markAsRead(message)
                      }
                    >
                      <MailOpen size={17} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Mark as unread"
                      onClick={() =>
                        markAsUnread(message)
                      }
                    >
                      <Mail size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Delete message"
                    className="delete"
                    onClick={() =>
                      deleteMessage(message.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div
          className="seller-message-modal-overlay"
          onClick={closeMessage}
        >
          <div
            className="seller-message-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="seller-message-modal-header">
              <div>
                <h2>
                  {selectedMessage.subject ||
                    "Customer Message"}
                </h2>

                <span>
                  {formatDate(
                    selectedMessage.created_at
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={closeMessage}
                className="seller-message-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="seller-message-modal-body">
              {/* Customer */}
              <div className="seller-message-customer">
                <div className="seller-message-customer-avatar">
                  {selectedMessage.name
                    ? selectedMessage.name
                        .charAt(0)
                        .toUpperCase()
                    : "?"}
                </div>

                <div>
                  <h3>
                    {selectedMessage.name ||
                      "Unknown"}
                  </h3>

                  <p>
                    {selectedMessage.email || "-"}
                  </p>
                </div>
              </div>

              {/* Contact details */}
              <div className="seller-message-details">
                <div>
                  <User size={16} />

                  <span>
                    {selectedMessage.name ||
                      "-"}
                  </span>
                </div>

                <div>
                  <Mail size={16} />

                  <span>
                    {selectedMessage.email ||
                      "-"}
                  </span>
                </div>

                {selectedMessage.phone && (
                  <div>
                    <Phone size={16} />

                    <span>
                      {selectedMessage.phone}
                    </span>
                  </div>
                )}

                <div>
                  <Calendar size={16} />

                  <span>
                    {formatDate(
                      selectedMessage.created_at
                    )}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="seller-message-full">
                <h3>Message</h3>

                <p>
                  {selectedMessage.message ||
                    "No message content."}
                </p>
              </div>

              {/* Status */}
              <div className="seller-message-modal-status">
                <span>Status</span>

                <span
                  className={`seller-message-status ${getStatusClass(
                    selectedMessage.status
                  )}`}
                >
                  {getStatusLabel(
                    selectedMessage.status
                  )}
                </span>
              </div>

              {/* Actions */}
              <div className="seller-message-modal-actions">
                {selectedMessage.status === "new" ? (
                  <button
                    type="button"
                    onClick={() =>
                      markAsRead(selectedMessage)
                    }
                  >
                    <MailOpen size={17} />
                    Mark as read
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      markAsUnread(
                        selectedMessage
                      )
                    }
                  >
                    <Mail size={17} />
                    Mark as unread
                  </button>
                )}

                <button
                  type="button"
                  className="delete"
                  onClick={() =>
                    deleteMessage(
                      selectedMessage.id
                    )
                  }
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerMessages;