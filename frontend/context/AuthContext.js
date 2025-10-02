"use client";

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({
                        role: decodedToken.role,
                        fullName: decodedToken.full_name,
                    });
                }
            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('auth/token/', { username, password });
            const { access: token } = response.data;

            localStorage.setItem('authToken', token);

            const decodedToken = jwtDecode(token);
            const userData = {
                role: decodedToken.role,
                fullName: decodedToken.full_name,
            };
            setUser(userData);
            // Redirect based on role
            switch (userData.role) {
                case 'instructor':
                    router.push('/dashboard/instructor');
                    break;
                case 'student':
                    router.push('/dashboard/student');
                    break;
                case 'admin':
                    router.push('/dashboard/admin');
                    break;
                default:
                    router.push('/login');
            }
            // Retraso para que el spinner sea visible durante la transición
            setTimeout(() => {
                setLoading(false);
            }, 500);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            console.error(err);
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('auth/register/student/', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setLoading(false);
            router.push('/login?registration=success');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = 'Failed to register: ';
                for (const key in errorData) {
                    if (Array.isArray(errorData[key])) {
                        errorMessage += `${key}: ${errorData[key].join(', ')} `;
                    } else {
                        errorMessage += `${key}: ${errorData[key]} `;
                    }
                }
                setError(errorMessage.trim());
            } else {
                setError('Failed to register. Please check the provided data.');
            }
            setLoading(false);
        }
    };

    const logout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            setUser(null);
            localStorage.removeItem('authToken');
            router.push('/login');
        }, 300);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, isSidebarOpen, toggleSidebar, loggingOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;