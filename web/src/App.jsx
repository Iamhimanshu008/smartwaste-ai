import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import PublicView from './pages/PublicView';
import AdminDashboard from './pages/AdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import SHGDashboard from './pages/SHGDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import RecyclerDashboard from './pages/RecyclerDashboard';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/public" replace />} />
            <Route path="/public" element={<PublicView />} />
            <Route path="/login" element={<Login />} />

            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/subadmin/*"
                element={
                    <ProtectedRoute allowedRoles={['sub_admin']}>
                        <SubAdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/shg/*"
                element={
                    <ProtectedRoute allowedRoles={['shg']}>
                        <SHGDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/collector/*"
                element={
                    <ProtectedRoute allowedRoles={['collector']}>
                        <CollectorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/recycler/*"
                element={
                    <ProtectedRoute allowedRoles={['recycler']}>
                        <RecyclerDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
