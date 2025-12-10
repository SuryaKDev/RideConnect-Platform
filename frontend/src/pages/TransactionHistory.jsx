import React, { useEffect, useState } from 'react';
import { getTransactionHistory } from '../services/api';
import Navbar from '../components/Navbar';
import styles from './TransactionHistory.module.css';

const TransactionHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getTransactionHistory();
                setPayments(data || []);
            } catch (err) {
                console.error("Failed to load history", err);
                setError("Failed to load transaction history.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container" style={{ marginTop: '2rem' }}>
                <h1 className={styles.pageTitle}>Transaction History</h1>
                
                {loading && <p>Loading transactions...</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                {!loading && !error && payments.length === 0 && (
                    <p>No transactions found.</p>
                )}

                {!loading && !error && payments.length > 0 && (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Ride Details</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            {new Date(p.paymentTime).toLocaleDateString()}{' '}
                                            <span className={styles.time}>
                                                {new Date(p.paymentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.route}>
                                                {p.booking?.ride?.source} <span className={styles.arrow}>→</span> {p.booking?.ride?.destination}
                                            </div>
                                            <div className={styles.subText}>Booking #{p.booking?.id}</div>
                                        </td>
                                        <td className={styles.amount}>
                                            ₹{p.amount ? (p.amount / 100).toFixed(2) : '0.00'} {/* Razorpay stores amounts in paisa, assuming backend sends that or adjust if backend sends Rupees */}
                                        </td>
                                        <td>{p.paymentMethod}</td>
                                        <td>
                                            <span className={`${styles.status} ${p.status === 'SUCCESS' ? styles.success : styles.failed}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;