import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import { cancelPublishedRide, getRidePassengers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './DriverDashboard.module.css';
import { Plus, Calendar, Clock, MapPin, Users, XCircle, List, History, CheckCircle } from 'lucide-react';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'

    // Passenger Modal State
    const [passengerModal, setPassengerModal] = useState({ show: false, passengers: [], rideId: null });
    const [loadingPassengers, setLoadingPassengers] = useState(false);

    // Ensure safe access to verification status
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
            fetchRides(); // Refresh list to update status
        } catch (err) {
            alert(err.message);
        }
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

    // Filter Logic
    const upcomingRides = rides.filter(r => r.status === 'AVAILABLE' || r.status === 'IN_PROGRESS' || r.status === 'FULL');
    const historyRides = rides.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'CANCELLED_BY_ADMIN' || r.status === 'CANCELLED_BY_DRIVER');

    const renderRideList = (rideList) => (
        <div className={styles.ridesGrid}>
            {rideList.map((ride) => (
                <div key={ride.id} className={styles.rideCard}>
                    <div className={`${styles.statusBadge} ${styles[ride.status]}`}>
                        {ride.status ? ride.status.replace(/_/g, ' ') : 'AVAILABLE'}
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
                            <Calendar size={16} className={styles.icon} />
                            {ride.travelDate}
                        </div>
                        <div className={styles.detailItem}>
                            <Clock size={16} className={styles.icon} />
                            {ride.travelTime}
                        </div>
                        <div className={styles.detailItem}>
                            <Users size={16} className={styles.icon} />
                            {(ride.availableSeats)} Seats
                        </div>
                    </div>

                    <div className={styles.priceTag}>
                        ₹{ride.pricePerSeat} / seat
                    </div>

                    <div className={styles.actions}>
                        <Button
                            variant="outline"
                            className={styles.viewBtn}
                            onClick={() => openPassengerList(ride.id)}
                        >
                            <List size={16} style={{ marginRight: '5px' }} /> Passengers
                        </Button>

                        {/* Only show Cancel for Upcoming/Active rides */}
                        {activeTab === 'upcoming' && (
                            <Button
                                variant="outline"
                                onClick={() => handleCancelRide(ride.id)}
                                className={styles.cancelBtn}
                                style={{ borderColor: '#dc3545', color: '#dc3545' }}
                            >
                                <XCircle size={16} style={{ marginRight: '5px' }} /> Cancel
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

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
                    <div className={styles.sideNav}>
                        {isVerified && (
                            <div className={styles.verifiedBadge}>Verified Driver</div>
                        )}
                        <Link to="/post-ride">
                            <Button disabled={!isVerified}>
                                <Plus size={18} style={{ marginRight: '8px' }} /> Post Ride
                            </Button>
                        </Link>
                        <Link to="/driver-history">
                            <Button variant="outline">View Earnings</Button>
                        </Link>
                    </div>


                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.active : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <Calendar size={18} style={{ marginRight: '5px' }} /> Upcoming
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={18} style={{ marginRight: '5px' }} /> History
                    </button>
                </div>

                <div className={styles.ridesSection}>
                    {loading ? (
                        <p>Loading rides...</p>
                    ) : (
                        activeTab === 'upcoming' ? (
                            upcomingRides.length === 0 ?
                                <div className={styles.emptyState}><p>No upcoming rides.</p></div> :
                                renderRideList(upcomingRides)
                        ) : (
                            historyRides.length === 0 ?
                                <div className={styles.emptyState}><p>No past rides.</p></div> :
                                renderRideList(historyRides)
                        )
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
                                            <span className={styles.pEmail}>{p.email}</span>
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