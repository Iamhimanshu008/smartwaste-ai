import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PublicView from './pages/PublicView';
import AdminDashboard from './pages/AdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import SHGDashboard from './pages/SHGDashboard';
import CollectorDashboard from './pages/CollectorDashboard';
import RecyclerDashboard from './pages/RecyclerDashboard';
import RecyclerPortal from './pages/RecyclerPortal';
import NewsManagement from './pages/NewsManagement';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/public" element={<PublicView />} />
            <Route path="/recyclers" element={<RecyclerPortal />} />
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
                path="/news"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'sub_admin']}>
                        <NewsManagement />
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
