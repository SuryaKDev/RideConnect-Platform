import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');
        const isVerified = localStorage.getItem('userVerified') === 'true'; // Retrieve verification status
        if (token) {
            setUser({ token, role, name, email, isVerified });
        }
        setLoading(false);
    }, []);

    const login = (token, role, name, email, isVerified) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        if (name) localStorage.setItem('userName', name);
        if (email) localStorage.setItem('userEmail', email);
        localStorage.setItem('userVerified', isVerified); // Store verification status
        setUser({ token, role, name, email, isVerified });
    };

    const logout = async () => {
        try {
            // Call the logout endpoint to blacklist the token
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with local cleanup even if API fails
        } finally {
            // Always clear local storage and state
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userVerified');
            setUser(null);
        }
    };

    const updateUser = (updates) => {
        setUser((prevUser) => {
            const newUser = { ...prevUser, ...updates };
            if (updates.name) localStorage.setItem('userName', updates.name);
            if (updates.email) localStorage.setItem('userEmail', updates.email);
            if (updates.isVerified !== undefined) localStorage.setItem('userVerified', updates.isVerified);
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
