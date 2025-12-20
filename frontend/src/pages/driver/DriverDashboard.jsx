import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from './DriverDashboard.module.css';
import { Plus, Calendar, Clock, MapPin, Users, XCircle, List, AlertCircle } from 'lucide-react';
import { cancelPublishedRide, getRidePassengers } from '../../services/api';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Passenger Modal State
    const [passengerModal, setPassengerModal] = useState({ show: false, passengers: [], rideId: null });
    const [loadingPassengers, setLoadingPassengers] = useState(false);

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

    const handleCancelRide = async (rideId) => {
        if (!window.confirm("Are you sure? This will cancel bookings for all passengers.")) return;
        try {
            await cancelPublishedRide(rideId);
            alert("Ride Cancelled");
            fetchRides();
        } catch (err) { alert(err.message); }
    };

    const openPassengerList = async (rideId) => {
        setLoadingPassengers(true);
        setPassengerModal({ show: true, passengers: [], rideId });
        try {
            const list = await getRidePassengers(rideId);
            setPassengerModal({ show: true, passengers: list, rideId });
        } catch (err) {
            alert("Failed to load passengers: " + err.message);
            setPassengerModal({ show: false, passengers: [], rideId: null });
        } finally {
            setLoadingPassengers(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                {!isVerified && (
                    <div className={styles.verificationBanner}>⚠️ Your account is pending Admin verification.</div>
                )}

                <div className={styles.header}>
                    <h1>Driver Dashboard</h1>
                    <div className={styles.button}>
                        <Link to="/post-ride"><Button disabled={!isVerified}><Plus size={18} /> Post Ride</Button></Link>
                        <Link to="/driver-history">
                            <Button variant="outline">View Earnings</Button>
                        </Link>
                    </div>
                </div>

                <div className={styles.ridesSection}>
                    <h2>Your Upcoming Rides</h2>
                    {loading ? <p>Loading...</p> : (
                        <div className={styles.ridesGrid}>
                            {rides.map((ride) => {
                                const isCancelledByAdmin = ride.status === 'CANCELLED_BY_ADMIN';
                                const isCancelled = ride.status === 'CANCELLED' || isCancelledByAdmin;

                                return (
                                    <div key={ride.id} className={styles.rideCard}>
                                        <div className={styles.statusBadge}>{ride.status || 'AVAILABLE'}</div>
                                        <div className={styles.route}>
                                            <div className={styles.location}><MapPin size={16} /> {ride.source}</div>
                                            <div className={styles.connector}></div>
                                            <div className={styles.location}><MapPin size={16} /> {ride.destination}</div>
                                        </div>
                                        <div className={styles.details}>
                                            <div className={styles.detailItem}><Calendar size={16} /> {ride.travelDate}</div>
                                            <div className={styles.detailItem}><Clock size={16} /> {ride.travelTime}</div>
                                        </div>

                                        {/* Show admin cancellation reason if ride was cancelled by admin */}
                                        {isCancelledByAdmin && ride.cancellationReason && (
                                            <div className={styles.cancellationNotice}>
                                                <AlertCircle size={16} style={{ color: '#dc3545', marginRight: '8px' }} />
                                                <div>
                                                    <strong>Cancelled by Admin:</strong>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9em' }}>{ride.cancellationReason}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Only show action buttons if ride is not cancelled by admin */}
                                        {!isCancelledByAdmin && (
                                            <div className={styles.actions}>
                                                <Button
                                                    variant="outline"
                                                    className={styles.viewBtn}
                                                    onClick={() => openPassengerList(ride.id)}
                                                >
                                                    <List size={16} style={{ marginRight: '5px' }} /> Passengers
                                                </Button>

                                                {!isCancelled && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleCancelRide(ride.id)}
                                                        style={{ borderColor: '#dc3545', color: '#dc3545' }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Passenger List Modal */}
            {passengerModal.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Passenger List (Ride #{passengerModal.rideId})</h3>
                            <button onClick={() => setPassengerModal({ show: false, passengers: [] })} className={styles.closeBtn}>&times;</button>
                        </div>

                        {loadingPassengers ? <p>Loading...</p> : passengerModal.passengers.length === 0 ? (
                            <p className={styles.emptyText}>No passengers have booked this ride yet.</p>
                        ) : (
                            <ul className={styles.passengerList}>
                                {passengerModal.passengers.map((p, idx) => (
                                    <li key={idx} className={styles.passengerItem}>
                                        <div className={styles.pInfo}>
                                            <span className={styles.pName}>{p.name}</span>
                                            <span className={styles.pContact}>{p.phone}</span>
                                        </div>
                                        <div className={styles.pMeta}>
                                            <span className={styles.pSeats}>{p.seatsBooked} Seat(s)</span>
                                            <span className={`${styles.pStatus} ${styles[p.bookingStatus]}`}>{p.bookingStatus}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;