import ProtectedRoute from "./ProtectedRoute";

const ManagementRoute = ({ children }) => {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Assistant Manager",
        "Deputy Manager",
        "Manager",
        "Assistant General Manager",
        "Deputy General Manager",
        "General Manager",
        "Sr. General Manager",
        "Assistant Vice President",
        "Vice President",
        "Sr. Vice President",
        "President",
      ]}
    >
      {children}
    </ProtectedRoute>
  );
};

export default ManagementRoute;