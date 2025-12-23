import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { cancelPublishedRide, getRidePassengers, getMyRides, acceptBookingRequest, rejectBookingRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './DriverDashboard.module.css';
import { Plus, Calendar, Clock, MapPin, Users, XCircle, List, History, Check, X, Wallet } from 'lucide-react';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); 
    
    const [passengerModal, setPassengerModal] = useState({ show: false, passengers: [], rideId: null });
    const [loadingPassengers, setLoadingPassengers] = useState(false);

    // Verify user status safely
    const isVerified = user?.isVerified === true;

    const fetchRides = async () => {
        try {
            const data = await getMyRides(); 
            setRides(data || []);
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

    const handleAccept = async (bookingId) => {
        try {
            await acceptBookingRequest(bookingId);
            alert("Booking Accepted!");
            // Refresh passenger list to show updated status
            const list = await getRidePassengers(passengerModal.rideId);
            setPassengerModal(prev => ({ ...prev, passengers: list }));
        } catch (err) { alert(err.message); }
    };

    const handleReject = async (bookingId) => {
        if(!window.confirm("Reject this passenger?")) return;
        try {
            await rejectBookingRequest(bookingId);
            alert("Booking Rejected");
            // Refresh passenger list to show updated status
            const list = await getRidePassengers(passengerModal.rideId);
            setPassengerModal(prev => ({ ...prev, passengers: list }));
        } catch (err) { alert(err.message); }
    };

    const upcomingRides = rides.filter(r => ['AVAILABLE', 'IN_PROGRESS', 'FULL'].includes(r.status));
    const historyRides = rides.filter(r => ['COMPLETED', 'CANCELLED', 'CANCELLED_BY_ADMIN', 'CANCELLED_BY_DRIVER'].includes(r.status));

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
                            <Calendar size={16} className={styles.icon} /> {ride.travelDate}
                        </div>
                        <div className={styles.detailItem}>
                            <Clock size={16} className={styles.icon} /> {ride.travelTime}
                        </div>
                        <div className={styles.detailItem}>
                            <Users size={16} className={styles.icon} /> {ride.availableSeats} Seats
                        </div>
                    </div>

                    <div className={styles.priceTag}>₹{ride.pricePerSeat} / seat</div>
                    
                    <div className={styles.actions}>
                        <Button variant="outline" className={styles.viewBtn} onClick={() => openPassengerList(ride.id)}>
                            <List size={16} style={{marginRight: '5px'}}/> Passengers
                        </Button>

                        {activeTab === 'upcoming' && (
                            <Button variant="outline" onClick={() => handleCancelRide(ride.id)} className={styles.cancelBtn} style={{borderColor: '#dc3545', color: '#dc3545'}}>
                                <XCircle size={16} style={{marginRight: '5px'}}/> Cancel
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
                {!isVerified && <div className={styles.verificationBanner}>⚠️ Your account is pending Admin verification.</div>}

                <div className={styles.header}>
                    <div>
                        <h1>Driver Dashboard</h1>
                        <p className={styles.subHeader}>Manage your rides and bookings</p>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        {isVerified && <div className={styles.verifiedBadge}>Verified</div>}
                        
                        {/* VIEW EARNINGS BUTTON */}
                        <Link to="/driver-history">
                            <Button variant="outline" style={{borderColor: '#0f4c81', color: '#0f4c81', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <Wallet size={18} /> View Earnings
                            </Button>
                        </Link>

                        <Link to="/post-ride">
                            <Button disabled={!isVerified}>
                                <Plus size={18} style={{ marginRight: '8px' }} /> Post Ride
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.active : ''}`} onClick={() => setActiveTab('upcoming')}>
                        <Calendar size={18} style={{marginRight: '5px'}} /> Upcoming
                    </button>
                    <button className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`} onClick={() => setActiveTab('history')}>
                        <History size={18} style={{marginRight: '5px'}} /> History
                    </button>
                </div>

                <div className={styles.ridesSection}>
                    {loading ? <p>Loading...</p> : (
                        activeTab === 'upcoming' ? 
                            (upcomingRides.length === 0 ? <div className={styles.emptyState}>No upcoming rides.</div> : renderRideList(upcomingRides)) : 
                            (historyRides.length === 0 ? <div className={styles.emptyState}>No past rides.</div> : renderRideList(historyRides))
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
                        {loadingPassengers ? <p>Loading...</p> : passengerModal.passengers.length === 0 ? <p className={styles.emptyText}>No passengers yet.</p> : (
                            <ul className={styles.passengerList}>
                                {passengerModal.passengers.map((p, idx) => (
                                    <li key={idx} className={styles.passengerItem}>
                                        <div className={styles.pInfo}>
                                            <span className={styles.pName}>{p.name}</span>
                                            <span className={styles.pContact}>{p.phone}</span>
                                        </div>
                                        <div className={styles.pMeta}>
                                            <span className={styles.pSeats}>{p.seatsBooked} Seat(s)</span>
                                            <span className={`${styles.pStatus} ${styles[p.bookingStatus]}`}>{p.bookingStatus.replace('_', ' ')}</span>
                                            
                                            {/* Accept/Reject Buttons */}
                                            {p.bookingStatus === 'PENDING_APPROVAL' && (
                                                <div style={{display:'flex', gap:'5px', marginTop:'8px'}}>
                                                    <Button size="sm" onClick={() => handleAccept(p.bookingId)} style={{padding:'4px 8px', fontSize:'0.7rem', backgroundColor:'#28a745'}}>
                                                       <Check size={14} style={{marginRight:'2px'}}/> Accept
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleReject(p.bookingId)} style={{padding:'4px 8px', fontSize:'0.7rem', backgroundColor:'#dc3545', borderColor:'#dc3545'}}>
                                                       <X size={14} style={{marginRight:'2px'}}/> Reject
                                                    </Button>
                                                </div>
                                            )}
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