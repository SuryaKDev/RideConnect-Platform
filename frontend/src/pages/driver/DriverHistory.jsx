import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getTransactionHistory } from '../../services/api';
import styles from './DriverHistory.module.css'; // Create CSS similar to MyBookings

const DriverHistory = () => {
    const [payments, setPayments] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalRefunded, setTotalRefunded] = useState(0);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getTransactionHistory();
                setPayments(data || []);
                // Calculate Total Earnings (SUCCESS)
                const earnings = (data || []).filter(p => p.status !== 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);
                setTotalEarnings(earnings);
                // Calculate Total Refunded
                const refunded = (data || []).filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);
                setTotalRefunded(refunded);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="pageWrapper">
            <Navbar />
            <div className="container">
                <h1>My Earnings</h1>
                
                <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                    <div className="stats-card" style={{padding: '20px', background: '#e3f2fd', borderRadius: '8px', flex: 1}}>
                        <h3>Total Earnings</h3>
                        <h2 style={{color: '#1565c0'}}>₹{totalEarnings}</h2>
                    </div>
                    <div className="stats-card" style={{padding: '20px', background: '#ffebee', borderRadius: '8px', flex: 1}}>
                        <h3>Total Refunded</h3>
                        <h2 style={{color: '#c62828'}}>₹{totalRefunded}</h2>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Passenger</th>
                            <th>Ride Route</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{new Date(p.paymentTime).toLocaleDateString()}</td>
                                <td>{p.booking.passenger.name}</td>
                                <td>{p.booking.ride.source} {'->'} {p.booking.ride.destination}</td>
                                <td style={{color: p.status === 'REFUNDED' ? 'red' : 'green', fontWeight: 'bold'}}>{p.status === 'REFUNDED' ? '-' : '+'} ₹{p.amount}</td>
                                <td><span className={`${styles.status} ${styles[p.status]}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DriverHistory;