import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/PaymentModal';
import { getMyBookings, cancelBooking } from '../../services/api';
import styles from './MyBookings.module.css';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, CreditCard, XCircle, History } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentBooking, setPaymentBooking] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'

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

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await cancelBooking(id);
            alert("Booking Cancelled");
            fetchBookings();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRefundRequest = () => {
        alert("Refund request submitted. Refund will be credited within 5-7 working days.");
    };

    // Filter Logic
    // Upcoming: PENDING_PAYMENT or CONFIRMED
    const upcomingBookings = bookings.filter(b =>
        (b.status === 'PENDING_PAYMENT' || b.status === 'CONFIRMED') &&
        b.ride.status !== 'CANCELLED_BY_ADMIN' &&
        b.ride.status !== 'CANCELLED' &&
        b.ride.status !== 'COMPLETED'
    );

    // History: CANCELLED, REFUNDED, COMPLETED, or Admin Cancelled
    const historyBookings = bookings.filter(b =>
        b.status.includes('CANCELLED') ||
        b.status === 'REFUNDED' ||
        b.ride.status === 'COMPLETED' ||
        b.ride.status === 'CANCELLED_BY_ADMIN' ||
        b.ride.status === 'CANCELLED'
    );

    const renderBookings = (list) => (
        <div className={styles.bookingsList}>
            {list.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.statusBadge} ${booking.ride.status === 'CANCELLED_BY_ADMIN' ? styles.CANCELLED : styles[booking.status]}`}>
                            {booking.ride.status === 'CANCELLED_BY_ADMIN' ? <XCircle size={14} /> :
                                booking.status === 'CONFIRMED' ? <CheckCircle size={14} /> :
                                    booking.status.includes('CANCELLED') ? <XCircle size={14} /> :
                                        <AlertCircle size={14} />}
                            {booking.ride.status === 'CANCELLED_BY_ADMIN' ? 'Ride Cancelled' : booking.status.replace('_', ' ')}
                        </div>
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
                        <div className={styles.detailItem}>
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

                        <div className={styles.actions} style={{display: 'flex', gap: '10px', flexDirection: 'row'}}>
                            {/* REFUND BUTTON Logic */}
                            {(booking.ride.status === 'CANCELLED_BY_ADMIN' || booking.status.includes('CANCELLED')) ? (
                                <>
                                    {(booking.status === 'CONFIRMED' || booking.status.includes('CANCELLED')) && booking.status !== 'PENDING_PAYMENT' && (
                                        <Button variant="outline" onClick={handleRefundRequest} style={{borderColor: '#FFCC00', color: '#FFCC00'}}>
                                            Request Refund
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Action Buttons for Active Rides */}
                                    {!booking.status.includes('CANCELLED') && booking.ride.status !== 'CANCELLED_BY_ADMIN' && booking.ride.status !== 'COMPLETED' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleCancel(booking.id)}
                                            style={{borderColor: '#dc3545', color: '#dc3545'}}
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    {booking.status === 'PENDING_PAYMENT' && booking.ride.status !== 'COMPLETED' && (
                                        <Button className={styles.payBtn} onClick={() => setPaymentBooking(booking)}>
                                            <CreditCard size={16} style={{marginRight: '5px'}}/> Pay Now
                                        </Button>
                                    )}
                                </>
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
            <div className="container">
                <div className={styles.header}>
                    <h1>My Bookings</h1>
                    {/* Optional: Keep Payment History Link if you want */}
                    {/* <Link to="/history"><Button variant="outline">Payment History</Button></Link> */}
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
                        upcomingBookings.length === 0 ?
                            <div className={styles.emptyState}>No upcoming trips. Book a ride now!</div> :
                            renderBookings(upcomingBookings)
                    ) : (
                        historyBookings.length === 0 ?
                            <div className={styles.emptyState}>No past trips.</div> :
                            renderBookings(historyBookings)
                    )
                )}
            </div>

            {paymentBooking && (
                <PaymentModal
                    booking={paymentBooking}
                    onClose={() => setPaymentBooking(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default MyBookings;