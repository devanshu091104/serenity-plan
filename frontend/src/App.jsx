import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Search,
  MapPin,
  CalendarDays,
  ArrowRight,
  Star,
  ShieldCheck,
  Headphones,
  Sparkles,
  LoaderCircle,
  User,
  LogOut,
  ClipboardList,
} from "lucide-react";

import api from "./api/axios";

function App() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // DATE STATE
  // =====================================================

  const [dateOpen, setDateOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // =====================================================
  // AUTH STATE
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("serenity_token"))
  );

  // =====================================================
  // CHECK LOGIN STATE
  // =====================================================

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("serenity_token");

      setIsLoggedIn(Boolean(token));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("serenity_token");
    localStorage.removeItem("serenity_user");

    setIsLoggedIn(false);
    setMenuOpen(false);

    navigate("/");
  };

  // =====================================================
  // FETCH PUBLISHED TRIPS
  // =====================================================

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/trips/published");

        setTrips(response.data.trips || []);
      } catch (err) {
        console.error("Trips API Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load trips. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // DATE HANDLERS
  // =====================================================

  const handleStartDateChange = (e) => {
    const value = e.target.value;

    setStartDate(value);

    if (endDate && value > endDate) {
      setEndDate("");
    }
  };

  const handleApplyDates = () => {
    if (!startDate || !endDate) return;

    setDateOpen(false);

    // Scroll to trips after applying dates
    setTimeout(() => {
      document
        .getElementById("trips")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    setDateOpen(false);
  };

  // =====================================================
  // TODAY
  // =====================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =====================================================
  // FILTER TRIPS
  // =====================================================

  const filteredTrips = trips.filter((trip) => {
    // -----------------------------------------------
    // SEARCH FILTER
    // -----------------------------------------------

    const searchText = `${trip.title || ""} ${
      trip.destination_name || ""
    } ${trip.description || ""}`.toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    // -----------------------------------------------
    // NO DATE SELECTED
    // -----------------------------------------------

    if (!startDate || !endDate) {
      return matchesSearch;
    }

    // -----------------------------------------------
    // TRIP MUST HAVE DATES
    // -----------------------------------------------

    if (!trip.start_date || !trip.end_date) {
      return false;
    }

    // -----------------------------------------------
    // NORMALIZE DATABASE DATES
    // -----------------------------------------------

    const tripStart = new Date(
      `${String(trip.start_date).slice(0, 10)}T00:00:00`
    );

    const tripEnd = new Date(
      `${String(trip.end_date).slice(0, 10)}T00:00:00`
    );

    const selectedStart = new Date(
      `${startDate}T00:00:00`
    );

    const selectedEnd = new Date(
      `${endDate}T00:00:00`
    );

    // -----------------------------------------------
    // DATE MATCH
    // Selected dates must be inside trip dates
    // -----------------------------------------------

    const matchesDates =
      tripStart <= selectedStart &&
      tripEnd >= selectedEnd;

    return matchesSearch && matchesDates;
  });

  // =====================================================
  // SCROLL TO TRIPS
  // =====================================================

  const scrollToTrips = () => {
    document
      .getElementById("trips")
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setMenuOpen(false);
    setDateOpen(false);
  };

  // =====================================================
  // TRIP CLICK
  // =====================================================

  const handleTripClick = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = () => {
    setMenuOpen(false);
    navigate("/register");
  };

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="navbar">

        <div className="container nav-inner">

          {/* LOGO */}

          <a href="#home" className="logo">

            <span className="logo-mark">
              S
            </span>

            <span>
              Serenity<span>Plan</span>
            </span>

          </a>

          {/* NAV LINKS */}

          <nav
            className={`nav-links ${
              menuOpen ? "active" : ""
            }`}
          >

            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>

            <a
              href="#destinations"
              onClick={() => setMenuOpen(false)}
            >
              Destinations
            </a>

            <a
              href="#trips"
              onClick={() => setMenuOpen(false)}
            >
              Trips
            </a>

            <a
              href="#about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </a>

            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>

            {/* MOBILE AUTH */}

            <div className="mobile-auth">

              {!isLoggedIn ? (
                <>

                  <button
                    className="btn btn-outline"
                    onClick={handleLogin}
                  >
                    Login
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={handleRegister}
                  >
                    Get Started
                  </button>

                </>
              ) : (
                <>

                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/my-bookings");
                    }}
                  >
                    <ClipboardList size={16} />
                    My Bookings
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </>
              )}

            </div>

          </nav>

          {/* DESKTOP AUTH */}

          <div className="nav-actions">

            {!isLoggedIn ? (
              <>

                <button
                  className="btn btn-outline"
                  onClick={handleLogin}
                >
                  Login
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleRegister}
                >
                  Get Started
                </button>

              </>
            ) : (
              <>

                <button
                  className="btn btn-outline"
                  onClick={() =>
                    navigate("/profile")
                  }
                >
                  <User size={16} />
                  Profile
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() =>
                    navigate("/my-bookings")
                  }
                >
                  <ClipboardList size={16} />
                  My Bookings
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>

              </>
            )}

          </div>

          {/* MOBILE MENU */}

          <button
            className="menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle menu"
          >

            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}

          </button>

        </div>

      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <main>

        <section
          className="hero"
          id="home"
        >

          <div className="hero-overlay"></div>

          <div className="container hero-content">

            <div className="hero-badge">

              <Sparkles size={16} />

              <span>
                Travel better. Live happier.
              </span>

            </div>

            <h1>
              Your journey,
              <br />
              <span>
                beautifully planned.
              </span>
            </h1>

            <p>
              Discover unforgettable destinations and
              carefully planned experiences designed to
              make every journey simple and memorable.
            </p>

            {/* =================================================
                SEARCH
                ================================================= */}

            <div className="search-box">

              {/* DESTINATION */}

              <div className="search-field">

                <MapPin size={20} />

                <div>

                  <label>
                    Where to?
                  </label>

                  <input
                    type="text"
                    placeholder="Search destination or trip"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>

              </div>

              {/* =================================================
                  DATE SEARCH
                  ================================================= */}

              <div
                className="search-field search-date"
                onClick={() =>
                  setDateOpen(!dateOpen)
                }
                style={{
                  position: "relative",
                  cursor: "pointer",
                }}
              >

                <CalendarDays size={20} />

                <div>

                  <label>
                    When?
                  </label>

                  <span>

                    {startDate && endDate
                      ? `${formatDate(
                          startDate
                        )} - ${formatDate(
                          endDate
                        )}`
                      : startDate
                      ? `${formatDate(
                          startDate
                        )} - Choose end date`
                      : "Choose your dates"}

                  </span>

                </div>

                {/* DATE POPUP */}

                {dateOpen && (

                  <div
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    style={{
                      position: "absolute",
                      top: "75px",
                      left: "0",
                      width: "300px",
                      background: "#ffffff",
                      padding: "18px",
                      borderRadius: "16px",
                      boxShadow:
                        "0 15px 40px rgba(0,0,0,0.18)",
                      zIndex: 1000,
                      color: "#222",
                    }}
                  >

                    {/* START DATE */}

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "7px",
                        marginBottom: "14px",
                      }}
                    >

                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        Start Date
                      </label>

                      <input
                        type="date"
                        value={startDate}
                        onChange={
                          handleStartDateChange
                        }
                        min={today}
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          padding: "10px",
                          border:
                            "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          color: "#222",
                          background: "#fff",
                          cursor: "pointer",
                        }}
                      />

                    </div>

                    {/* END DATE */}

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "7px",
                        marginBottom: "16px",
                      }}
                    >

                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        End Date
                      </label>

                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                          )
                        }
                        min={
                          startDate || today
                        }
                        disabled={!startDate}
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          padding: "10px",
                          border:
                            "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          color: "#222",
                          background:
                            !startDate
                              ? "#f5f5f5"
                              : "#fff",
                          cursor:
                            !startDate
                              ? "not-allowed"
                              : "pointer",
                        }}
                      />

                    </div>

                    {/* BUTTONS */}

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >

                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={
                          !startDate ||
                          !endDate
                        }
                        onClick={
                          handleApplyDates
                        }
                        style={{
                          flex: 1,
                        }}
                      >
                        Apply Dates
                      </button>

                      {(startDate ||
                        endDate) && (

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={clearDates}
                          style={{
                            padding:
                              "10px 14px",
                          }}
                        >
                          Clear
                        </button>

                      )}

                    </div>

                  </div>

                )}

              </div>

              {/* EXPLORE */}

              <button
                className="search-button"
                onClick={scrollToTrips}
              >
                <Search size={19} />
                Explore
              </button>

            </div>

            {/* TRUST */}

            <div className="hero-trust">

              <div>

                <strong>
                  {trips.length || 0}+
                </strong>

                <span>
                  Available Trips
                </span>

              </div>

              <div>

                <strong>
                  50+
                </strong>

                <span>
                  Destinations
                </span>

              </div>

              <div>

                <strong>
                  4.9/5
                </strong>

                <span>
                  Traveler Rating
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            FEATURES
            ===================================================== */}

        <section className="features">

          <div className="container features-grid">

            <div className="feature-item">

              <div className="feature-icon">
                <ShieldCheck />
              </div>

              <div>

                <h3>
                  Secure Booking
                </h3>

                <p>
                  Your booking details are handled securely.
                </p>

              </div>

            </div>

            <div className="feature-item">

              <div className="feature-icon">
                <Star />
              </div>

              <div>

                <h3>
                  Curated Experiences
                </h3>

                <p>
                  Trips designed for memorable experiences.
                </p>

              </div>

            </div>

            <div className="feature-item">

              <div className="feature-icon">
                <Headphones />
              </div>

              <div>

                <h3>
                  Travel Support
                </h3>

                <p>
                  Get assistance throughout your journey.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            DESTINATIONS
            ===================================================== */}

        <section
          className="section"
          id="destinations"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  EXPLORE
                </span>

                <h2>
                  Popular destinations
                </h2>

                <p>
                  Places that deserve a spot on your
                  next journey.
                </p>

              </div>

              <a
                href="#trips"
                className="text-link"
              >
                View all
                <ArrowRight size={18} />
              </a>

            </div>

            <div className="destination-grid">

              {/* MANALI */}

              <article className="destination-card">

                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80"
                  alt="Manali"
                />

                <div className="destination-gradient"></div>

                <div className="destination-content">

                  <span>
                    Himachal Pradesh
                  </span>

                  <h3>
                    Manali
                  </h3>

                  <button
                    onClick={() => {
                      setSearch("Manali");
                      scrollToTrips();
                    }}
                  >
                    Explore
                    <ArrowRight size={16} />
                  </button>

                </div>

              </article>

              {/* GOA */}

              <article className="destination-card">

                <img
                  src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80"
                  alt="Goa"
                />

                <div className="destination-gradient"></div>

                <div className="destination-content">

                  <span>
                    India
                  </span>

                  <h3>
                    Goa
                  </h3>

                  <button
                    onClick={() => {
                      setSearch("Goa");
                      scrollToTrips();
                    }}
                  >
                    Explore
                    <ArrowRight size={16} />
                  </button>

                </div>

              </article>

              {/* KASHMIR */}

              <article className="destination-card">

                <img
                  src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=900&q=80"
                  alt="Kashmir"
                />

                <div className="destination-gradient"></div>

                <div className="destination-content">

                  <span>
                    Jammu & Kashmir
                  </span>

                  <h3>
                    Kashmir
                  </h3>

                  <button
                    onClick={() => {
                      setSearch("Kashmir");
                      scrollToTrips();
                    }}
                  >
                    Explore
                    <ArrowRight size={16} />
                  </button>

                </div>

              </article>

            </div>

          </div>

        </section>

        {/* =====================================================
            TRIPS
            ===================================================== */}

        <section
          className="section trips-section"
          id="trips"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  OUR PACKAGES
                </span>

                <h2>
                  Featured trips
                </h2>

                <p>
                  Find a trip that matches the way you
                  want to travel.
                </p>

              </div>

            </div>

            {/* LOADING */}

            {loading && (

              <div className="empty-state">

                <LoaderCircle
                  size={35}
                  className="loading-icon"
                />

                <h3>
                  Loading trips...
                </h3>

                <p>
                  Please wait while we fetch available
                  trips.
                </p>

              </div>

            )}

            {/* ERROR */}

            {!loading && error && (

              <div className="empty-state">

                <Search size={35} />

                <h3>
                  Unable to load trips
                </h3>

                <p>
                  {error}
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </button>

              </div>

            )}

            {/* TRIPS */}

            {!loading &&
              !error &&
              filteredTrips.length > 0 && (

                <div className="trip-grid">

                  {filteredTrips.map(
                    (trip) => (

                      <article
                        className="trip-card"
                        key={trip.id}
                      >

                        <div className="trip-image">

                          <img
                            src={
                              trip.destination_image ||
                              "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80"
                            }
                            alt={trip.title}
                            loading="lazy"
                          />

                          <span
                            className={`trip-tag ${
                              trip.available_slots > 0
                                ? ""
                                : "sold-out"
                            }`}
                          >
                            {trip.available_slots > 0
                              ? "Available"
                              : "Sold Out"}
                          </span>

                        </div>

                        <div className="trip-body">

                          <div className="trip-location">

                            <MapPin size={15} />

                            {trip.destination_name ||
                              "India"}

                          </div>

                          <h3>
                            {trip.title}
                          </h3>

                          {/* TRIP DATES */}

                          <div className="trip-meta">

                            <span>

                              <CalendarDays
                                size={15}
                              />

                              {trip.start_date &&
                              trip.end_date
                                ? `${formatDate(
                                    String(
                                      trip.start_date
                                    ).slice(
                                      0,
                                      10
                                    )
                                  )} - ${formatDate(
                                    String(
                                      trip.end_date
                                    ).slice(
                                      0,
                                      10
                                    )
                                  )}`
                                : trip.duration ||
                                  "Flexible Duration"}

                            </span>

                          </div>

                          <div className="trip-footer">

                            <div>

                              <small>
                                Starting from
                              </small>

                              <strong>
                                ₹
                                {Number(
                                  trip.price || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                            </div>

                            <button
                              className="arrow-button"
                              onClick={() =>
                                handleTripClick(
                                  trip.id
                                )
                              }
                              aria-label={`View ${trip.title}`}
                            >
                              <ArrowRight
                                size={19}
                              />
                            </button>

                          </div>

                        </div>

                      </article>

                    )
                  )}

                </div>

              )}

            {/* NO TRIPS */}

            {!loading &&
              !error &&
              filteredTrips.length === 0 && (

                <div className="empty-state">

                  <Search size={35} />

                  <h3>
                    No trips found
                  </h3>

                  <p>

                    {startDate && endDate
                      ? `No trips are available between ${formatDate(
                          startDate
                        )} and ${formatDate(
                          endDate
                        )}.`
                      : "Try searching for another destination."}

                  </p>

                  {(startDate ||
                    endDate ||
                    search) && (

                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSearch("");
                        clearDates();
                      }}
                    >
                      Clear Search
                    </button>

                  )}

                </div>

              )}

          </div>

        </section>

        {/* =====================================================
            CTA
            ===================================================== */}

        <section
          className="cta-section"
          id="about"
        >

          <div className="container">

            <div className="cta-card">

              <div>

                <span className="eyebrow">
                  PLAN YOUR ESCAPE
                </span>

                <h2>
                  Ready for your next adventure?
                </h2>

                <p>
                  Choose your destination and let
                  Serenity Plan take care of the journey.
                </p>

              </div>

              <button
                className="btn btn-light"
                onClick={scrollToTrips}
              >
                Explore Trips
                <ArrowRight size={18} />
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer
        className="footer"
        id="contact"
      >

        <div className="container footer-grid">

          <div>

            <a
              href="#home"
              className="logo footer-logo"
            >

              <span className="logo-mark">
                S
              </span>

              <span>
                Serenity<span>Plan</span>
              </span>

            </a>

            <p>
              Making travel simpler, smoother and
              more memorable.
            </p>

          </div>

          <div>

            <h4>
              Explore
            </h4>

            <a href="#destinations">
              Destinations
            </a>

            <a href="#trips">
              Trips
            </a>

            <a href="#about">
              About Us
            </a>

          </div>

          <div>

            <h4>
              Support
            </h4>

            <a href="#contact">
              Contact Us
            </a>

            <a href="#contact">
              Help Center
            </a>

            <a href="#contact">
              Privacy Policy
            </a>

          </div>

          <div>

            <h4>
              Contact
            </h4>

            <p>
              hello@serenityplan.com
            </p>

            <p>
              +91 98765 43210
            </p>

            <p>
              India
            </p>

          </div>

        </div>

        <div className="container footer-bottom">

          <span>
            © 2026 Serenity Plan. All rights reserved.
          </span>

          <span>
            Made for better journeys.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;