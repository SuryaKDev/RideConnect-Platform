import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import styles from './AdminDashboard.module.css';
import {
    Users,
    Calendar,
    CheckCircle,
    XCircle,
    ShieldAlert,
    LayoutDashboard,
    LogOut,
    Settings,
    Car
} from 'lucide-react';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchData = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            if (activeTab === 'users' || activeTab === 'overview') {
                setUsers([
                    { id: 1, name: 'Karthik Raj', email: 'driver@example.com', role: 'DRIVER', isVerified: false, isActive: true },
                    { id: 2, name: 'Rishi', email: 'passenger@example.com', role: 'PASSENGER', isVerified: true, isActive: true },
                    { id: 3, name: 'Bad Driver', email: 'bad@example.com', role: 'DRIVER', isVerified: true, isActive: true },
                ]);
            }
            if (activeTab === 'bookings' || activeTab === 'overview') {
                setBookings([
                    { id: 101, rideId: 1, passengerName: 'Rishi', driverName: 'Karthik', source: 'Chennai', destination: 'Bangalore', status: 'CONFIRMED' },
                    { id: 102, rideId: 2, passengerName: 'John', driverName: 'Sara', source: 'Coimbatore', destination: 'Chennai', status: 'PENDING' },
                ]);
            }
            setLoading(false);
        }, 500);
    };

    const verifyDriver = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, isVerified: true } : u));
    };

    const blockUser = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
    };

    const cancelRide = (id) => {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    };

    return (
        <div className={styles.pageWrapper}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <a href="/" className={styles.logo}>RideConnect</a>
                </div>

                <nav className={styles.navMenu}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} />
                        <span>User Management</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <Car size={20} />
                        <span>Rides & Bookings</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </nav>

                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>
                        {activeTab === 'overview' && 'Dashboard Overview'}
                        {activeTab === 'users' && 'User Management'}
                        {activeTab === 'bookings' && 'Ride Management'}
                        {activeTab === 'settings' && 'System Settings'}
                    </h1>
                    <p className={styles.pageSubtitle}>Welcome back, Admin</p>
                </header>

                {activeTab === 'overview' && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                                <Users size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Total Users</h3>
                                <p>1,234</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                <Car size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Active Rides</h3>
                                <p>56</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <Calendar size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Total Bookings</h3>
                                <p>892</p>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'overview') && (
                    <div className={styles.sectionCard} style={{ marginBottom: '2rem' }}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Recent Users</h2>
                            {activeTab === 'overview' && (
                                <Button size="sm" variant="outline" onClick={() => setActiveTab('users')}>View All</Button>
                            )}
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`${styles.badge} ${user.role === 'DRIVER' ? styles.badgeBlue : styles.badgeGray}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {user.isActive ? (
                                                    user.role === 'DRIVER' && !user.isVerified ? (
                                                        <span className={`${styles.badge} ${styles.badgeYellow}`}>Pending</span>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span>
                                                    )
                                                ) : (
                                                    <span className={`${styles.badge} ${styles.badgeRed}`}>Blocked</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {user.role === 'DRIVER' && !user.isVerified && user.isActive && (
                                                        <Button size="sm" onClick={() => verifyDriver(user.id)} className={styles.actionBtn}>
                                                            <CheckCircle size={14} /> Verify
                                                        </Button>
                                                    )}
                                                    {user.isActive && (
                                                        <Button size="sm" variant="outline" onClick={() => blockUser(user.id)} className={`${styles.actionBtn} ${styles.btnDanger}`}>
                                                            <ShieldAlert size={14} /> Block
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(activeTab === 'bookings' || activeTab === 'overview') && (
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Recent Bookings</h2>
                            {activeTab === 'overview' && (
                                <Button size="sm" variant="outline" onClick={() => setActiveTab('bookings')}>View All</Button>
                            )}
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Ride ID</th>
                                        <th>Route</th>
                                        <th>Driver</th>
                                        <th>Passenger</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>#{booking.rideId}</td>
                                            <td>{booking.source} ➝ {booking.destination}</td>
                                            <td>{booking.driverName}</td>
                                            <td>{booking.passengerName}</td>
                                            <td>
                                                <span className={`${styles.badge} ${booking.status === 'CONFIRMED' ? styles.badgeGreen : booking.status === 'CANCELLED' ? styles.badgeRed : styles.badgeYellow}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>
                                                {booking.status !== 'CANCELLED' && (
                                                    <Button size="sm" variant="outline" onClick={() => cancelRide(booking.id)} className={`${styles.actionBtn} ${styles.btnDanger}`}>
                                                        <XCircle size={14} /> Cancel
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
