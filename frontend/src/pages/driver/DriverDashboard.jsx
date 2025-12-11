import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { cancelPublishedRide } from '../../services/api'; // Import cancel
import { useAuth } from '../../context/AuthContext';
import styles from './DriverDashboard.module.css';
import { Plus, Calendar, Clock, MapPin, Users, XCircle } from 'lucide-react';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    const isVerified = user?.isVerified === true;

    const fetchRides = async () => {
        try {
            const response = await api.get('/rides/my-rides');
            setRides(response.data || []);
        } catch (error) {
            console.error('Failed to fetch rides', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
    }, []);

    // NEW: Handle Cancel Ride
    const handleCancelRide = async (rideId) => {
        if (!window.confirm("Are you sure? This will cancel bookings for all passengers.")) return;
        try {
            await cancelPublishedRide(rideId);
            alert("Ride Cancelled");
            fetchRides(); // Refresh list
        } catch (err) {
            alert(err.message);
        }
    };

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
                        <div className={styles.verifiedBadge}>Verified Driver</div>
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
                                    <div className={styles.statusBadge} 
                                         style={{
                                             backgroundColor: ride.status === 'CANCELLED_BY_ADMIN' ? '#dc3545' : 
                                                             ride.status === 'CANCELLED' ? '#f8d7da' : '#d4edda', 
                                             color: ride.status === 'CANCELLED_BY_ADMIN' ? '#ffffff' : 
                                                    ride.status === 'CANCELLED' ? '#721c24' : '#155724',
                                             width: 'fit-content', padding: '4px 10px', borderRadius: '4px', 
                                             fontSize: '0.8rem', marginBottom: '8px', fontWeight: '600'
                                         }}>
                                        {ride.status === 'CANCELLED_BY_ADMIN' ? 'CANCELLED BY ADMIN' : (ride.status || 'AVAILABLE')}
                                    </div>

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
                                            <Calendar size={16} className={styles.icon} /> {ride.travelDate || ride.date}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Clock size={16} className={styles.icon} /> {ride.travelTime || ride.time}
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Users size={16} className={styles.icon} />
                                            {(ride.availableSeats || ride.seats)} Seats
                                        </div>
                                    </div>

                                    <div className={styles.priceTag}>
                                        ₹{ride.pricePerSeat || ride.price} / seat
                                    </div>

                                    {/* Action Buttons - Hide cancel button if ride is cancelled or cancelled by admin */}
                                    {ride.status !== 'CANCELLED' && ride.status !== 'CANCELLED_BY_ADMIN' && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleCancelRide(ride.id)}
                                            style={{marginTop: '10px', width: '100%', borderColor: '#dc3545', color: '#dc3545'}}
                                        >
                                            <XCircle size={16} style={{marginRight: '5px'}}/> Cancel Ride
                                        </Button>
                                    )}
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