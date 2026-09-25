export const getAdminToken = () => {
  return localStorage.getItem("serenity_token");
};

export const getStoredAdminUser = () => {
  const storedUser = localStorage.getItem("serenity_user");

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);

    if (user?.role !== "admin") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
};

export const isAdminLoggedIn = () => {
  const token = getAdminToken();
  const user = getStoredAdminUser();

  return Boolean(token && user);
};

export const clearAdminSession = () => {
  localStorage.removeItem("serenity_token");
  localStorage.removeItem("serenity_user");

  window.dispatchEvent(
    new Event("serenity-auth-changed")
  );
};

export const getAdminPageTitle = (pathname) => {
  const titles = {
    "/admin": "Dashboard",
    "/admin/trips": "Trips",
    "/admin/destinations": "Destinations",
    "/admin/categories": "Categories",
    "/admin/users": "Users",
    "/admin/bookings": "Bookings",
    "/admin/posts": "Posts & Blog",
    "/admin/inquiries": "Inquiries",
  };

  return titles[pathname] || "Admin Panel";
};