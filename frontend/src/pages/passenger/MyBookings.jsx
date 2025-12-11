import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/PaymentModal'; 
import { getMyBookings, cancelBooking } from '../../services/api'; // Import cancelBooking
import styles from './MyBookings.module.css';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, CreditCard, XCircle } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentBooking, setPaymentBooking] = useState(null); 

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

    // NEW: Handle Cancel Logic
    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await cancelBooking(id);
            alert("Booking Cancelled");
            fetchBookings(); // Refresh UI
        } catch (err) {
            alert(err.message);
        }
    };

    // Handle Refund Request (Non-functional for now)
    const handleRefundRequest = () => {
        alert("Refund request submitted. Refund will be credited within 5-7 working days.");
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                <h1 className={styles.pageTitle}>My Bookings</h1>

                {loading ? (
                    <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                    <div className={styles.emptyState}>You have no bookings yet.</div>
                ) : (
                    <div className={styles.bookingsList}>
                        {bookings.map((booking) => (
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
                                        {/* If ride is CANCELLED_BY_ADMIN OR booking is CANCELLED (by passenger) */}
                                        {(booking.ride.status === 'CANCELLED_BY_ADMIN' || booking.status.includes('CANCELLED')) ? (
                                            <>
                                                {/* Show refund button only if payment was confirmed before cancellation */}
                                                {(booking.status === 'CONFIRMED' || booking.status.includes('CANCELLED')) && booking.status !== 'PENDING_PAYMENT' && (
                                                    <>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={handleRefundRequest}
                                                            style={{borderColor: '#FFCC00', color: '#FFCC00'}}
                                                        >
                                                            Request Refund
                                                        </Button>
                                                    </>
                                                )}
                                                {/* If payment was pending, show nothing */}
                                            </>
                                        ) : (
                                            <>
                                                {/* Normal ride - show cancel button if not already cancelled */}
                                                {!booking.status.includes('CANCELLED') && booking.ride.status !== 'CANCELLED_BY_ADMIN' && (
                                                    <Button 
                                                        variant="outline"
                                                        onClick={() => handleCancel(booking.id)}
                                                        style={{borderColor: '#dc3545', color: '#dc3545'}}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}

                                                {/* Show Pay Now button for pending payment */}
                                                {booking.status === 'PENDING_PAYMENT' && (
                                                    <Button 
                                                        className={styles.payBtn}
                                                        onClick={() => setPaymentBooking(booking)}
                                                    >
                                                        Pay Now
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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