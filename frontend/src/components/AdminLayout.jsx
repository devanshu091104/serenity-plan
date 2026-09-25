import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Navigate } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../context/AuthContext";

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="admin-main">
        <div className="admin-mobile-header">
          <button
            className="admin-mobile-menu"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <span>Admin Panel</span>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;