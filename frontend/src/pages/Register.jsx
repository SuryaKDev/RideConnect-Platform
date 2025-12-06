import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Register.module.css';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('PASSENGER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicleModel: '',
        licensePlate: '',
        vehicleCapacity: 4
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = { ...formData, role };

        // Remove vehicle fields if Passenger
        if (role === 'PASSENGER') {
            delete payload.vehicleModel;
            delete payload.licensePlate;
            delete payload.vehicleCapacity;
        }

        try {
            await registerUser(payload);
            alert('Registration Successful! Please Login.');
            navigate('/login');
        } catch (err) {
            if (err.message) {
                setError(err.message);
            } else {
                setError('Registration failed. Please try again.');
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
                        <h2>Create Account</h2>
                        <p className={styles.subtitle}>Sign up to get started with RideConnect</p>
                    </div>

                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <div className={styles.roleToggle}>
                        <button
                            type="button"
                            className={`${styles.roleBtn} ${role === 'PASSENGER' ? styles.active : ''}`}
                            onClick={() => setRole('PASSENGER')}
                        >
                            Passenger
                        </button>
                        <button
                            type="button"
                            className={`${styles.roleBtn} ${role === 'DRIVER' ? styles.active : ''}`}
                            onClick={() => setRole('DRIVER')}
                        >
                            Driver
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Input label="Full Name" id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                        <Input label="Email" id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                        <Input label="Password" id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        <Input label="Phone Number" id="phone" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} required />

                        {role === 'DRIVER' && (
                            <div className={styles.driverFields}>
                                <h3 className={styles.sectionTitle}>Vehicle Details</h3>
                                <Input label="Vehicle Model" id="vehicleModel" name="vehicleModel" placeholder="Swift Dzire" value={formData.vehicleModel} onChange={handleChange} required />
                                <Input label="License Plate" id="licensePlate" name="licensePlate" placeholder="TN-01-AB-1234" value={formData.licensePlate} onChange={handleChange} required />
                                <Input label="Capacity" id="vehicleCapacity" name="vehicleCapacity" type="number" min="1" max="10" value={formData.vehicleCapacity} onChange={handleChange} required />
                            </div>
                        )}

                        <Button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <p className={styles.footerText}>
                        Already have an account? <Link to="/login" className={styles.link}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
