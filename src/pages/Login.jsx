import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
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
            const response = await api.post('/auth/login', formData);
            const { token, role } = response.data;
            login(token, role);
            if (role === 'DRIVER') navigate('/driver-dashboard');
            else if (role === 'PASSENGER') navigate('/passenger-dashboard');
            else if (role === 'ADMIN') navigate('/admin-dashboard');
            else setError('Unknown role');
        } catch (err) {
            if (err.response) {
                if (err.response.status === 403) setError('Access Denied: Your account has been blocked.');
                else if (err.response.status === 401) setError('Invalid credentials.');
                else setError('Login failed. Please try again.');
            } else {
                setError('Network error. Please try again later.');
            }
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

                    {error && <div className={styles.errorAlert}>{error}</div>}

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
