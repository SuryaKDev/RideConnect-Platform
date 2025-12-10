import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/PaymentModal'; // Ensure this file exists in src/components/
import { getMyBookings } from '../../services/api';
import styles from './MyBookings.module.css';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentBooking, setPaymentBooking] = useState(null); // Track which booking is being paid

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
        setPaymentBooking(null); // Close modal
        setLoading(true); // Show loading while refreshing
        fetchBookings(); // Refresh data to update status to "CONFIRMED"
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
                                    <div className={`${styles.statusBadge} ${styles[booking.status]}`}>
                                        {booking.status === 'CONFIRMED' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                        {booking.status.replace('_', ' ')}
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
                                    
                                    {/* Show Pay Button only if Pending */}
                                    {booking.status === 'PENDING_PAYMENT' && (
                                        <Button 
                                            className={styles.payBtn}
                                            onClick={() => setPaymentBooking(booking)}
                                        >
                                            <CreditCard size={16} style={{marginRight: '5px'}}/>
                                            Pay Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Render Payment Modal if a booking is selected */}
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