import React, { useCallback, useEffect, useState } from "react";
import { getAdminDashboard } from "../api/admin.api";



const EMPTY_DASHBOARD = {
  users: {
    total: 0,
    active: 0,
  },

  trips: {
    total: 0,
    published: 0,
  },

  destinations: {
    total: 0,
  },

  bookings: {
    total: 0,
    pending: 0,
    confirmed: 0,
  },

  inquiries: {
    total: 0,
    new: 0,
  },

  revenue: {
    total: 0,
    currency: "INR",
  },

  recentBookings: [],
  recentInquiries: [],
};

/* =========================================================
   TOKEN
========================================================= */

const getToken = () => {
  return localStorage.getItem("serenity_token") || "";
};

/* =========================================================
   CLEAR AUTH
========================================================= */

const clearAuthAndRedirect = () => {
  localStorage.removeItem("serenity_token");
  localStorage.removeItem("serenity_user");

  sessionStorage.clear();

  window.location.href = "/login";
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value === "confirmed" ||
    value === "paid" ||
    value === "success"
  ) {
    return "status status-success";
  }

  if (value === "pending") {
    return "status status-pending";
  }

  if (
    value === "cancelled" ||
    value === "failed" ||
    value === "rejected"
  ) {
    return "status status-danger";
  }

  return "status";
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon,
  label,
  value,
  iconClass = "",
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>
        {icon}
      </div>

      <div className="stat-content">
        <p className="stat-label">{label}</p>

        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
};

/* =========================================================
   SMALL STAT
========================================================= */

