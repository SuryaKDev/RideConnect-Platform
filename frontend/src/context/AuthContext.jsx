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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userVerified');
        setUser(null);
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
