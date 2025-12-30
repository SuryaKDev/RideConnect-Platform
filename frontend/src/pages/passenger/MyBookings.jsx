import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/PaymentModal'; 
import ReviewModal from '../../components/ReviewModal';
import UserProfileModal from '../../components/UserProfileModal';
import LocalToast from '../../components/LocalToast';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../utils/useToast';
import { getMyBookings, cancelBooking } from '../../services/api';
import styles from './MyBookings.module.css';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, CreditCard, XCircle, History, Clock3, Star, Receipt } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentBooking, setPaymentBooking] = useState(null); 
    const [reviewBooking, setReviewBooking] = useState(null);
    const [viewProfileId, setViewProfileId] = useState(null); 
    const [activeTab, setActiveTab] = useState('upcoming');
    const { toasts, showToast, removeToast } = useToast();
    const [confirmModal, setConfirmModal] = useState({ 
        show: false, 
        type: 'warning',
        title: '',
        message: '', 
        onConfirm: null 
    });

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handlePaymentSuccess = () => {
        setPaymentBooking(null); 
        setLoading(true);
        fetchBookings(); 
    };

    const handleReviewSuccess = () => {
        setReviewBooking(null);
        showToast("Review Submitted! Thank you.", "SUCCESS");
        fetchBookings();
    };

    const handleCancel = (id) => {
        setConfirmModal({
            show: true,
            type: 'warning',
            title: 'Cancel Booking',
            message: 'Are you sure you want to cancel this booking?',
            confirmText: 'Cancel Booking',
            onConfirm: async () => {
                try {
                    await cancelBooking(id);
                    showToast("Booking Cancelled", "SUCCESS");
                    fetchBookings();
                } catch (err) {
                    showToast(err.message, "ERROR");
                }
            }
        });
    };

    const handleRefundRequest = () => {
        showToast("Refund request submitted. Refund will be credited within 5-7 working days.", "SUCCESS");
    };

    // Filter Logic
    const upcomingBookings = bookings.filter(b => 
        (b.status === 'PENDING_APPROVAL' || b.status === 'PENDING_PAYMENT' || b.status === 'CONFIRMED') && 
        !b.ride.status.includes('CANCELLED') && 
        b.ride.status !== 'COMPLETED'
    );

    // History: CANCELLED, REFUNDED, COMPLETED, or Admin/Driver Cancelled
    const historyBookings = bookings.filter(b => 
        b.status === 'CANCELLED' || 
        b.status === 'CANCELLED_BY_DRIVER' ||
        b.status === 'REJECTED' ||
        b.status === 'REFUNDED' || 
        b.ride.status === 'COMPLETED' || 
        b.ride.status.includes('CANCELLED')
    );

    const getStatusBadge = (status, rideStatus) => {
        if (rideStatus === 'CANCELLED_BY_ADMIN') return <div className={`${styles.statusBadge} ${styles.CANCELLED}`}><XCircle size={14} /> Ride Cancelled (Admin)</div>;
        if (rideStatus === 'COMPLETED') return <div className={`${styles.statusBadge} ${styles.CONFIRMED}`}><CheckCircle size={14} /> Ride Completed</div>;
        if (status === 'CONFIRMED') return <div className={`${styles.statusBadge} ${styles.CONFIRMED}`}><CheckCircle size={14} /> Confirmed</div>;
        if (status === 'PENDING_APPROVAL') return <div className={`${styles.statusBadge} ${styles.PENDING}`}><Clock3 size={14} /> Awaiting Approval</div>;
        if (status === 'PENDING_PAYMENT') return <div className={`${styles.statusBadge} ${styles.PAYMENT}`}><CreditCard size={14} /> Payment Due</div>;
        if (status === 'REJECTED') return <div className={`${styles.statusBadge} ${styles.CANCELLED}`}><XCircle size={14} /> Rejected</div>;
        if (status.includes('CANCELLED')) return <div className={`${styles.statusBadge} ${styles.CANCELLED}`}><XCircle size={14} /> Cancelled</div>;
        return <div className={styles.statusBadge}>{status}</div>;
    };

    const renderBookings = (list) => (
        <div className={styles.bookingsList}>
            {list.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                    <div className={styles.cardHeader}>
                        {getStatusBadge(booking.status, booking.ride.status)}
                        <span className={styles.bookingId}>ID: #{booking.id}</span>
                    </div>

                    <div className={styles.route}>
                        <div className={styles.location}>
                            <MapPin size={16} className={styles.icon} />
                            <span>{booking.ride.source}</span>
                        </div>
                        <div className={styles.connector}></div>
                        <div className={styles.location}>
                            <MapPin size={16} className={styles.icon} />
                            <span>{booking.ride.destination}</span>
                        </div>
                    </div>

                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <Calendar size={16} /> {booking.ride.travelDate}
                        </div>
                        <div className={styles.detailItem}>
                            <Clock size={16} /> {booking.ride.travelTime}
                        </div>
                        <div 
                            className={styles.detailItem} 
                            onClick={() => setViewProfileId(booking.ride.driver?.id)}
                            style={{cursor: 'pointer', color: '#0f4c81', fontWeight: '500'}}
                            title="View Driver Profile"
                        >
                            Driver: {booking.ride.driver?.name || 'Unknown'}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.costInfo}>
                            <span className={styles.seats}>{booking.seatsBooked} Seat(s)</span>
                            <span className={styles.price}>
                                Total: ₹{booking.ride.pricePerSeat * booking.seatsBooked}
                            </span>
                        </div>
                        
                        <div className={styles.actions} style={{display: 'flex', gap: '10px'}}>
                            {/* Cancel Button - Show if active and not completed */}
                            {!booking.status.includes('CANCELLED') && booking.status !== 'REJECTED' && booking.ride.status !== 'COMPLETED' && booking.ride.status !== 'CANCELLED' && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleCancel(booking.id)}
                                    style={{borderColor: '#dc3545', color: '#dc3545'}}
                                >
                                    Cancel
                                </Button>
                            )}

                            {/* Pay Button - Only if Pending Payment */}
                            {booking.status === 'PENDING_PAYMENT' && booking.ride.status !== 'COMPLETED' && (
                                <Button className={styles.payBtn} onClick={() => setPaymentBooking(booking)}>
                                    <CreditCard size={16} style={{marginRight: '5px'}}/> Pay Now
                                </Button>
                            )}
                            
                            {/* Review Button - Only if Completed & Confirmed */}
                            {booking.ride.status === 'COMPLETED' && booking.status === 'CONFIRMED' && (
                                <Button 
                                    onClick={() => setReviewBooking(booking)}
                                    style={{backgroundColor: '#ffc107', color: '#333', borderColor: '#ffc107'}}
                                >
                                    <Star size={16} style={{marginRight:'5px'}}/> Rate Driver
                                </Button>
                            )}
                            
                            {/* Refund Button - For Cancelled/Rejected rides in history */}
                            {activeTab === 'history' && booking.status === 'CONFIRMED' && (booking.ride.status.includes('CANCELLED') || booking.status === 'CANCELLED') && (
                                <Button variant="outline" onClick={handleRefundRequest} style={{borderColor: '#ffc107', color: '#ffc107'}}>
                                    Request Refund
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <LocalToast toasts={toasts} onRemove={removeToast} />
            <div className="container">
                <div className={styles.header}>
                    <h1>My Bookings</h1>
                    <Link to="/history">
                        <Button variant="outline" style={{borderColor: '#0f4c81', color: '#0f4c81', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <Receipt size={18} /> Payment History
                        </Button>
                    </Link>
                </div>

                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.active : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        <Calendar size={18} style={{marginRight: '5px'}} /> Upcoming
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={18} style={{marginRight: '5px'}} /> History
                    </button>
                </div>

                {loading ? (
                    <p>Loading bookings...</p>
                ) : (
                    activeTab === 'upcoming' ? (
                        upcomingBookings.length === 0 ? <div className={styles.emptyState}>No upcoming trips. Book a ride now!</div> : renderBookings(upcomingBookings)
                    ) : (
                        historyBookings.length === 0 ? <div className={styles.emptyState}>No past trips.</div> : renderBookings(historyBookings)
                    )
                )}
            </div>

            {/* Modals */}
            {paymentBooking && (
                <PaymentModal 
                    booking={paymentBooking} 
                    onClose={() => setPaymentBooking(null)} 
                    onSuccess={handlePaymentSuccess} 
                />
            )}
            
            {reviewBooking && (
                <ReviewModal
                    booking={reviewBooking}
                    onClose={() => setReviewBooking(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}

            {viewProfileId && (
                <UserProfileModal 
                    userId={viewProfileId} 
                    onClose={() => setViewProfileId(null)} 
                />
            )}
            
            <ConfirmModal
                isOpen={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

export default MyBookings;