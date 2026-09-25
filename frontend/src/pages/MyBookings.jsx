import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  XCircle,
  CreditCard,
} from "lucide-react";
import api from "../api/axios";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("serenity_token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/my");

      setBookings(response.data?.bookings || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancelLoading(bookingId);

      await api.put(`/bookings/${bookingId}/cancel`);

      await fetchBookings();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to cancel booking."
      );
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "confirmed") return "status-confirmed";
    if (status === "cancelled") return "status-cancelled";
    if (status === "completed") return "status-completed";

    return "status-pending";
  };

  const getPaymentClass = (status) => {
    if (status === "paid") return "payment-paid";
    if (status === "failed") return "payment-failed";

    return "payment-pending";
  };

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">

        <button
          className="booking-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="my-bookings-heading">
          <div>
            <span>MY TRAVEL</span>
            <h1>My Bookings</h1>
            <p>
              View and manage all your Serenity Plan bookings.
            </p>
          </div>

          <button
            className="browse-trips-btn"
            onClick={() => navigate("/")}
          >
            Browse Trips
          </button>
        </div>

        {error && (
          <div className="booking-form-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="booking-list-loading">
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-bookings-icon">
              <CalendarDays size={36} />
            </div>

            <h2>No Bookings Yet</h2>

            <p>
              You haven't booked any trips yet.
              Start exploring and plan your next journey.
            </p>

            <button
              onClick={() => navigate("/")}
            >
              Explore Trips
            </button>
          </div>
        ) : (
          <div className="booking-list">

            {bookings.map((booking) => (
              <div
                className="my-booking-card"
                key={booking.id}
              >
                <div className="my-booking-main">

                  <div className="my-booking-icon">
                    <MapPin size={23} />
                  </div>

                  <div className="my-booking-info">
                    <div className="booking-title-row">
                      <h2>
                        {booking.trip_title ||
                          `Trip #${booking.trip_id}`}
                      </h2>

                      <span
                        className={`booking-status ${getStatusClass(
                          booking.booking_status
                        )}`}
                      >
                        {booking.booking_status}
                      </span>
                    </div>

                    <p className="booking-reference">
                      Reference:{" "}
                      <strong>
                        {booking.booking_reference}
                      </strong>
                    </p>

                    <div className="my-booking-meta">
                      <span>
                        <Users size={15} />
                        {booking.travelers} traveler
                        {booking.travelers > 1 ? "s" : ""}
                      </span>

                      <span>
                        <CalendarDays size={15} />
                        {booking.booking_date
                          ? new Date(
                              booking.booking_date
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </span>

                      <span
                        className={`payment-status ${getPaymentClass(
                          booking.payment_status
                        )}`}
                      >
                        <CreditCard size={15} />
                        Payment:{" "}
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="my-booking-price">
                    <span>Total</span>

                    <strong>
                      ₹
                      {Number(
                        booking.total_amount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {booking.booking_status !== "cancelled" &&
                  booking.booking_status !== "completed" && (
                    <div className="my-booking-actions">
                      <button
                        className="cancel-booking-btn"
                        disabled={cancelLoading === booking.id}
                        onClick={() =>
                          handleCancel(booking.id)
                        }
                      >
                        <XCircle size={17} />

                        {cancelLoading === booking.id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>

                      {booking.payment_status === "pending" && (
                        <button
                          className="pay-booking-btn"
                          onClick={() =>
                            navigate(
                              `/payment/${booking.id}`
                            )
                          }
                        >
                          <CreditCard size={17} />
                          Make Payment
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}