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

    // Correct verification check
    const isVerified = user?.isVerified === true;

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await api.get('/rides/my-rides');
                setRides(response.data || []);
            } catch (error) {
                console.error('Failed to fetch rides', error);
                // Fallback to mock data if API fails
                setRides([
                    { id: 1, source: 'Chennai', destination: 'Bangalore', travelDate: '2023-10-25', travelTime: '08:00:00', availableSeats: 3, pricePerSeat: 500 },
                    { id: 2, source: 'Coimbatore', destination: 'Chennai', travelDate: '2023-10-28', travelTime: '06:00:00', availableSeats: 2, pricePerSeat: 800 },
                ]);
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
                        ⚠️ Your account is pending Admin verification.
                    </div>
                )}

                <div className={styles.header}>
                    <div>
                        <h1>Driver Dashboard</h1>
                        <p className={styles.subHeader}>Manage your rides and bookings</p>
                    </div>
                    {isVerified && (
                        <div className={styles.verifiedBadge}>
                            Verified Driver
                        </div>
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
                                            {ride.travelDate || ride.date}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Clock size={16} className={styles.icon} />
                                            {ride.travelTime || ride.time}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Users size={16} className={styles.icon} />
                                            {(ride.availableSeats || ride.seats) > 0
                                                ? `${ride.availableSeats || ride.seats} Seats`
                                                : <span style={{ color: 'red', fontWeight: 'bold' }}>Booked</span>}
                                        </div>
                                    </div>

                                    <div className={styles.priceTag}>
                                        ₹{ride.pricePerSeat || ride.price} / seat
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