const SmallStat = ({ icon, label, value }) => {
  return (
    <div className="small-stat-card">
      <div className="small-stat-label">
        <span className="small-stat-icon">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <div className="small-stat-value">
        {value}
      </div>
    </div>
  );
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(
    EMPTY_DASHBOARD
  );

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard = useCallback(
  async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        clearAuthAndRedirect();
        return;
      }

      const response = await getAdminDashboard();
      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to load dashboard."
        );
      }

      const serverDashboard = data.dashboard || {};

      setDashboard({
        users: {
          total: Number(serverDashboard.users?.total || 0),
          active: Number(serverDashboard.users?.active || 0),
        },

        trips: {
          total: Number(serverDashboard.trips?.total || 0),
          published: Number(
            serverDashboard.trips?.published || 0
          ),
        },

        destinations: {
          total: Number(
            serverDashboard.destinations?.total || 0
          ),
        },

        bookings: {
          total: Number(
            serverDashboard.bookings?.total || 0
          ),
          pending: Number(
            serverDashboard.bookings?.pending || 0
          ),
          confirmed: Number(
            serverDashboard.bookings?.confirmed || 0
          ),
        },

        inquiries: {
          total: Number(
            serverDashboard.inquiries?.total || 0
          ),
          new: Number(
            serverDashboard.inquiries?.new || 0
          ),
        },

        revenue: {
          total: Number(
            serverDashboard.revenue?.total || 0
          ),
          currency:
            serverDashboard.revenue?.currency || "INR",
        },

        recentBookings: Array.isArray(
          serverDashboard.recentBookings
        )
          ? serverDashboard.recentBookings
          : [],

        recentInquiries: Array.isArray(
          serverDashboard.recentInquiries
        )
          ? serverDashboard.recentInquiries
          : [],
      });
    } catch (err) {
      console.error("Admin Dashboard Error:", err);

      if (err.response?.status === 401) {
        clearAuthAndRedirect();
        return;
      }

      if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You are not authorized to access the admin dashboard."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  []
);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-dashboard {
          width: 100%;
          min-height: 100vh;
          background: #f7f9f8;
          padding: 28px 0 60px;
        }

        .dashboard-container {
          width: min(1400px, calc(100% - 48px));
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .dashboard-breadcrumb {
          margin: 0 0 5px;
          font-size: 13px;
          color: #718078;
        }

        .dashboard-heading {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -0.7px;
          color: #101816;
        }

        .refresh-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid #d6dfdb;
          background: #ffffff;
          color: #17211e;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-button:hover {
          border-color: #226b54;
          color: #226b54;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 16px;
        }

        .dashboard-error {
          margin-bottom: 18px;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid #efc4c0;
          background: #fff1ef;
          color: #a63830;
          font-size: 13px;
        }

        .hero-card {
          min-height: 175px;
          padding: 34px 31px;
          border-radius: 20px;
          background:
            linear-gradient(
              135deg,
              #185b47 0%,
              #28775f 100%
            );
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 22px;
          overflow: hidden;
        }

        .hero-left {
          min-width: 0;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 20px;
          border: 1px solid
            rgba(255, 255, 255, 0.3);
          background:
            rgba(255, 255, 255, 0.08);
          font-size: 12px;
          font-weight: 650;
          margin-bottom: 13px;
        }

        .hero-title {
          margin: 0 0 8px;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .hero-description {
          margin: 0;
          color: rgba(255,255,255,0.9);
          font-size: 14px;
        }

        .hero-grid-icon {
          width: 105px;
          height: 105px;
          flex-shrink: 0;
          border-radius: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(255, 255, 255, 0.12);
          font-size: 48px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-card {
          min-height: 110px;
          padding: 20px;
          border-radius: 15px;
          border: 1px solid #e0e8e4;
          background: #ffffff;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          width: 49px;
          height: 49px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #edf6f2;
          color: #237458;
          font-size: 22px;
        }

        .stat-icon-blue {
          background: #edf4ff;
          color: #3376d5;
        }

        .stat-icon-purple {
          background: #f2efff;
          color: #7256cf;
        }

        .stat-icon-orange {
          background: #fff4e5;
          color: #d78619;
        }

        .stat-icon-green {
          background: #eaf7f0;
          color: #28945e;
        }

        .stat-content {
          min-width: 0;
        }

        .stat-label {
          margin: 0 0 5px;
          color: #77847e;
          font-size: 13px;
        }

        .stat-value {
          margin: 0;
          color: #111918;
          font-size: 23px;
          line-height: 1;
          font-weight: 750;
        }

        .secondary-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .small-stat-card {
          padding: 16px 15px;
          border-radius: 13px;
          border: 1px solid #e0e8e4;
          background: #ffffff;
        }

        .small-stat-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #236e58;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .small-stat-icon {
          font-size: 14px;
        }

        .small-stat-value {
          padding-left: 22px;
          color: #111918;
          font-size: 19px;
          font-weight: 750;
        }

        .content-grid {
          display: grid;
          grid-template-columns:
            1.45fr 1fr;
          gap: 18px;
        }

        .dashboard-panel {
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid #e0e8e4;
          background: #ffffff;
        }

        .panel-header {
          min-height: 75px;
          padding: 17px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e8eeeb;
        }

        .panel-title {
          margin: 0 0 4px;
          color: #15201c;
          font-size: 17px;
          font-weight: 700;
        }

        .panel-subtitle {
          margin: 0;
          color: #87928d;
          font-size: 12px;
        }

        .panel-header-icon {
          color: #236e58;
          font-size: 21px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .bookings-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
        }

        .bookings-table th {
          padding: 12px 17px;
          text-align: left;
          background: #fafcfb;
          color: #7d8985;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .bookings-table td {
          padding: 14px 17px;
          border-top: 1px solid #edf1ef;
          color: #4b5752;
          font-size: 12px;
          white-space: nowrap;
        }

        .booking-reference {
          color: #15201c;
          font-weight: 700;
        }

        .trip-title {
          display: block;
          max-width: 190px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #53615b;
        }

        .amount {
          color: #15201c;
          font-weight: 650;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 10px;
          border-radius: 20px;
          background: #edf2ef;
          color: #52615a;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-success {
          background: #e5f5ec;
          color: #19804d;
        }

        .status-pending {
          background: #fff4df;
          color: #a76700;
        }

        .status-danger {
          background: #fde9e8;
          color: #c64038;
        }

        .inquiries-list {
          width: 100%;
        }

        .inquiry-item {
          display: flex;
          gap: 12px;
          padding: 17px 19px;
          border-bottom: 1px solid #edf1ef;
        }

        .inquiry-item:last-child {
          border-bottom: 0;
        }

        .inquiry-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e7f2ee;
          color: #226a52;
          font-size: 13px;
          font-weight: 750;
        }

        .inquiry-content {
          flex: 1;
          min-width: 0;
        }

        .inquiry-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .inquiry-name {
          color: #18221e;
          font-size: 12px;
          font-weight: 750;
        }

        .inquiry-date {
          color: #8c9692;
          font-size: 9px;
          white-space: nowrap;
        }

        .inquiry-subject {
          margin-top: 4px;
          color: #3f4b46;
          font-size: 11px;
          font-weight: 650;
        }

        .inquiry-message {
          margin-top: 5px;
          color: #87918d;
          font-size: 10px;
          line-height: 1.5;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .empty-state {
          min-height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          color: #89948f;
          font-size: 13px;
        }

        .loading-state {
          min-height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #77847e;
          font-size: 13px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          margin-right: 9px;
          border: 2px solid #d8e5df;
          border-top-color: #226b54;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1150px) {
          .stats-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .secondary-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .dashboard-container {
            width: calc(100% - 24px);
          }

          .admin-dashboard {
            padding-top: 18px;
          }

          .dashboard-header {
            align-items: flex-start;
          }

          .dashboard-heading {
            font-size: 25px;
          }

          .refresh-button {
            padding: 0 12px;
          }

          .hero-card {
            min-height: auto;
            padding: 25px 21px;
          }

          .hero-title {
            font-size: 21px;
          }

          .hero-grid-icon {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .secondary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 450px) {
          .dashboard-header {
            flex-direction: column;
            width: 100%;
          }

          .refresh-button {
            align-self: flex-end;
          }

          .secondary-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 19px;
          }

          .hero-description {
            font-size: 12px;
          }
        }

      `}</style>

      <div className="admin-dashboard">
        <div className="dashboard-container">

          <div className="dashboard-header">
            <div>
              <p className="dashboard-breadcrumb">
                Overview
              </p>

              <h1 className="dashboard-heading">
                Dashboard
              </h1>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={() =>
                fetchDashboard(true)
              }
              disabled={loading || refreshing}
            >
              <span className="refresh-icon">
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          <section className="hero-card">
            <div className="hero-left">
              <div className="hero-badge">
                ↗ Serenity Plan
              </div>

              <h2 className="hero-title">
                Welcome to your admin dashboard
              </h2>

              <p className="hero-description">
                Manage users, trips, bookings,
                payments and customer inquiries
                from one place.
              </p>
            </div>

            <div className="hero-grid-icon">
              ▦
            </div>
          </section>

          <div className="stats-grid">

            <StatCard
              icon="♙"
              label="Total Users"
              value={
                loading
                  ? "..."
                  : dashboard.users.total
              }
              iconClass="stat-icon-blue"
            />

            <StatCard
              icon="◇"
              label="Total Trips"
              value={
                loading
                  ? "..."
                  : dashboard.trips.total
              }
              iconClass="stat-icon-purple"
            />

            <StatCard
              icon="▣"
              label="Total Bookings"
              value={
                loading
                  ? "..."
                  : dashboard.bookings.total
              }
              iconClass="stat-icon-orange"
            />

            <StatCard
              icon="₹"
              label="Total Revenue"
              value={
                loading
                  ? "..."
                  : formatCurrency(
                      dashboard.revenue.total
                    )
              }
              iconClass="stat-icon-green"
            />

          </div>

          <div className="secondary-grid">

            <SmallStat
              icon="♙"
              label="Active Users"
              value={
                loading
                  ? "..."
                  : dashboard.users.active
              }
            />

            <SmallStat
              icon="⌖"
              label="Destinations"
              value={
                loading
                  ? "..."
                  : dashboard.destinations.total
              }
            />

            <SmallStat
              icon="◷"
              label="Pending Bookings"
              value={
                loading
                  ? "..."
                  : dashboard.bookings.pending
              }
            />

            <SmallStat
              icon="✓"
              label="Confirmed Bookings"
              value={
                loading
                  ? "..."
                  : dashboard.bookings.confirmed
              }
            />

            <SmallStat
              icon="□"
              label="New Inquiries"
              value={
                loading
                  ? "..."
                  : dashboard.inquiries.new
              }
            />

          </div>

          <div className="content-grid">

            <section className="dashboard-panel">

              <div className="panel-header">
                <div>
                  <h3 className="panel-title">
                    Recent Bookings
                  </h3>

                  <p className="panel-subtitle">
                    Latest customer bookings
                  </p>
                </div>

                <div className="panel-header-icon">
                  ▣
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <span className="spinner" />
                  Loading bookings...
                </div>
              ) : dashboard.recentBookings
                  .length === 0 ? (
                <div className="empty-state">
                  No bookings found.
                </div>
              ) : (
                <div className="table-wrapper">

                  <table className="bookings-table">

                    <thead>
                      <tr>
                        <th>REFERENCE</th>
                        <th>TRIP</th>
                        <th>TRAVELERS</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.recentBookings.map(
                        (booking) => (
                          <tr
                            key={booking.id}
                          >
                            <td>
                              <span className="booking-reference">
                                {
                                  booking.booking_reference
                                }
                              </span>
                            </td>

                            <td>
                              <span className="trip-title">
                                {
                                  booking.trip_title
                                }
                              </span>
                            </td>

                            <td>
                              {
                                booking.travelers ||
                                1
                              }
                            </td>

                            <td>
                              <span className="amount">
                                {formatCurrency(
                                  booking.total_amount
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={getStatusClass(
                                  booking.booking_status
                                )}
                              >
                                {
                                  booking.booking_status
                                }
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>
              )}

            </section>

            <section className="dashboard-panel">

              <div className="panel-header">
                <div>
                  <h3 className="panel-title">
                    Recent Inquiries
                  </h3>

                  <p className="panel-subtitle">
                    Latest customer messages
                  </p>
                </div>

                <div className="panel-header-icon">
                  □
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <span className="spinner" />
                  Loading inquiries...
                </div>
              ) : dashboard.recentInquiries
                  .length === 0 ? (
                <div className="empty-state">
                  No inquiries found.
                </div>
              ) : (
                <div className="inquiries-list">

                  {dashboard.recentInquiries.map(
                    (inquiry) => {

                      const firstLetter =
                        String(
                          inquiry.name ||
                            "U"
                        )
                          .charAt(0)
                          .toUpperCase();

                      return (
                        <div
                          className="inquiry-item"
                          key={inquiry.id}
                        >
                          <div className="inquiry-avatar">
                            {firstLetter}
                          </div>

                          <div className="inquiry-content">

                            <div className="inquiry-top">
                              <span className="inquiry-name">
                                {
                                  inquiry.name ||
                                  "User"
                                }
                              </span>

                              <span className="inquiry-date">
                                {formatDate(
                                  inquiry.created_at
                                )}
                              </span>
                            </div>

                            <div className="inquiry-subject">
                              {
                                inquiry.subject ||
                                "Travel Inquiry"
                              }
                            </div>

                            <div className="inquiry-message">
                              {
                                inquiry.message ||
                                "No message available."
                              }
                            </div>

                          </div>
                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </section>

          </div>

        </div>
      </div>
    </>
  );
}