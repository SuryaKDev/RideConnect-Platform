import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const role = localStorage.getItem('userRole'); // We might store role separately or decode it
        if (token) {
            // In a real app, we might validate the token with an API call here
            setUser({ token, role });
        }
        setLoading(false);
    }, []);

    const login = (token, role) => {
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('userRole', role);
        setUser({ token, role });
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
