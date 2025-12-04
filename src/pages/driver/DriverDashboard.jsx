import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from './DriverDashboard.module.css';
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock verification status if not present in user object (for demo)
    const isVerified = user?.isVerified !== false; // Default to true if undefined for now, or check backend logic

    useEffect(() => {
        const fetchRides = async () => {
            try {
                // const response = await api.get('/rides/my-rides'); // API endpoint
                // setRides(response.data);

                // Mock Data for Demo
                setRides([
                    { id: 1, source: 'Chennai', destination: 'Bangalore', date: '2023-10-25', time: '08:00 AM', seats: 3, price: 500 },
                    { id: 2, source: 'Coimbatore', destination: 'Chennai', date: '2023-10-28', time: '06:00 AM', seats: 2, price: 800 },
                ]);
            } catch (error) {
                console.error('Failed to fetch rides', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <div className="container">
                {!isVerified && (
                    <div className={styles.verificationBanner}>
                        ⚠️ Your account is pending Admin verification. You cannot post rides yet.
                    </div>
                )}

                <div className={styles.header}>
                    <div>
                        <h1>Driver Dashboard</h1>
                        <p className={styles.subHeader}>Manage your rides and bookings</p>
                    </div>
                    {isVerified && (
                        <Link to="/post-ride">
                            <Button>
                                <Plus size={18} style={{ marginRight: '8px' }} />
                                Post a New Ride
                            </Button>
                        </Link>
                    )}
                </div>

                <div className={styles.ridesSection}>
                    <h2>Your Upcoming Rides</h2>

                    {loading ? (
                        <p>Loading rides...</p>
                    ) : rides.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>You haven't posted any rides yet.</p>
                        </div>
                    ) : (
                        <div className={styles.ridesGrid}>
                            {rides.map((ride) => (
                                <div key={ride.id} className={styles.rideCard}>
                                    <div className={styles.route}>
                                        <div className={styles.location}>
                                            <MapPin size={16} className={styles.icon} />
                                            <span>{ride.source}</span>
                                        </div>
                                        <div className={styles.connector}></div>
                                        <div className={styles.location}>
                                            <MapPin size={16} className={styles.icon} />
                                            <span>{ride.destination}</span>
                                        </div>
                                    </div>

                                    <div className={styles.details}>
                                        <div className={styles.detailItem}>
                                            <Calendar size={16} className={styles.icon} />
                                            {ride.date}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Clock size={16} className={styles.icon} />
                                            {ride.time}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Users size={16} className={styles.icon} />
                                            {ride.seats} Seats
                                        </div>
                                    </div>

                                    <div className={styles.priceTag}>
                                        ₹{ride.price} / seat
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
