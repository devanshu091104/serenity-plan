
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  XCircle,
  LoaderCircle,
} from "lucide-react";

import api from "../api/axios";

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/trips/${id}`
        );

        if (response.data.success) {
          setTrip(response.data.trip);
        } else {
          setError("Trip not found.");
        }
      } catch (err) {
        console.error(
          "Trip details error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load trip details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const handleBookNow = () => {
    const token =
      localStorage.getItem("serenity_token");

    if (!token) {
      navigate("/login", {
        state: {
          redirectTo: `/trips/${id}`,
        },
      });

      return;
    }

    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="trip-details-loading">

        <LoaderCircle
          size={42}
          className="loading-icon"
        />

        <p>
          Loading trip details...
        </p>

      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-details-error">

        <h2>
          Trip Not Found
        </h2>

        <p>
          {error ||
            "Something went wrong."}
        </p>

        <button
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>

      </div>
    );
  }

  const itinerary =
    trip.itinerary
      ?.split("\n")
      .filter(
        (item) => item.trim()
      ) || [];

  const inclusions =
    trip.inclusions
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];

  const exclusions =
    trip.exclusions
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) || [];

  return (
    <div className="trip-details-page">

      {/* HEADER */}

      <div className="trip-details-header">

        <div className="container">

          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />

            Back
          </button>

        </div>

      </div>

      {/* HERO */}

      <section className="trip-details-hero">

        <img
          src={
            trip.destination_image ||
            "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80"
          }
          alt={trip.title}
        />

        <div className="trip-details-overlay">

          <div className="container">

            <span className="trip-category">
              {trip.category_name ||
                "Travel"}
            </span>

            <h1>
              {trip.title}
            </h1>

            <div className="hero-location">

              <MapPin size={18} />

              {trip.destination_name ||
                "Destination"}

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <main className="container trip-details-content">

        <div className="trip-details-main">

          {/* OVERVIEW */}

          <section className="details-card">

            <h2>
              Trip Overview
            </h2>

            <p className="trip-description">
              {trip.description ||
                "Experience an unforgettable journey with Serenity Plan."}
            </p>

            <div className="trip-info-grid">

              <div className="trip-info-item">

                <Clock3 size={22} />

                <div>

                  <span>
                    Duration
                  </span>

                  <strong>
                    {trip.duration ||
                      "Not specified"}
                  </strong>

                </div>

              </div>

              <div className="trip-info-item">

                <CalendarDays size={22} />

                <div>

                  <span>
                    Start Date
                  </span>

                  <strong>
                    {formatDate(
                      trip.start_date
                    )}
                  </strong>

                </div>

              </div>

              <div className="trip-info-item">

                <CalendarDays size={22} />

                <div>

                  <span>
                    End Date
                  </span>

                  <strong>
                    {formatDate(
                      trip.end_date
                    )}
                  </strong>

                </div>

              </div>

              <div className="trip-info-item">

                <Users size={22} />

                <div>

                  <span>
                    Available Slots
                  </span>

                  <strong>
                    {trip.available_slots}
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* ITINERARY */}

          <section className="details-card">

            <h2>
              Trip Itinerary
            </h2>

            <div className="itinerary-list">

              {itinerary.length > 0 ? (

                itinerary.map(
                  (item, index) => (

                    <div
                      className="itinerary-item"
                      key={index}
                    >

                      <div className="day-number">
                        {index + 1}
                      </div>

                      <div>

                        <h3>
                          {item.includes(":")
                            ? item.split(":")[0]
                            : `Day ${index + 1}`}
                        </h3>

                        <p>
                          {item.includes(":")
                            ? item.substring(
                                item.indexOf(":") +
                                  1
                              ).trim()
                            : item}
                        </p>

                      </div>

                    </div>

                  )
                )

              ) : (

                <p>
                  No itinerary available.
                </p>

              )}

            </div>

          </section>

          {/* INCLUSIONS */}

          <section className="details-card">

            <div className="include-grid">

              <div>

                <h2>
                  What's Included
                </h2>

                <div className="include-list">

                  {inclusions.length > 0 ? (

                    inclusions.map(
                      (item, index) => (

                        <div key={index}>

                          <CheckCircle2
                            size={18}
                          />

                          <span>
                            {item}
                          </span>

                        </div>

                      )
                    )

                  ) : (

                    <p>
                      No inclusions specified.
                    </p>

                  )}

                </div>

              </div>

              <div>

                <h2>
                  What's Not Included
                </h2>

                <div className="include-list exclusion-list">

                  {exclusions.length > 0 ? (

                    exclusions.map(
                      (item, index) => (

                        <div key={index}>

                          <XCircle
                            size={18}
                          />

                          <span>
                            {item}
                          </span>

                        </div>

                      )
                    )

                  ) : (

                    <p>
                      No exclusions specified.
                    </p>

                  )}

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* BOOKING CARD */}

        <aside className="booking-card">

          <div className="booking-price">

            <span>
              Starting from
            </span>

            <strong>
              ₹
              {Number(
                trip.price
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              per person
            </small>

          </div>

          <div className="booking-location">

            <MapPin size={18} />

            {trip.destination_name ||
              "India"}

          </div>

          <div className="booking-slots">

            <Users size={18} />

            {trip.available_slots > 0
              ? `${trip.available_slots} slots available`
              : "Sold Out"}

          </div>

          <button
            className="book-now-button"
            disabled={
              trip.available_slots <= 0
            }
            onClick={handleBookNow}
          >
            {trip.available_slots > 0
              ? "Book This Trip"
              : "Sold Out"}
          </button>

          <p className="booking-note">
            Secure booking • Easy cancellation
          </p>

        </aside>

      </main>

    </div>
  );
}

export default TripDetails;

