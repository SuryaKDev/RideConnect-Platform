import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import styles from './MyBookings.module.css';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // const response = await api.get('/bookings/my-bookings');
                // setBookings(response.data);

                // Mock Data
                setTimeout(() => {
                    setBookings([
                        { id: 101, source: 'Chennai', destination: 'Bangalore', date: '2023-10-25', time: '08:00 AM', seats: 1, price: 500, status: 'CONFIRMED', driverName: 'Karthik' },
                        { id: 102, source: 'Bangalore', destination: 'Mysore', date: '2023-11-01', time: '09:00 AM', seats: 2, price: 600, status: 'COMPLETED', driverName: 'Rahul' },
                    ]);
                    setLoading(false);
                }, 500);
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
