import { Navigate } from 'react-router-dom';
import useStore from '../store';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { token, user } = useStore();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
