import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { getTransactionHistory, getDriverStats } from '../../services/api'; // Added getDriverStats
import { generateDriverInvoice } from '../../utils/invoiceGenerator';
import styles from './DriverHistory.module.css';
import { Download, Wallet, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; // Added Recharts

const DriverHistory = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState([]); // State for chart
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalRefunded, setTotalRefunded] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch History List
                const historyData = await getTransactionHistory();
                setPayments(historyData || []);
                
                // Calculate Totals
                const earnings = (historyData || [])
                    .filter(p => p.status === 'SUCCESS')
                    .reduce((sum, p) => sum + p.amount, 0);
                setTotalEarnings(Math.round(earnings / 1.07)); // Net Income

                const refunded = (historyData || [])
                    .filter(p => p.status === 'REFUNDED')
                    .reduce((sum, p) => sum + p.amount, 0);
                setTotalRefunded(refunded);

                // 2. Fetch Chart Data
                const statsData = await getDriverStats();
                setStats(statsData || []);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                <h1 className={styles.pageTitle}>My Earnings</h1>
                
                {/* NEW: Earnings Chart Section */}
                {stats.length > 0 && (
                    <div className={styles.chartSection}>
                        <h3>Weekly Earnings Trend</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={stats}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

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
                                            {p.status === 'SUCCESS' && (
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