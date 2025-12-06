import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        const isVerified = localStorage.getItem('userVerified') === 'true'; // Retrieve verification status
        if (token) {
            setUser({ token, role, name, isVerified });
        }
        setLoading(false);
    }, []);

    const login = (token, role, name, isVerified) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        if (name) localStorage.setItem('userName', name);
        localStorage.setItem('userVerified', isVerified); // Store verification status
        setUser({ token, role, name, isVerified });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        setUser(null);
    };

    const updateUser = (updates) => {
        setUser((prevUser) => {
            const newUser = { ...prevUser, ...updates };
            if (updates.name) localStorage.setItem('userName', updates.name);
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
