import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { postRide } from '../../services/api';
import styles from './PostRide.module.css';

const PostRide = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        source: '',
        destination: '',
        stopovers: '', // NEW: Stopovers field
        date: '',
        time: '',
        seats: 3,
        price: '' // Changed to string to allow empty value
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            source: formData.source,
            destination: formData.destination,
            stopovers: formData.stopovers, // Include stopovers in payload
            travelDate: formData.date,
            travelTime: formData.time + ":00", // Format time for backend (HH:mm:ss)
            availableSeats: parseInt(formData.seats),
            // If price is empty or 0, backend handles calculation
            pricePerSeat: formData.price ? parseFloat(formData.price) : 0 
        };

        try {
            await postRide(payload);
            navigate('/driver-dashboard');
        } catch (err) {
            setError('Failed to post ride. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                <div className={styles.formContainer}>
                    <h1>Post a New Ride</h1>
                    <p className={styles.subtitle}>Share your journey and earn.</p>

                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.row}>
                            <Input label="Source" id="source" name="source" placeholder="e.g. Chennai" value={formData.source} onChange={handleChange} required />
                            <Input label="Destination" id="destination" name="destination" placeholder="e.g. Bangalore" value={formData.destination} onChange={handleChange} required />
                        </div>

                        {/* Stopovers Field */}
                        <Input 
                            label="Stopovers (Optional)" 
                            id="stopovers" 
                            name="stopovers" 
                            placeholder="e.g. Kanchipuram, Vellore, Ambur" 
                            value={formData.stopovers} 
                            onChange={handleChange} 
                        />

                        <div className={styles.row}>
                            <Input label="Date" id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                            <Input label="Time" id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
                        </div>

                        <div className={styles.row}>
                            <Input label="Available Seats" id="seats" name="seats" type="number" min="1" max="10" value={formData.seats} onChange={handleChange} required />
                            <Input 
                                label="Price Per Seat (₹)" 
                                id="price" 
                                name="price" 
                                type="number" 
                                min="0" 
                                placeholder="Leave 0 for auto-calc"
                                value={formData.price} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className={styles.actions}>
                            <Button type="button" variant="outline" onClick={() => navigate('/driver-dashboard')}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Publishing...' : 'Publish Ride'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostRide;