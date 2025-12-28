import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getMyReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; 
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Profile.module.css'; 
import { Star } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [reviews, setReviews] = useState([]); // State for reviews

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

    // Fetch User Data & Reviews on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const profileData = await getProfile();
                setFormData({
                    name: profileData.name || '',
                    email: profileData.email || '',
                    phone: profileData.phone || '',
                    role: profileData.role || '',
                    vehicleModel: profileData.vehicleModel || '',
                    licensePlate: profileData.licensePlate || '',
                    vehicleCapacity: profileData.vehicleCapacity || '',
                    currentPassword: '', 
                    newPassword: ''      
                });

                // 2. Fetch Reviews
                const reviewData = await getMyReviews();
                setReviews(reviewData || []);

            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load profile data.' });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        const payload = {
            name: formData.name,
            phone: formData.phone,
        };

        if (formData.newPassword) {
            payload.currentPassword = formData.currentPassword;
            payload.newPassword = formData.newPassword;
        }

        if (formData.role === 'DRIVER') {
            payload.vehicleModel = formData.vehicleModel;
            payload.licensePlate = formData.licensePlate;
            payload.vehicleCapacity = parseInt(formData.vehicleCapacity);
        }

        try {
            await updateProfile(payload);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Update failed.' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="container" style={{padding: '2rem'}}>Loading profile...</div>;

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
                        <div className={styles.formGroup}>
                            <label>Email (Cannot be changed)</label>
                            <input type="text" value={formData.email} disabled className={styles.disabledInput} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <input type="text" value={formData.role} disabled className={styles.disabledInput} />
                        </div>

                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />

                        {formData.role === 'DRIVER' && (
                            <div className={styles.driverSection}>
                                <h3>Vehicle Details</h3>
                                <Input label="Vehicle Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} />
                                <Input label="License Plate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} />
                                <Input label="Vehicle Capacity" name="vehicleCapacity" type="number" value={formData.vehicleCapacity} onChange={handleChange} />
                            </div>
                        )}

                        <div className={styles.passwordSection}>
                            <h3>Change Password <span className={styles.optional}>(Optional)</span></h3>
                            <Input label="New Password" name="newPassword" type="password" placeholder="Leave blank to keep current" value={formData.newPassword} onChange={handleChange} />
                            {formData.newPassword && (
                                <Input label="Current Password (Required)" name="currentPassword" type="password" placeholder="Enter current password" value={formData.currentPassword} onChange={handleChange} required />
                            )}
                        </div>

                        <Button type="submit" disabled={updating}>
                            {updating ? 'Saving...' : 'Update Profile'}
                        </Button>
                    </form>

                    {/* REVIEWS SECTION */}
                    <div className={styles.reviewsSection}>
                        <h2>My Reviews ({reviews.length})</h2>
                        <div className={styles.reviewList}>
                            {reviews.length === 0 ? <p className={styles.noReviews}>No reviews yet.</p> : reviews.map(r => (
                                <div key={r.id} className={styles.reviewItem}>
                                    <div className={styles.reviewHeader}>
                                        <strong>{r.reviewer?.name || 'Anonymous'}</strong>
                                        <div className={styles.starRow}>
                                            {Array(r.rating).fill().map((_, i) => (
                                                <Star key={i} size={14} fill="#ffc107" color="#ffc107"/>
                                            ))}
                                        </div>
                                    </div>
                                    <p className={styles.comment}>"{r.comment}"</p>
                                    <small className={styles.date}>
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;