import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { getTransactionHistory } from '../../services/api';
import { generateDriverInvoice } from '../../utils/invoiceGenerator';
import styles from './DriverHistory.module.css';
import { Download, Wallet, ArrowDownLeft } from 'lucide-react';

const DriverHistory = () => {
    const [payments, setPayments] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalRefunded, setTotalRefunded] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getTransactionHistory();
                setPayments(data || []);
                
                // Calculate Total Earnings (Only SUCCESS)
                const earnings = (data || [])
                    .filter(p => p.status === 'SUCCESS')
                    .reduce((sum, p) => sum + p.amount, 0);
                
                // Calculate reverse math for Net Income (removing 7% tax/fee)
                // Net = Total / 1.07
                setTotalEarnings(Math.round(earnings / 1.07)); 

                // Calculate Total Refunded (only base fare, not GST/platform fee)
                const refunded = (data || [])
                    .filter(p => p.status === 'REFUNDED')
                    .reduce((sum, p) => sum + (p.amount / 1.07), 0);
                setTotalRefunded(Math.round(refunded));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                <h1 className={styles.pageTitle}>My Earnings</h1>
                
                <div className={styles.statsContainer}>
                    <div className={`${styles.statsCard} ${styles.earningsCard}`}>
                        <div className={styles.statsIcon}><Wallet size={24} /></div>
                        <div>
                            <h3>Net Income</h3>
                            <h2 className={styles.earningsAmount}>₹{totalEarnings}</h2>
                            <span className={styles.statsSub}>After platform fees & taxes</span>
                        </div>
                    </div>
                    <div className={`${styles.statsCard} ${styles.refundCard}`}>
                        <div className={styles.statsIcon}><ArrowDownLeft size={24} /></div>
                        <div>
                            <h3>Refunded</h3>
                            <h2 className={styles.refundAmount}>₹{totalRefunded}</h2>
                        </div>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    {loading ? <p>Loading history...</p> : payments.length === 0 ? <p className={styles.empty}>No earnings yet.</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Passenger</th>
                                    <th>Ride Details</th>
                                    <th>Total Fare</th>
                                    <th>Status</th>
                                    <th>Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className={styles.dateCell}>
                                                {new Date(p.paymentTime).toLocaleDateString()}
                                                <small>{new Date(p.paymentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                            </div>
                                        </td>
                                        <td>{p.booking?.passenger?.name || 'N/A'}</td>
                                        <td>
                                            <div className={styles.route}>
                                                {p.booking?.ride?.source} <span className={styles.arrow}>→</span> {p.booking?.ride?.destination}
                                            </div>
                                        </td>
                                        <td className={p.status === 'REFUNDED' ? styles.textRed : styles.textGreen}>
                                            {p.status === 'REFUNDED' ? '-' : '+'} ₹{p.amount?.toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[p.status]}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            {(p.status === 'SUCCESS' || p.status === 'REFUNDED') && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => generateDriverInvoice(p)}
                                                    className={styles.downloadBtn}
                                                >
                                                    <Download size={14} /> PDF
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverHistory;