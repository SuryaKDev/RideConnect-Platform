import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Login.module.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginUser(formData.email, formData.password);
            const { token } = data;

            // Prioritize data from response body, fallback to decoding token
            let role = data.role;
            let name = data.name || data.user?.name;
            let email = data.email || data.user?.email || formData.email;

            if (token) {
                try {
                    // Decode the JWT payload (Base64 decode the middle part)
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    // If backend didn't send role in body, grab from token
                    if (!role) {
                        role = payload.role || payload.authorities?.[0] || 'PASSENGER';
                        if (role.startsWith('ROLE_')) role = role.replace('ROLE_', '');
                    }

                    // If backend didn't send name in body, grab from token claims
                    if (!name) {
                        // We added "name" key in JwtUtil.java
                        name = payload.name || payload.sub;
                    }

                    // If backend didn't send email, grab from token or use login email
                    if (!email) {
                        email = payload.email || payload.sub || formData.email;
                    }

                    console.log("Decoded User:", { name, email, role });
                } catch (e) {
                    console.error("Failed to decode token", e);
                }
            }

            // Extract verification status with explicit handling
            // If data.isVerified is undefined (e.g. for Passenger), default to false
            const isVerified = data.isVerified !== undefined ? data.isVerified : (data.user?.isVerified !== undefined ? data.user.isVerified : false);

            // Update Global Auth Context
            login(token, role, name, email, isVerified);

            // Redirect to Home Page
            navigate('/');

        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                        <h2>Welcome Back</h2>
                        <p>Login to continue to RideConnect</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && <div className={styles.errorAlert}>{error}</div>}

                        <Button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <p className={styles.footerText}>
                        Don't have an account? <Link to="/register" className={styles.link}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;