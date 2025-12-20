import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getTransactionHistory } from '../../services/api';
import styles from './DriverHistory.module.css'; // Create CSS similar to MyBookings

const DriverHistory = () => {
    const [payments, setPayments] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getTransactionHistory();
                setPayments(data || []);
                // Calculate Total
                const total = (data || []).reduce((sum, p) => sum + p.amount, 0);
                setTotalEarnings(total);
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
                
                <div className="stats-card" style={{padding: '20px', background: '#e3f2fd', borderRadius: '8px', marginBottom: '20px'}}>
                    <h3>Total Earnings</h3>
                    <h2 style={{color: '#1565c0'}}>₹{totalEarnings}</h2>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Passenger</th>
                            <th>Ride Route</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{new Date(p.paymentTime).toLocaleDateString()}</td>
                                <td>{p.booking.passenger.name}</td>
                                <td>{p.booking.ride.source} {'->'} {p.booking.ride.destination}</td>
                                <td style={{color: 'green', fontWeight: 'bold'}}>+ ₹{p.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DriverHistory;