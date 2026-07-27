import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRedirectByRole } from "../utils/roleRedirect";

const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useAuth();

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

  if (isAuthenticated) {
    return (
      <Navigate
        to={getRedirectByRole(user.role)}
        replace
      />
    );
  }

  return children;
};

export default PublicRoute;