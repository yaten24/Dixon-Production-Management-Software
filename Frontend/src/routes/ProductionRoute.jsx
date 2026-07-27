import ProtectedRoute from "./ProtectedRoute";

const ProductionRoute = ({ children }) => {
  return (
    <ProtectedRoute
      allowedRoles={[
        "Operator",
        "Supervisor",
        "Engineer",
        "Sr. Engineer",
      ]}
    >
      {children}
    </ProtectedRoute>
  );
};

export default ProductionRoute;