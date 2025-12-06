import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Profile.module.css';

const Profile = () => {
    const navigate = useNavigate();
    const { user: authUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State for form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        vehicleModel: '',
        licensePlate: '',
        vehicleCapacity: '',
        currentPassword: '',
        newPassword: ''
    });

    // Fetch User Data on Mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getProfile();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    role: data.role || '',
                    vehicleModel: data.vehicleModel || '',
                    licensePlate: data.licensePlate || '',
                    vehicleCapacity: data.vehicleCapacity || '',
                    currentPassword: '',
                    newPassword: ''
                });
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        // Construct payload (only send necessary fields)
        const payload = {
            name: formData.name,
            phone: formData.phone,
        };

        // Add password fields if changing
        if (formData.newPassword) {
            payload.currentPassword = formData.currentPassword;
            payload.newPassword = formData.newPassword;
        }

        // Add vehicle fields only for drivers
        if (formData.role === 'DRIVER') {
            payload.vehicleModel = formData.vehicleModel;
            payload.licensePlate = formData.licensePlate;
            payload.vehicleCapacity = parseInt(formData.vehicleCapacity);
        }

        try {
            await updateProfile(payload);
            // Update local context
            updateUser({ name: formData.name });

            // Redirect to home with success message
            navigate('/', { state: { message: 'Profile updated successfully!', type: 'success' } });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Update failed.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading profile...</div>;

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                <div className={styles.profileCard}>
                    <h1>Edit Profile</h1>

                    {message.text && (
                        <div className={`${styles.alert} ${message.type === 'error' ? styles.error : styles.success}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Read-Only Identity Fields */}
                        <div className={styles.formGroup}>
                            <label>Email (Cannot be changed)</label>
                            <input type="text" value={formData.email} disabled className={styles.disabledInput} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <input type="text" value={formData.role} disabled className={styles.disabledInput} />
                        </div>

                        {/* Editable Basic Info */}
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        {/* Driver Specific Fields */}
                        {formData.role === 'DRIVER' && (
                            <div className={styles.driverSection}>
                                <h3>Vehicle Details</h3>
                                <Input
                                    label="Vehicle Model"
                                    name="vehicleModel"
                                    value={formData.vehicleModel}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="License Plate"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Vehicle Capacity"
                                    name="vehicleCapacity"
                                    type="number"
                                    value={formData.vehicleCapacity}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {/* Password Change Section */}
                        <div className={styles.passwordSection}>
                            <h3>Change Password <span className={styles.optional}>(Optional)</span></h3>
                            <Input
                                label="New Password"
                                name="newPassword"
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            {formData.newPassword && (
                                <Input
                                    label="Current Password (Required to save changes)"
                                    name="currentPassword"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                        </div>

                        <Button type="submit" disabled={updating}>
                            {updating ? 'Saving...' : 'Update Profile'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;