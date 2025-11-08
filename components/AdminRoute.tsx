import React from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';
import { useAppContext } from '../context/AppContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isLoading } = useAppContext(); // Use isLoading from context

    if (isLoading) { // Use the app's global loading state
        return (
            <div className="flex justify-center items-center h-screen bg-brand-bg">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!user || (user.role !== 'admin' && !user.isSuperAdmin)) {
        // No need for a toast here, as it might show up unnecessarily on page load for non-admins.
        // The redirect is sufficient.
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;