import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        const timeout = setTimeout(() => {
            navigate('/login');
        }, 1000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white shadow-md rounded-xl p-8 text-center">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">You have been logged out</h1>
                <p className="text-gray-600 mb-6">Logging out was successful. Redirecting you to the login page...</p>
                <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                    Logging out
                </div>
            </div>
        </div>
    );
};

export default Logout;
