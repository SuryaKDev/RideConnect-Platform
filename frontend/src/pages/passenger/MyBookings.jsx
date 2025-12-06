import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getMyBookings } from '../../services/api';
import styles from './MyBookings.module.css';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getMyBookings();

                const mappedBookings = data.map(booking => ({
                    id: booking.id,
                    source: booking.ride.source,
                    destination: booking.ride.destination,
                    date: booking.ride.travelDate,
                    time: booking.ride.travelTime,
                    seats: booking.seatsBooked,
                    price: (booking.ride.pricePerSeat || 0) * booking.seatsBooked, // Fallback if price missing
                    status: booking.status,
                    driverName: booking.ride.driver ? booking.ride.driver.name : 'Unknown Driver'
                }));

                setBookings(mappedBookings);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch bookings', error);
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

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
                                <div className={styles.statusBadge}>
                                    <CheckCircle size={14} /> {booking.status}
                                </div>

                                <div className={styles.route}>
                                    <div className={styles.location}>
                                        <MapPin size={16} className={styles.icon} />
                                        <span>{booking.source}</span>
                                    </div>
                                    <div className={styles.connector}></div>
                                    <div className={styles.location}>
                                        <MapPin size={16} className={styles.icon} />
                                        <span>{booking.destination}</span>
                                    </div>
                                </div>

                                <div className={styles.details}>
                                    <div className={styles.detailItem}>
                                        <Calendar size={16} /> {booking.date}
                                    </div>
                                    <div className={styles.detailItem}>
                                        <Clock size={16} /> {booking.time}
                                    </div>
                                    <div className={styles.detailItem}>
                                        Driver: {booking.driverName}
                                    </div>
                                </div>

                                <div className={styles.footer}>
                                    <span className={styles.seats}>{booking.seats} Seat(s)</span>
                                    <span className={styles.price}>Total: ₹{booking.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
