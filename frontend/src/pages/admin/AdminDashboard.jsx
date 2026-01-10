import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import StatCard from '../../components/admin/StatCard';
import ConfirmModal from '../../components/ConfirmModal';
import LocalToast from '../../components/LocalToast';
import { useToast } from '../../utils/useToast';
import { getAllUsers, getAllRides, getAllBookings, verifyDriver, blockUser, cancelRideAdmin, getAdminStats } from '../../services/api';
import styles from './AdminDashboard.module.css';
import { Users, Car, IndianRupee, MapPin, Activity, LayoutDashboard, LogOut, Menu, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, XCircle, RefreshCcw, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, ReferenceLine, LabelList } from 'recharts';

// Mock Data for Graph (In Milestone 3.5 we can fetch this from DB)
// Dynamic Chart Data State
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
    // Dynamic Chart Data State
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [barData, setBarData] = useState([]);

    const { logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    // Updated stats state to include cancelledRides and refundedAmount
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeRides: 0,
        completedRides: 0,
        totalRevenue: 0,
        cancelledRides: 0,
        refundedAmount: 0
    });
    const [users, setUsers] = useState([]);
    const [rides, setRides] = useState([]);

    // Interactive States
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);

    const [cancelModal, setCancelModal] = useState({ show: false, rideId: null, reason: '' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, showToast, removeToast } = useToast();

    // Initial Data Fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                console.log('Admin Stats from backend:', data);
                setStats(data || {
                    totalUsers: 0,
                    activeRides: 0,
                    completedRides: 0,
                    totalRevenue: 0,
                    cancelledRides: 0,
                    refundedAmount: 0
                });
            } catch (error) { console.error(error); }
        };
        fetchStats();
    }, []);

    // Tab Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersData, ridesData, statsData, bookingsData] = await Promise.all([
                    getAllUsers(),
                    getAllRides(),
                    getAdminStats(),
                    getAllBookings()
                ]);

                setUsers(usersData || []);
                setRides(ridesData || []);
                setStats(statsData || {});

                // Calculate Chart Data (Revenue per Day for last 7 days)
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = d.toLocaleString('default', { weekday: 'short' });
                    // Format key as YYYY-MM-DD for comparison
                    const dateKey = d.toISOString().split('T')[0];
                    last7Days.push({ name: dayName, dateKey, revenue: 0 });
                }

                if (bookingsData) {
                    bookingsData.forEach(booking => {
                        if (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') {
                            // Use paymentTime if available, else bookingTime
                            const date = new Date(booking.bookingTime);
                            const dateKey = date.toISOString().split('T')[0];

                            const dayEntry = last7Days.find(d => d.dateKey === dateKey);
                            if (dayEntry) {
                                // Assume ride price is available in booking or booking.amount
                                // If payment info exists use that, else estimate
                                const amount = booking.payment?.amount || booking.ride?.pricePerSeat || 0;
                                dayEntry.revenue += amount;
                            }
                        }
                    });
                }
                setChartData(last7Days);

                // 2. User Distribution (Pie Chart)
                const driversCount = (usersData || []).filter(u => u.role === 'DRIVER').length;
                const passengerCount = (usersData || []).filter(u => u.role === 'PASSENGER').length;
                setPieData([
                    { name: 'Drivers', value: driversCount },
                    { name: 'Passengers', value: passengerCount }
                ]);

                // 3. Ride Status (Bar Chart)
                const completedRides = (ridesData || []).filter(r => r.status === 'COMPLETED').length;
                const activeRides = (ridesData || []).filter(r => r.status === 'AVAILABLE' || r.status === 'IN_PROGRESS').length;
                const cancelledRides = (ridesData || []).filter(r => r.status === 'CANCELLED').length;
                setBarData([
                    { name: 'Completed', value: completedRides },
                    { name: 'Active', value: activeRides },
                    { name: 'Cancelled', value: cancelledRides }
                ]);

            } catch (err) {
                console.error("Dashboard Load Error:", err);
                showToast("Failed to load dashboard data", "ERROR");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // Reset interactive states on tab change
        setSearchQuery('');
        setFilterStatus('ALL');
        setCurrentPage(1);
        setSortConfig({ key: null, direction: 'asc' });
    }, [activeTab]);

    // --- LOGIC: Filter & Sort ---
    const processedData = useMemo(() => {
        let data = activeTab === 'users' ? users : rides;

        // 1. Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter(item =>
                (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
                (item.email && item.email.toLowerCase().includes(lowerQuery)) ||
                (item.driver?.name && item.driver.name.toLowerCase().includes(lowerQuery)) ||
                (item.source && item.source.toLowerCase().includes(lowerQuery)) ||
                (item.destination && item.destination.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Filter by Status dropdown
        if (filterStatus !== 'ALL') {
            data = data.filter(item => {
                if (activeTab === 'users') {
                    // Start: Normalize properties
                    const isVerified = item.isVerified !== undefined ? item.isVerified : (item.verified !== undefined ? item.verified : false);
                    const isActive = item.isActive !== undefined ? item.isActive : (item.active !== undefined ? item.active : true);
                    // End: Normalize properties

                    if (filterStatus === 'DRIVER') return item.role === 'DRIVER';
                    if (filterStatus === 'PASSENGER') return item.role === 'PASSENGER';
                    if (filterStatus === 'BLOCKED') return !isActive;
                    if (filterStatus === 'PENDING') return !isVerified && item.role === 'DRIVER';
                } else {
                    return item.status === filterStatus;
                }
                return true;
            });
        }

        // 3. Sorting
        if (sortConfig.key) {
            data = [...data].sort((a, b) => {
                // Helper to get nested properties like 'driver.name'
                const getValue = (obj, path) => path.split('.').reduce((o, k) => (o || {})[k], obj);

                const aValue = getValue(a, sortConfig.key);
                const bValue = getValue(b, sortConfig.key);

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [users, rides, activeTab, searchQuery, filterStatus, sortConfig]);

    // --- LOGIC: Pagination ---
    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
    const paginatedData = activeTab === 'overview'
        ? processedData.slice(0, 5)
        : processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // For Overview tab, we need separate data for users and rides
    const recentUsers = activeTab === 'overview' ? users.slice(0, 5) : [];
    const recentRides = activeTab === 'overview' ? rides.slice(0, 5) : [];

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // ... Handlers (Logout, Verify, Block, Cancel) ...
    const handleLogout = () => { logout(); navigate('/login'); };

    const handleVerify = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Verify Driver',
            message: 'Are you sure you want to verify this driver? This will allow them to post rides.',
            type: 'info',
            onConfirm: async () => {
                try {
                    await verifyDriver(id);
                    setUsers(users.map(u => u.id === id ? { ...u, isVerified: true, verified: true } : u));
                    showToast('Driver verified successfully!', 'SUCCESS');
                } catch (e) {
                    showToast(e.message, 'ERROR');
                }
            }
        });
    };

    const handleBlock = async (id) => {
        setConfirmModal({
            show: true,
            title: 'Block User',
            message: 'Are you sure you want to block this user? They will not be able to access the platform.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await blockUser(id);
                    setUsers(users.map(u => u.id === id ? { ...u, isActive: false, active: false } : u));
                    showToast('User blocked successfully!', 'SUCCESS');
                } catch (e) {
                    showToast(e.message, 'ERROR');
                }
            }
        });
    };

    const openCancelModal = (rideId) => setCancelModal({ show: true, rideId, reason: '' });

    const submitCancel = async () => {
        if (!cancelModal.reason.trim()) {
            showToast('Please provide a reason for cancellation', 'WARNING');
            return;
        }
        try {
            await cancelRideAdmin(cancelModal.rideId, cancelModal.reason);
            showToast('Ride cancelled successfully!', 'SUCCESS');
            setCancelModal({ show: false, rideId: null, reason: '' });
            const ridesData = await getAllRides();
            setRides(ridesData || []);
        } catch (e) {
            showToast(e.message, 'ERROR');
        }
    };

    const renderSidebar = () => (
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.mobileOpen : ''}`}>
            <div className={styles.sidebarHeader}>
                <h2>RideConnect</h2>
                <span className={styles.badge}>Admin</span>
            </div>
            <nav className={styles.nav}>
                <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.activeNav : ''}`} onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}>
                    <LayoutDashboard size={20} /> Overview
                </button>
                <button className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNav : ''}`} onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}>
                    <Users size={20} /> User Management
                </button>
                <button className={`${styles.navItem} ${activeTab === 'rides' ? styles.activeNav : ''}`} onClick={() => { setActiveTab('rides'); setSidebarOpen(false); }}>
                    <Car size={20} /> Ride Console
                </button>
            </nav>
            <div className={styles.sidebarFooter}>
                <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={18} /> Logout</button>
            </div>
        </aside>
    );

    // Skeleton Loader Component
    const TableSkeleton = ({ cols }) => (
        <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                    {Array.from({ length: cols }).map((_, idx) => (
                        <td key={idx}>
                            <div style={{ height: '20px', backgroundColor: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                        </td>
                    ))}
                </tr>
            ))}
            <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
        </tbody>
    );

    // Sorting Header Helper
    const SortableHeader = ({ label, sortKey }) => (
        <th onClick={() => handleSort(sortKey)} style={{ cursor: 'pointer', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {label}
                {sortConfig.key === sortKey ? (
                    <span style={{ fontSize: '0.8rem' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                ) : <ArrowUpDown size={14} color="#94a3b8" />}
            </div>
        </th>
    );

    return (
        <div className={styles.layout}>
            {renderSidebar()}

            <main className={styles.mainContent}>
                <header className={styles.topHeader}>
                    <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={24} /></button>
                    <h1>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'users' ? 'User Management' : 'Ride Console'}</h1>
                    <div className={styles.headerInfo}>Admin Portal</div>
                </header>

                {/* Stats Row */}
                {activeTab === 'overview' && (
                    <div className={styles.statsGrid}>
                        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}`} icon={IndianRupee} color="green" />
                        <StatCard title="Active Rides" value={stats.activeRides || 0} icon={MapPin} color="blue" />
                        <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="purple" />
                        <StatCard title="Completed Trips" value={stats.completedRides || 0} icon={CheckCircle} color="emerald" />

                        {/* New Metrics */}
                        <StatCard
                            title="Cancelled Rides"
                            value={stats.cancelledRides || 0}
                            icon={XCircle}
                            color="red"
                        />
                        <StatCard
                            title="Refunded Amount"
                            value={`₹${(stats.refundedAmount || stats.totalRefunds || 0).toLocaleString()}`}
                            icon={RefreshCcw}
                            color="orange"
                        />
                    </div>
                )}

                {/* Charts */}
                {activeTab === 'overview' && !loading && (
                    <div className={styles.chartsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem', alignItems: 'stretch' }}>

                        {/* 1. Revenue Trends (Insight-Driven & State-Aware) */}
                        <div className={styles.chartSection} style={{ padding: '2rem', borderRadius: '20px', background: 'white', border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Revenue Trends</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Avg. Daily: <span style={{ fontWeight: 600, color: '#6366f1' }}>₹{Math.round(chartData.reduce((acc, curr) => acc + curr.revenue, 0) / 7 || 0).toLocaleString()}</span>
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>₹{stats.totalRevenue.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total (Last 7 Days)</div>
                                </div>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} interval="preserveStartEnd" />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} tickFormatter={(value) => `₹${value}`} padding={{ top: 30 }} />
                                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />

                                        {/* Average Reference Line */}
                                        <ReferenceLine y={chartData.reduce((acc, curr) => acc + curr.revenue, 0) / 7} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg', fill: '#94a3b8', fontSize: 10 }} />

                                        {/* Today's Data Annotation (Last Point) */}
                                        <ReferenceLine x={chartData[chartData.length - 1]?.name} stroke="none" label={{ position: 'top', value: 'Today', fill: '#6366f1', fontSize: 10, fontWeight: 700 }} />

                                        <Tooltip content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const currentRevenue = payload[0].value;
                                                const index = chartData.findIndex(d => d.name === label);
                                                const prevRevenue = index > 0 ? chartData[index - 1].revenue : 0;
                                                const pctChange = prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

                                                return (
                                                    <div style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                                        <p style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>{label}</p>
                                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', margin: 0 }}>₹{currentRevenue.toLocaleString()}</p>
                                                        {currentRevenue === 0 ? (
                                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 0', fontStyle: 'italic' }}>No completed rides</p>
                                                        ) : (
                                                            index > 0 && <p style={{ fontSize: '0.75rem', color: pctChange >= 0 ? '#10b981' : '#f43f5e', margin: '4px 0 0 0', fontWeight: 600 }}>
                                                                {pctChange >= 0 ? '▲' : '▼'} {Math.abs(pctChange).toFixed(1)}% vs prev day
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#6366f1' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 2. User Distribution (Adaptive Layout) */}
                        <div className={styles.chartSection} style={{ padding: '2rem', borderRadius: '20px', background: 'white', border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>User Distribution</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Drivers vs Passengers • <span style={{ fontWeight: 600, color: '#334155' }}>{users.length} Total Users</span>
                                    </p>
                                </div>
                            </div>
                            <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {users.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                        <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                        <p>No users registered yet.</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={0}
                                                outerRadius={users.length < 10 ? 80 : 90}
                                                paddingAngle={users.length < 10 ? 0 : 4}
                                                dataKey="value"
                                                stroke="white"
                                                strokeWidth={2}
                                                cornerRadius={4}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.name === 'Drivers' ? '#8b5cf6' : '#06b6d4'} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const { name, value } = payload[0];
                                                    const total = pieData.reduce((a, b) => a + b.value, 0);
                                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                                    return (
                                                        <div style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: name === 'Drivers' ? '#8b5cf6' : '#06b6d4' }}></div>
                                                                <span style={{ fontWeight: 700, color: '#334155' }}>{name}</span>
                                                            </div>
                                                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{value} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>users</span></div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{percentage}% of total</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{ paddingTop: '10px' }}
                                                formatter={(value) => <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem', marginLeft: '4px' }}>{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* 3. Ride Status (Professional Summary) */}
                        <div className={styles.chartSection} style={{ padding: '2rem', borderRadius: '20px', background: 'white', border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
                            {(() => {
                                const activeCount = barData.find(b => b.name === 'Active')?.value || 0;
                                const completedCount = barData.find(b => b.name === 'Completed')?.value || 0;
                                const cancelledCount = barData.find(b => b.name === 'Cancelled')?.value || 0;
                                const totalFinished = completedCount + cancelledCount;
                                const totalRides = activeCount + totalFinished;
                                const completionRate = totalRides > 0 ? ((completedCount / totalRides) * 100).toFixed(0) : 0;

                                return (
                                    <>
                                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Ride Status</h3>
                                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Current trip activity</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                {/* Only show badge if we have finished rides */}
                                                {totalFinished > 0 && (
                                                    <div style={{ fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>{completionRate}% Completion Rate</div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ width: '100%', minHeight: 160, display: 'flex', alignItems: 'center' }}>
                                            {totalFinished === 0 ? (
                                                /* Early Data State: Plain Text Metrics */
                                                <div style={{ width: '100%', textAlign: 'left' }}>
                                                    <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.5rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>{activeCount}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Active</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94a3b8' }}>{completedCount}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Completed</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94a3b8' }}>{cancelledCount}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cancelled</div>
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                        Completion metrics will appear once trips finish.
                                                    </p>
                                                </div>
                                            ) : (
                                                /* Mature Data: Chart */
                                                <div style={{ width: '100%', height: 160 }}>
                                                    <ResponsiveContainer>
                                                        <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 60, bottom: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                                                            <XAxis type="number" hide />
                                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }} width={100} />
                                                            <Tooltip cursor={{ fill: '#f8fafc', radius: 4 }} content={({ active, payload }) => {
                                                                if (active && payload && payload.length) {
                                                                    const { name, value, fill } = payload[0];
                                                                    const pct = totalRides > 0 ? ((value / totalRides) * 100).toFixed(1) : 0;
                                                                    return (
                                                                        <div style={{ background: 'rgba(255, 255, 255, 0.98)', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                                            <div style={{ fontWeight: 700, color: fill, marginBottom: '4px' }}>{name}</div>
                                                                            <div style={{ color: '#1e293b', fontWeight: 600 }}>{value} rides ({pct}%)</div>
                                                                        </div>
                                                                    )
                                                                }
                                                                return null;
                                                            }} />
                                                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: '#f8fafc', radius: [0, 6, 6, 0] }}>
                                                                {barData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.name === 'Completed' ? '#10b981' : entry.name === 'Active' ? '#6366f1' : '#f43f5e'} />
                                                                ))}
                                                                <LabelList dataKey="value" position="right" formatter={(val) => {
                                                                    const pct = totalRides > 0 ? Math.round((val / totalRides) * 100) : 0;
                                                                    return val > 0 ? `${val} (${pct}%)` : '';
                                                                }} style={{ fontSize: '12px', fontWeight: 600, fill: '#64748b' }} />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                <div className={styles.contentArea}>
                    {/* Toolbar (Search & Filter) - Only for User/Ride tabs */}
                    {activeTab !== 'overview' && (
                        <div className={styles.toolbar} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>
                            <div style={{ position: 'relative', minWidth: '150px' }}>
                                <Filter size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', appearance: 'none', backgroundColor: 'white' }}
                                >
                                    <option value="ALL">All Status</option>
                                    {activeTab === 'users' ? (
                                        <>
                                            <option value="DRIVER">Drivers</option>
                                            <option value="PASSENGER">Passengers</option>
                                            <option value="PENDING">Pending Verification</option>
                                            <option value="BLOCKED">Blocked</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="AVAILABLE">Available</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    {(activeTab === 'users' || activeTab === 'overview') && (
                        <div className={styles.sectionCard}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>{activeTab === 'overview' ? 'Recent Users' : 'User List'}</h2>
                                {activeTab === 'overview' && <Button size="sm" variant="outline" onClick={() => setActiveTab('users')}>View All</Button>}
                            </div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <SortableHeader label="ID" sortKey="id" />
                                            <SortableHeader label="Name" sortKey="name" />
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Phone</th>
                                            <SortableHeader label="Role" sortKey="role" />

                                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Status</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    {loading ? <TableSkeleton cols={7} /> : (
                                        <tbody>
                                            {(activeTab === 'overview' ? recentUsers : paginatedData).map(u => {
                                                const isVerified = u.isVerified !== undefined ? u.isVerified : (u.verified !== undefined ? u.verified : false);
                                                const isActive = u.isActive !== undefined ? u.isActive : (u.active !== undefined ? u.active : true);



                                                return (
                                                    <tr key={u.id}>
                                                        <td>{String(u.id).padStart(3, '0')}</td>
                                                        <td><div className={styles.userName}>{u.name}</div><small className={styles.userEmail}>{u.email}</small></td>
                                                        <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{u.phone || 'N/A'}</td>
                                                        <td><span className={styles.roleBadge}>{u.role}</span></td>

                                                        <td>
                                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                                {u.role === 'DRIVER' && (isVerified ? <span className={styles.verified}>Verified</span> : <span className={styles.pending}>Pending</span>)}
                                                                {!isActive ? <span className={styles.blocked}>Blocked</span> : <span className={styles.activeStatus}>Active</span>}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={styles.tableActions}>
                                                                {u.role === 'DRIVER' && !isVerified && <Button size="sm" onClick={() => handleVerify(u.id)} className={styles.actionBtn}>Verify</Button>}
                                                                {isActive && u.role !== 'ADMIN' && <Button size="sm" variant="outline" onClick={() => handleBlock(u.id)} className={styles.btnDanger}>Block</Button>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {!loading && (activeTab === 'overview' ? recentUsers : paginatedData).length === 0 && (
                                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No users found matching filters.</td></tr>
                                            )}
                                        </tbody>
                                    )}  </table>
                            </div>

                            {/* Pagination Controls */}
                            {activeTab === 'users' && !loading && processedData.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, processedData.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, processedData.length)} of {processedData.length} results
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></Button>
                                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem', fontWeight: '600' }}>{currentPage}</span>
                                        <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rides Table */}
                    {(activeTab === 'rides' || activeTab === 'overview') && (
                        <div className={styles.sectionCard}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>{activeTab === 'overview' ? 'Recent Rides' : 'Ride Console'}</h2>
                                {activeTab === 'overview' && <Button size="sm" variant="outline" onClick={() => setActiveTab('rides')}>View All</Button>}
                            </div>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <SortableHeader label="ID" sortKey="id" />
                                            <SortableHeader label="Driver" sortKey="driver.name" />
                                            <SortableHeader label="Source" sortKey="source" />
                                            <SortableHeader label="Destination" sortKey="destination" />
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Status</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    {loading ? <TableSkeleton cols={6} /> : (
                                        <tbody>
                                            {(activeTab === 'overview' ? recentRides : paginatedData).map(r => (
                                                <tr key={r.id}>
                                                    <td>{String(r.id).padStart(3, '0')}</td>
                                                    <td>{r.driver?.name}</td>
                                                    <td>{r.source}</td>
                                                    <td>{r.destination}</td>
                                                    <td><span className={`${styles.statusBadge} ${styles[r.status]}`}>{r.status}</span></td>
                                                    <td>
                                                        {r.status !== 'CANCELLED' && r.status !== 'CANCELLED_BY_ADMIN' && (
                                                            <Button size="sm" variant="outline" onClick={() => openCancelModal(r.id)} className={styles.btnDanger}>Cancel</Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {!loading && (activeTab === 'overview' ? recentRides : paginatedData).length === 0 && (
                                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No rides found matching filters.</td></tr>
                                            )}
                                        </tbody>
                                    )}
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {activeTab === 'rides' && !loading && processedData.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, processedData.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, processedData.length)} of {processedData.length} results
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></Button>
                                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem', fontWeight: '600' }}>{currentPage}</span>
                                        <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main >

            {/* Cancel Modal */}
            {
                cancelModal.show && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>Cancel Ride #{cancelModal.rideId}</h3>
                            <p>Please provide a reason for cancellation.</p>
                            <textarea className={styles.textarea} value={cancelModal.reason} onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })} />
                            <div className={styles.modalActions}>
                                <Button variant="outline" onClick={() => setCancelModal({ show: false, rideId: null, reason: '' })}>Close</Button>
                                <Button onClick={submitCancel} className={styles.btnDanger} style={{ color: 'white', background: '#dc2626' }}>Confirm</Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText="Confirm"
                cancelText="Cancel"
            />

            {/* Toast Notifications */}
            <LocalToast toasts={toasts} onRemove={removeToast} />
        </div >
    );
};

export default AdminDashboard;