import { Navigate } from 'react-router-dom';
import useResumeStore from '../store/resumeStore';

const ProtectedRoute = ({ children }) => {
  const { token } = useResumeStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
