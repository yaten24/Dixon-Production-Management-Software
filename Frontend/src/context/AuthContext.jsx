import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfile, logoutUser } from "../api/Authapi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // FIX: this used to be sourced from localStorage on first render, which
  // meant a stale/incorrect copy could linger client-side after the
  // backend had already revoked or changed something. Now the *only*
  // source of truth is the backend: on every fresh page load we ask
  // "/auth/profile" — the browser sends the httpOnly cookie automatically,
  // so if it's valid we get the user back, and if it's missing/expired we
  // just get a 401 and treat the user as logged out. Nothing sensitive is
  // ever kept in localStorage/sessionStorage.
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await getProfile();

      if (res.success) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 here just means "no valid session" — not an error worth
      // logging loudly, this is the normal "not logged in yet" case.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Called right after a successful login API call — avoids an extra
  // round-trip to /profile since the login response already includes
  // the user object.
  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // Clear client-side state regardless of whether the API call
      // succeeded — the cookie-clearing on the backend is best-effort,
      // but the UI should reflect "logged out" immediately either way.
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
