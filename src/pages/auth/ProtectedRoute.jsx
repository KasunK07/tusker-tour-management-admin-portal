import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const ProtectedRoute = ({ children}) => {
  const { data: user, isLoading, error } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (error || !user) return <Navigate to="/auth/sign-in" />;
 
  return children;
};

export default ProtectedRoute;