import { useMemo, useState } from "react";
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
} from "lucide-react";

import "../styles/SellerMessages.css";

function SellerMessages() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("beePureMessages");

    if (savedMessages) {
      return JSON.parse(savedMessages);
    }

    return [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);

  // =========================================
  // SAVE MESSAGES
  // =========================================

  const saveMessages = (updatedMessages) => {
    setMessages(updatedMessages);

    localStorage.setItem(
      "beePureMessages",
      JSON.stringify(updatedMessages)
    );
  };

  // =========================================
  // FILTER + SEARCH
  // =========================================

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !query ||
        message.name?.toLowerCase().includes(query) ||
        message.email?.toLowerCase().includes(query) ||
        message.phone?.toLowerCase().includes(query) ||
        message.subject?.toLowerCase().includes(query) ||
        message.message?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !message.read) ||
        (filter === "read" && message.read);

      return matchesSearch && matchesFilter;
    });
  }, [messages, searchQuery, filter]);

  // =========================================
  // MARK READ / UNREAD
  // =========================================

  const toggleRead = (id) => {
    const updatedMessages = messages.map((message) =>
      message.id === id
        ? {
            ...message,
            read: !message.read,
          }
        : message
    );

    saveMessages(updatedMessages);

    if (selectedMessage?.id === id) {
      setSelectedMessage({
        ...selectedMessage,
        read: !selectedMessage.read,
      });
    }
  };

  // =========================================
  // OPEN MESSAGE
  // =========================================

  const openMessage = (message) => {
    const updatedMessages = messages.map((item) =>
      item.id === message.id
        ? {
            ...item,
            read: true,
          }
        : item
    );

    saveMessages(updatedMessages);

    setSelectedMessage({
      ...message,
      read: true,
    });
  };

  // =========================================
  // DELETE MESSAGE
  // =========================================

  const deleteMessage = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
      return;
    }

    const updatedMessages = messages.filter(
      (message) => message.id !== id
    );

    saveMessages(updatedMessages);

    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================
  // COUNTS
  // =========================================

  const unreadCount = messages.filter(
    (message) => !message.read
  ).length;

  const readCount = messages.filter(
    (message) => message.read
  ).length;

  return (
    <main className="seller-messages-page">
      <div className="seller-messages-container">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="seller-messages-header">

          <div>
            <span className="seller-section-label">
              SELLER PANEL
            </span>

            <h1>Messages</h1>

            <p>
              View and manage messages received from
              Bee Pure customers.
            </p>
          </div>

          <div className="seller-message-summary">

            <div className="message-summary-card">
              <Mail size={19} />

              <div>
                <strong>{messages.length}</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="message-summary-card unread">
              <MailOpen size={19} />

              <div>
                <strong>{unreadCount}</strong>
                <span>Unread</span>
              </div>
            </div>

            <div className="message-summary-card">
              <MailOpen size={19} />

              <div>
                <strong>{readCount}</strong>
                <span>Read</span>
              </div>
            </div>

          </div>

        </div>


        {/* =====================================
            TOOLBAR
        ===================================== */}

        <div className="seller-messages-toolbar">

          <div className="seller-message-search">

            <Search size={18} />

            <input
              type="search"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

          </div>


          <div className="seller-message-filters">

            <button
              type="button"
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "unread"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("unread")}
            >
              Unread
            </button>

            <button
              type="button"
              className={
                filter === "read"
                  ? "active"
                  : ""
              }
              onClick={() => setFilter("read")}
            >
              Read
            </button>

          </div>

        </div>


        {/* =====================================
            MESSAGE LIST
        ===================================== */}

        <section className="seller-messages-list">

          {filteredMessages.length === 0 ? (

            <div className="seller-messages-empty">

              <div className="seller-empty-icon">
                <MessageSquare size={28} />
              </div>

              <h2>
                {messages.length === 0
                  ? "No messages yet"
                  : "No messages found"}
              </h2>

              <p>
                {messages.length === 0
                  ? "Messages submitted through the Contact page will appear here."
                  : "Try changing your search or filter."}
              </p>

            </div>

          ) : (

            filteredMessages.map((message) => (

              <article
                key={message.id}
                className={`seller-message-card ${
                  message.read
                    ? "read"
                    : "unread"
                }`}
                onClick={() =>
                  openMessage(message)
                }
              >

                <div className="seller-message-icon">

                  {message.read ? (
                    <MailOpen size={20} />
                  ) : (
                    <Mail size={20} />
                  )}

                </div>


                <div className="seller-message-content">

                  <div className="seller-message-top">

                    <div className="seller-message-sender">

                      <h3>
                        {message.name ||
                          "Unknown Customer"}
                      </h3>

                      {!message.read && (
                        <span className="unread-badge">
                          New
                        </span>
                      )}

                    </div>

                    <span className="seller-message-date">
                      {formatDate(message.date)}
                    </span>

                  </div>


                  <h4>
                    {message.subject ||
                      "Customer Message"}
                  </h4>

                  <p>
                    {message.message}
                  </p>


                  <div className="seller-message-contact">

                    {message.email && (
                      <span>
                        {message.email}
                      </span>
                    )}

                    {message.phone && (
                      <span>
                        {message.phone}
                      </span>
                    )}

                  </div>

                </div>


                <div
                  className="seller-message-actions"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  <button
                    type="button"
                    title={
                      message.read
                        ? "Mark as unread"
                        : "Mark as read"
                    }
                    onClick={() =>
                      toggleRead(message.id)
                    }
                  >
                    {message.read ? (
                      <Mail size={17} />
                    ) : (
                      <MailOpen size={17} />
                    )}
                  </button>


                  <button
                    type="button"
                    className="delete"
                    title="Delete message"
                    onClick={() =>
                      deleteMessage(message.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              </article>

            ))

          )}

        </section>

      </div>


      {/* =====================================
          MESSAGE MODAL
      ===================================== */}

      {selectedMessage && (

        <div
          className="seller-message-modal-overlay"
          onClick={() =>
            setSelectedMessage(null)
          }
        >

          <div
            className="seller-message-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="seller-message-modal-header">

              <div>
                <span>
                  CUSTOMER MESSAGE
                </span>

                <h2>
                  {selectedMessage.subject ||
                    "Customer Message"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                aria-label="Close message"
              >
                <X size={20} />
              </button>

            </div>


            <div className="seller-message-modal-body">

              <div className="message-detail-row">

                <User size={18} />

                <div>
                  <small>Name</small>
                  <strong>
                    {selectedMessage.name ||
                      "—"}
                  </strong>
                </div>

              </div>


              <div className="message-detail-row">

                <Mail size={18} />

                <div>
                  <small>Email</small>
                  <strong>
                    {selectedMessage.email ||
                      "—"}
                  </strong>
                </div>

              </div>


              <div className="message-detail-row">

                <Phone size={18} />

                <div>
                  <small>Phone</small>
                  <strong>
                    {selectedMessage.phone ||
                      "—"}
                  </strong>
                </div>

              </div>


              <div className="message-detail-row">

                <Calendar size={18} />

                <div>
                  <small>Date</small>
                  <strong>
                    {formatDate(
                      selectedMessage.date
                    )}
                  </strong>
                </div>

              </div>


              <div className="message-full-content">

                <span>Message</span>

                <p>
                  {selectedMessage.message ||
                    "No message content."}
                </p>

              </div>

            </div>


            <div className="seller-message-modal-footer">

              <button
                type="button"
                className="message-delete-btn"
                onClick={() =>
                  deleteMessage(
                    selectedMessage.id
                  )
                }
              >
                <Trash2 size={17} />
                Delete
              </button>

              <button
                type="button"
                className="message-close-btn"
                onClick={() =>
                  setSelectedMessage(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default SellerMessages;