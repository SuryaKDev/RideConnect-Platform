import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { getTransactionHistory, getDriverStats } from '../../services/api'; // Added getDriverStats
import { generateDriverInvoice } from '../../utils/invoiceGenerator';
import { Link } from 'react-router-dom';
import styles from './DriverHistory.module.css';
import { Download, Wallet, ArrowDownLeft, Car, Users, CheckCircle, Plus } from 'lucide-react';
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


                {/* 1. Motivational Hero (Only for Empty State) */}
                {payments.length === 0 && (
                    <div className={styles.heroSection} style={{ marginBottom: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderRadius: '16px', border: '1px solid #dbeafe' }}>
                        <div style={{ maxWidth: '600px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '0.5rem' }}>Start Earning with RideConnect</h2>
                            <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '1rem' }}>
                                Publish your first ride to start generating income. Earnings are credited immediately after a trip is completed.
                            </p>
                            <Link to="/post-ride">
                                <Button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                                    <Plus size={18} /> Publish a Ride
                                </Button>
                            </Link>

                            {/* Progress Checklist */}
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold' }}>1</div>
                                    <span>Ride Published</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>2</div>
                                    <span>Passenger Booked</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>3</div>
                                    <span>Ride Completed</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold' }}>4</div>
                                    <span>Earnings Credited</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Earnings Trend Chart (Only if Data Exists) */}
                {stats.length > 0 && payments.length > 0 && (
                    <div className={styles.chartSection}>
                        <h3>Weekly Earnings Trend</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={stats}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                            <h2 className={styles.earningsAmount}>₹{totalEarnings}</h2>
                            <span className={styles.statsSub}>{payments.length > 0 ? 'After platform fees & taxes' : 'Updates after ride completion'}</span>
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
                    {loading ? <p>Loading history...</p> : payments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <Car size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No completed trips yet</p>
                            <p>History will appear here once you complete a ride.</p>
                        </div>
                    ) : (
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
                                                {new Date(p.paymentTime).toLocaleDateString('en-GB')}
                                                <small>{new Date(p.paymentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
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