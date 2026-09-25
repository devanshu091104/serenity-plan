import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "serenity_token";
const USER_KEY = "serenity_user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem(USER_KEY);

    try {
      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = Boolean(token);

  const login = (newToken, newUser = null) => {
    if (!newToken) {
      return;
    }

    localStorage.setItem(
      TOKEN_KEY,
      newToken
    );

    if (newUser) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(newUser)
      );
    } else {
      localStorage.removeItem(USER_KEY);
    }

    setToken(newToken);
    setUser(newUser);

    window.dispatchEvent(
      new Event("serenity-auth-changed")
    );
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);

    window.dispatchEvent(
      new Event("serenity-auth-changed")
    );
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const currentToken =
        localStorage.getItem(TOKEN_KEY);

      const storedUser =
        localStorage.getItem(USER_KEY);

      setToken(currentToken);

      try {
        setUser(
          storedUser
            ? JSON.parse(storedUser)
            : null
        );
      } catch {
        setUser(null);
      }
    };

    window.addEventListener(
      "serenity-auth-changed",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "serenity-auth-changed",
        handleAuthChange
      );
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoggedIn,
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;