import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  CheckCircle,
} from "lucide-react";
import api from "../api/axios";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [travelers, setTravelers] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const checkUserAndFetchTrip = async () => {
      const token = localStorage.getItem("serenity_token");

      // No login
      if (!token) {
        navigate("/login", {
          state: {
            redirectTo: `/booking/${id}`,
          },
          replace: true,
        });
        return;
      }

      try {
        // Verify actual logged-in user from backend
        const userResponse = await api.get("/auth/me");

        const user = userResponse.data?.user;

        // Admin cannot access customer booking page
       if (user?.role === "admin") {
       alert("Admins cannot book trips. Please use a customer account.");
        navigate(`/trips/${id}`, {
        replace: true,
      });
      return;
    }

        // Normal user -> fetch trip
        const tripResponse = await api.get(`/trips/${id}`);

        setTrip(tripResponse.data?.trip);
      } catch (error) {
        // Invalid/expired token
        if (error.response?.status === 401) {
          localStorage.removeItem("serenity_token");
          localStorage.removeItem("serenity_user");

          navigate("/login", {
            state: {
              redirectTo: `/booking/${id}`,
            },
            replace: true,
          });

          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load trip details."
        );
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetchTrip();
  }, [id, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(null);

    if (!trip) return;

    if (travelers < 1) {
      setError("At least 1 traveler is required.");
      return;
    }

    if (travelers > trip.available_slots) {
      setError(
        `Only ${trip.available_slots} slots are available.`
      );
      return;
    }

    try {
      setBookingLoading(true);

      const response = await api.post("/bookings", {
        trip_id: Number(id),
        travelers: Number(travelers),
      });

      setSuccess(response.data?.booking);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          Loading trip details...
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="booking-page">
        <div className="booking-error-card">
          <h2>Unable to load trip</h2>
          <p>{error}</p>

          <button onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="booking-page">
        <div className="booking-success-card">
          <div className="booking-success-icon">
            <CheckCircle size={42} />
          </div>

          <h1>Booking Created!</h1>

          <p>
            Your booking has been successfully created.
          </p>

          <div className="booking-reference-box">
            <span>Booking Reference</span>
            <strong>{success.booking_reference}</strong>
          </div>

          <div className="success-summary">
            <div>
              <span>Trip</span>
              <strong>{success.trip_title}</strong>
            </div>

            <div>
              <span>Travelers</span>
              <strong>{success.travelers}</strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>
                ₹
                {Number(success.total_amount).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div>
              <span>Payment Status</span>
              <strong>
                {success.payment_status || "Pending"}
              </strong>
            </div>
          </div>

          <div className="booking-success-actions">
            <button
              className="booking-primary-btn"
              onClick={() => navigate("/my-bookings")}
            >
              View My Bookings
            </button>

            <button
              className="booking-secondary-btn"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount =
    Number(trip?.price || 0) * Number(travelers);

  return (
    <div className="booking-page">
      <div className="booking-container">

        <button
          className="booking-back"
          onClick={() => navigate(`/trips/${id}`)}
        >
          <ArrowLeft size={18} />
          Back to Trip
        </button>

        <div className="booking-grid">

          <div className="booking-trip-card">
            <div className="booking-image-wrapper">
              <img
                src={
                  trip?.destination_image ||
                  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80"
                }
                alt={trip?.title}
              />
            </div>

            <div className="booking-trip-content">
              <span className="booking-category">
                {trip?.category_name || "Travel"}
              </span>

              <h1>{trip?.title}</h1>

              <div className="booking-trip-meta">
                <span>
                  <MapPin size={16} />
                  {trip?.destination_name || "Destination"}
                </span>

                <span>
                  <CalendarDays size={16} />
                  {trip?.duration || "Flexible Duration"}
                </span>

                <span>
                  <Users size={16} />
                  {trip?.available_slots} slots available
                </span>
              </div>

              <p className="booking-trip-description">
                {trip?.description}
              </p>

              <div className="booking-price">
                <span>Price per traveler</span>

                <strong>
                  ₹
                  {Number(trip?.price || 0).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="booking-form-card">
            <div className="booking-form-header">
              <h2>Complete Your Booking</h2>

              <p>
                Select the number of travelers to continue.
              </p>
            </div>

            {error && (
              <div className="booking-form-error">
                {error}
              </div>
            )}

            <form onSubmit={handleBooking}>

              <div className="traveler-selector">
                <label>
                  Number of Travelers
                </label>

                <div className="traveler-controls">
                  <button
                    type="button"
                    onClick={() =>
                      setTravelers((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <div className="traveler-number">
                    <Users size={18} />
                    <span>{travelers}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setTravelers((value) =>
                        Math.min(
                          trip?.available_slots || 1,
                          value + 1
                        )
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="booking-summary">
                <h3>Booking Summary</h3>

                <div className="summary-row">
                  <span>Trip</span>
                  <strong>{trip?.title}</strong>
                </div>

                <div className="summary-row">
                  <span>Price</span>

                  <strong>
                    ₹
                    {Number(trip?.price || 0).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>Travelers</span>
                  <strong>{travelers}</strong>
                </div>

                <div className="summary-divider" />

                <div className="summary-total">
                  <span>Total</span>

                  <strong>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className="confirm-booking-btn"
                disabled={
                  bookingLoading ||
                  !trip?.available_slots
                }
              >
                {bookingLoading
                  ? "Creating Booking..."
                  : "Confirm Booking"}
              </button>

              <p className="booking-note">
                Payment will be processed in the next step.
              </p>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}