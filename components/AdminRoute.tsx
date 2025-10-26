import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';
import { useAppContext } from '../context/AppContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, addToast } = useAppContext();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                if (user?.walletAddress) {
                    const adminRef = doc(db, "admins", user.walletAddress.toLowerCase());
                    const adminDoc = await getDoc(adminRef);
                    if (adminDoc.exists()) {
                        setIsAdmin(true);
                    } else {
                        addToast("You don't have permission to access this page.", 'error');
                        setIsAdmin(false);
                    }
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                addToast("An error occurred while checking admin status.", 'error');
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        // Delay check slightly to allow user context to populate
        const timer = setTimeout(() => {
            checkAdminStatus();
        }, 500);

        return () => clearTimeout(timer);
    }, [user, addToast]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-brand-bg">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
