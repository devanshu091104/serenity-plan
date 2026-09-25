
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  RefreshCw,
  CalendarDays,
  Users,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  X,
} from "lucide-react";

import api from "../api/axios";

const AdminBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/bookings"
      );

      setBookings(
        response.data?.bookings || []
      );
    } catch (err) {
      console.error(
        "Bookings loading error:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem(
          "serenity_token"
        );
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(
      "serenity_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    loadBookings();
  }, [navigate]);

  const filteredBookings = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return bookings;

    return bookings.filter((booking) => {
      return (
        String(
          booking.booking_reference || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          booking.user_name || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          booking.user_email || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          booking.trip_title || ""
        )
          .toLowerCase()
          .includes(query)
      );
    });
  }, [bookings, search]);

  const showMessage = (
    message,
    type = "success"
  ) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }

    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);
  };

  const updateBookingStatus = async (
    booking,
    status
  ) => {
    if (
      booking.booking_status === status
    ) {
      return;
    }

    try {
      setActionId(booking.id);

      await api.put(
        `/admin/bookings/${booking.id}/status`,
        {
          booking_status: status,
        }
      );

      showMessage(
        "Booking status updated successfully."
      );

      await loadBookings();

      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null);
      }
    } catch (err) {
      console.error(
        "Booking status update error:",
        err
      );

      showMessage(
        err.response?.data?.message ||
          "Unable to update booking status.",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const updatePaymentStatus = async (
    booking,
    status
  ) => {
    if (
      booking.payment_status === status
    ) {
      return;
    }

    try {
      setActionId(booking.id);

      await api.put(
        `/admin/bookings/${booking.id}/payment-status`,
        {
          payment_status: status,
        }
      );

      showMessage(
        "Payment status updated successfully."
      );

      await loadBookings();

      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null);
      }
    } catch (err) {
      console.error(
        "Payment status update error:",
        err
      );

      showMessage(
        err.response?.data?.message ||
          "Unable to update payment status.",
        "error"
      );
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN"
    );
  };

  const getBookingStatusIcon = (
    status
  ) => {
    if (status === "confirmed") {
      return <CheckCircle2 size={13} />;
    }

    if (status === "cancelled") {
      return <XCircle size={13} />;
    }

    if (status === "completed") {
      return <CheckCircle2 size={13} />;
    }

    return <Clock3 size={13} />;
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw
          size={30}
          className="admin-loading-spinner"
        />
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-topbar">
        <div>
          <button
            className="admin-back-button"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <h1>Bookings Management</h1>

          <p>
            Manage customer bookings,
            booking status and payments.
          </p>
        </div>

        <button
          className="admin-refresh-small"
          onClick={loadBookings}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-form-error">
          <X size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="admin-form-success">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <section className="admin-bookings-panel">
        <div className="admin-bookings-toolbar">
          <div>
            <h2>All Bookings</h2>

            <p>
              {filteredBookings.length} of{" "}
              {bookings.length} bookings
            </p>
          </div>

          <div className="admin-users-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search booking, user or trip..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="admin-bookings-empty">
            <CalendarDays size={42} />

            <h3>
              {search
                ? "No matching bookings"
                : "No bookings found"}
            </h3>

            <p>
              {search
                ? "Try another search term."
                : "Customer bookings will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="admin-bookings-desktop">
              <div className="admin-bookings-table">
                <div className="admin-bookings-head">
                  <span>Booking</span>
                  <span>Customer</span>
                  <span>Trip</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Payment</span>
                  <span>Action</span>
                </div>

                {filteredBookings.map(
                  (booking) => (
                    <div
                      className="admin-bookings-row"
                      key={booking.id}
                    >
                      <div>
                        <strong>
                          {
                            booking.booking_reference
                          }
                        </strong>

                        <small>
                          {formatDate(
                            booking.booking_date
                          )}
                        </small>
                      </div>

                      <div className="admin-booking-customer">
                        <strong>
                          {booking.user_name ||
                            "Unknown"}
                        </strong>

                        <small>
                          {booking.user_email ||
                            "—"}
                        </small>
                      </div>

                      <div className="admin-booking-trip">
                        {booking.trip_title ||
                          "Unknown Trip"}
                      </div>

                      <div className="admin-booking-amount">
                        <IndianRupee
                          size={12}
                        />
                        {formatAmount(
                          booking.total_amount
                        )}

                        <small>
                          {booking.travelers}{" "}
                          traveler
                          {Number(
                            booking.travelers
                          ) !== 1
                            ? "s"
                            : ""}
                        </small>
                      </div>

                      <div>
                        <span
                          className={`admin-booking-status ${booking.booking_status}`}
                        >
                          {getBookingStatusIcon(
                            booking.booking_status
                          )}

                          {booking.booking_status}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`admin-payment-status ${booking.payment_status}`}
                        >
                          {booking.payment_status}
                        </span>
                      </div>

                      <div>
                        <button
                          className="admin-view-booking-button"
                          onClick={() =>
                            setSelectedBooking(
                              booking
                            )
                          }
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="admin-bookings-mobile">
              {filteredBookings.map(
                (booking) => (
                  <article
                    className="admin-booking-card"
                    key={booking.id}
                  >
                    <div className="admin-booking-card-header">
                      <div>
                        <strong>
                          {
                            booking.booking_reference
                          }
                        </strong>

                        <small>
                          {formatDate(
                            booking.booking_date
                          )}
                        </small>
                      </div>

                      <span
                        className={`admin-booking-status ${booking.booking_status}`}
                      >
                        {getBookingStatusIcon(
                          booking.booking_status
                        )}

                        {booking.booking_status}
                      </span>
                    </div>

                    <div className="admin-booking-card-trip">
                      <h3>
                        {booking.trip_title ||
                          "Unknown Trip"}
                      </h3>

                      <p>
                        <Users size={13} />
                        {booking.travelers}{" "}
                        traveler
                        {Number(
                          booking.travelers
                        ) !== 1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="admin-booking-card-details">
                      <div>
                        <span>Customer</span>
                        <strong>
                          {booking.user_name ||
                            "Unknown"}
                        </strong>
                      </div>

                      <div>
                        <span>Amount</span>
                        <strong>
                          ₹
                          {formatAmount(
                            booking.total_amount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Payment</span>
                        <strong
                          className={`admin-payment-status ${booking.payment_status}`}
                        >
                          {
                            booking.payment_status
                          }
                        </strong>
                      </div>
                    </div>

                    <button
                      className="admin-view-booking-button admin-mobile-view-button"
                      onClick={() =>
                        setSelectedBooking(
                          booking
                        )
                      }
                    >
                      <Eye size={15} />
                      View & Manage
                    </button>
                  </article>
                )
              )}
            </div>
          </>
        )}
      </section>

      {selectedBooking && (
        <div
          className="admin-booking-modal-overlay"
          onClick={() =>
            setSelectedBooking(null)
          }
        >
          <div
            className="admin-booking-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-booking-modal-header">
              <div>
                <span>
                  BOOKING DETAILS
                </span>

                <h2>
                  {
                    selectedBooking.booking_reference
                  }
                </h2>
              </div>

              <button
                className="admin-icon-button"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-booking-modal-body">
              <div className="admin-booking-detail-grid">
                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedBooking.user_name ||
                      "Unknown"}
                  </strong>
                  <small>
                    {selectedBooking.user_email ||
                      "—"}
                  </small>
                </div>

                <div>
                  <span>Trip</span>
                  <strong>
                    {selectedBooking.trip_title ||
                      "Unknown Trip"}
                  </strong>
                </div>

                <div>
                  <span>Travelers</span>
                  <strong>
                    {selectedBooking.travelers}
                  </strong>
                </div>

                <div>
                  <span>Total Amount</span>
                  <strong>
                    ₹
                    {formatAmount(
                      selectedBooking.total_amount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Booking Date</span>
                  <strong>
                    {formatDate(
                      selectedBooking.booking_date
                    )}
                  </strong>
                </div>

                <div>
                  <span>Payment Gateway</span>
                  <strong>
                    Nitya Payment
                  </strong>
                </div>
              </div>

              <div className="admin-booking-management-section">
                <h3>Booking Status</h3>

                <div className="admin-status-buttons">
                  {[
                    "pending",
                    "confirmed",
                    "cancelled",
                    "completed",
                  ].map((status) => (
                    <button
                      key={status}
                      className={
                        selectedBooking.booking_status ===
                        status
                          ? "selected"
                          : ""
                      }
                      disabled={
                        actionId ===
                        selectedBooking.id
                      }
                      onClick={() =>
                        updateBookingStatus(
                          selectedBooking,
                          status
                        )
                      }
                    >
                      {getBookingStatusIcon(
                        status
                      )}

                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-booking-management-section">
                <h3>Payment Status</h3>

                <div className="admin-status-buttons payment-buttons">
                  {[
                    "pending",
                    "paid",
                    "failed",
                    "refunded",
                  ].map((status) => (
                    <button
                      key={status}
                      className={
                        selectedBooking.payment_status ===
                        status
                          ? "selected"
                          : ""
                      }
                      disabled={
                        actionId ===
                        selectedBooking.id
                      }
                      onClick={() =>
                        updatePaymentStatus(
                          selectedBooking,
                          status
                        )
                      }
                    >
                      <CreditCard
                        size={13}
                      />
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-booking-modal-footer">
              <button
                className="admin-secondary-button"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;