import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any route that needs a logged-in user:
//   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // While AuthContext is checking the cookie session on first load, avoid
  // flashing a redirect to /login for a user who's actually logged in.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E2E4E9] border-t-[#2563EB]" />
          Checking session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
