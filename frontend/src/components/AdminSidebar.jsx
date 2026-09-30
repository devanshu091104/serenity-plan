import React from "react";
import {
  LayoutDashboard,
  Map,
  MapPin,
  Tags,
  Users,
  CalendarCheck,
  FileText,
  MessageSquare,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const AdminSidebar = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Trips",
      path: "/admin/trips",
      icon: Map,
    },
    {
      label: "Destinations",
      path: "/admin/destinations",
      icon: MapPin,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Posts & Blog",
      path: "/admin/posts",
      icon: FileText,
    },
    {
      label: "Inquiries",
      path: "/admin/inquiries",
      icon: MessageSquare,
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >
        <div className="admin-sidebar-header">
          <div>
            <h2>Serenity Plan</h2>
            <span>Admin Panel</span>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.path}
                href={item.path}
                className="admin-sidebar-link"
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;