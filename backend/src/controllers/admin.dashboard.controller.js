const { pool } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const [
      [users],
      [activeUsers],
      [trips],
      [publishedTrips],
      [destinations],
      [bookings],
      [pendingBookings],
      [confirmedBookings],
      [inquiries],
      [newInquiries],
      [revenue],
      [recentBookings],
      [recentInquiries],
    ] = await Promise.all([
      // Total users
      pool.execute(`
        SELECT COUNT(*) AS total_users
        FROM users
      `),

      // Active users
      pool.execute(`
        SELECT COUNT(*) AS active_users
        FROM users
        WHERE role = 'user'
          AND status = 'active'
      `),

      // Total trips
      pool.execute(`
        SELECT COUNT(*) AS total_trips
        FROM trips
      `),

      // Published trips
      pool.execute(`
        SELECT COUNT(*) AS published_trips
        FROM trips
        WHERE status = 'published'
      `),

      // Total destinations
      pool.execute(`
        SELECT COUNT(*) AS total_destinations
        FROM destinations
      `),

      // Total bookings
      pool.execute(`
        SELECT COUNT(*) AS total_bookings
        FROM bookings
      `),

      // Pending bookings
      pool.execute(`
        SELECT COUNT(*) AS pending_bookings
        FROM bookings
        WHERE booking_status = 'pending'
      `),

      // Confirmed bookings
      pool.execute(`
        SELECT COUNT(*) AS confirmed_bookings
        FROM bookings
        WHERE booking_status = 'confirmed'
      `),

      // Total inquiries
      pool.execute(`
        SELECT COUNT(*) AS total_inquiries
        FROM inquiries
      `),

      // New inquiries
      pool.execute(`
        SELECT COUNT(*) AS new_inquiries
        FROM inquiries
        WHERE status = 'new'
      `),

      // TOTAL REVENUE
      // Only successfully completed payments are counted.
      pool.execute(`
        SELECT COALESCE(SUM(amount), 0) AS total_revenue
        FROM payments
        WHERE status = 'success'
      `),

      // Recent bookings
      pool.execute(`
        SELECT
          b.id,
          b.booking_reference,
          b.travelers,
          b.total_amount,
          b.booking_status,
          b.payment_status,
          b.booking_date,
          u.name AS user_name,
          u.email AS user_email,
          t.title AS trip_title

        FROM bookings b

        INNER JOIN users u
          ON b.user_id = u.id

        INNER JOIN trips t
          ON b.trip_id = t.id

        ORDER BY b.booking_date DESC
        LIMIT 5
      `),

      // Recent inquiries
      pool.execute(`
        SELECT
          id,
          name,
          email,
          subject,
          message,
          status,
          created_at

        FROM inquiries

        ORDER BY created_at DESC
        LIMIT 5
      `),
    ]);

    const dashboard = {
      users: {
        total: Number(users[0]?.total_users || 0),
        active: Number(activeUsers[0]?.active_users || 0),
      },

      trips: {
        total: Number(trips[0]?.total_trips || 0),
        published: Number(
          publishedTrips[0]?.published_trips || 0
        ),
      },

      destinations: {
        total: Number(
          destinations[0]?.total_destinations || 0
        ),
      },

      bookings: {
        total: Number(bookings[0]?.total_bookings || 0),
        pending: Number(
          pendingBookings[0]?.pending_bookings || 0
        ),
        confirmed: Number(
          confirmedBookings[0]?.confirmed_bookings || 0
        ),
      },

      inquiries: {
        total: Number(
          inquiries[0]?.total_inquiries || 0
        ),
        new: Number(
          newInquiries[0]?.new_inquiries || 0
        ),
      },

      revenue: {
        total: Number(
          revenue[0]?.total_revenue || 0
        ),
        currency: "INR",
      },

      recentBookings,
      recentInquiries,
    };

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};