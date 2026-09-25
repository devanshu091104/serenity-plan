import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* AUTH CONTEXT */
import { AuthProvider } from "./context/AuthContext";

/* PUBLIC */
import App from "./App";
import TripDetails from "./pages/TripDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Payment from "./pages/Payment";

/* ADMIN */
import AdminDashboard from "./pages/AdminDashboard";
import AdminTrips from "./pages/AdminTrips";
import AdminDestinations from "./pages/AdminDestinations";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminBookings from "./pages/AdminBookings";
import AdminPosts from "./pages/AdminPosts";
import AdminInquiries from "./pages/AdminInquiries";

/* ADMIN LAYOUT */
import AdminLayout from "./components/AdminLayout";

/* GLOBAL CSS */
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route
            path="/"
            element={<App />}
          />

          <Route
            path="/trips/:id"
            element={<TripDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/booking/:id"
            element={<Booking />}
          />

          <Route
            path="/my-bookings"
            element={<MyBookings />}
          />

          <Route
            path="/payment/:id"
            element={<Payment />}
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/trips"
            element={
              <AdminLayout>
                <AdminTrips />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/destinations"
            element={
              <AdminLayout>
                <AdminDestinations />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <AdminLayout>
                <AdminBookings />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/posts"
            element={
              <AdminLayout>
                <AdminPosts />
              </AdminLayout>
            }
          />

          <Route
            path="/admin/inquiries"
            element={
              <AdminLayout>
                <AdminInquiries />
              </AdminLayout>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);