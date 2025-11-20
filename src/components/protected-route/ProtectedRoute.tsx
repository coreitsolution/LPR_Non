import { Navigate } from "react-router-dom";

// Components
import Loading from "../../components/loading/Loading";

type ProtectedRouteProps = {
  children: React.ReactNode;
  permission?: boolean;
  redirectTo?: string;
};

const ProtectedRoute = ({ children, permission, redirectTo = "/center" }: ProtectedRouteProps) => {
  if (permission === undefined) {
    return <Loading />;
  }

  if (permission === false) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
