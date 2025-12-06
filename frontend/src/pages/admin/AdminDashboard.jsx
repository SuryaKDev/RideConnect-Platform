import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, getAllRides, verifyDriver, blockUser, cancelRide } from '../../services/api';
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
    Car
} from 'lucide-react';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [rides, setRides] = useState([]);
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
        try {
            if (activeTab === 'users' || activeTab === 'overview') {
                const usersData = await getAllUsers();
                setUsers(usersData);
            }
            if (activeTab === 'rides' || activeTab === 'overview') {
                const ridesData = await getAllRides();
                setRides(ridesData);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDriver = async (id) => {
        try {
            await verifyDriver(id);
            setUsers(users.map(u => u.id === id ? { ...u, isVerified: true } : u));
        } catch (error) {
            console.error("Failed to verify driver", error);
            alert("Failed to verify driver");
        }
    };

    const handleBlockUser = async (user) => {
        if (window.confirm(`Are you sure you want to block ${user.name}? They will effectively be banned from logging in.`)) {
            try {
                await blockUser(user.id);
                setUsers(users.map(u => u.id === user.id ? { ...u, isActive: false } : u));
            } catch (error) {
                console.error("Failed to block user", error);
                alert("Failed to block user");
            }
        }
    };

    const handleCancelRide = async (rideId) => {
        if (window.confirm("Warning: This will cancel the ride for all booked passengers.")) {
            try {
                await cancelRide(rideId);
                setRides(rides.map(r => r.id === rideId ? { ...r, status: 'CANCELLED_BY_ADMIN' } : r));
            } catch (error) {
                console.error("Failed to cancel ride", error);
                alert("Failed to cancel ride");
            }
        }
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
                        className={`${styles.navItem} ${activeTab === 'rides' ? styles.active : ''}`}
                        onClick={() => setActiveTab('rides')}
                    >
                        <Car size={20} />
                        <span>Ride Console</span>
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
                        {activeTab === 'rides' && 'Ride Console'}
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
                                <p>{users.length}</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                <Car size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <h3>Total Rides</h3>
                                <p>{rides.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'overview') && (
                    <div className={styles.sectionCard} style={{ marginBottom: '2rem' }}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>User Management</h2>
                            {activeTab === 'overview' && (
                                <Button size="sm" variant="outline" onClick={() => setActiveTab('users')}>View All</Button>
                            )}
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Verification</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        // Handle potential property name variations
                                        const isActive = user.isActive !== undefined ? user.isActive : (user.active !== undefined ? user.active : true);
                                        const isVerified = user.isVerified !== undefined ? user.isVerified : (user.verified !== undefined ? user.verified : false);

                                        return (
                                            <tr key={user.id}>
                                                <td>#{user.id}</td>
                                                <td>{user.name}</td>
                                                <td>
                                                    <span className={`${styles.badge} ${user.role === 'DRIVER' ? styles.badgeGreen : styles.badgeBlue}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    {isActive ? (
                                                        <span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles.badgeRed}`}>Blocked</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {user.role === 'DRIVER' ? (
                                                        isVerified ? (
                                                            <span className={`${styles.badge} ${styles.badgeGreen}`}>Verified</span>
                                                        ) : (
                                                            <span className={`${styles.badge} ${styles.badgeYellow}`}>Pending</span>
                                                        )
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles.badgeGray}`}>N/A</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        {user.role === 'DRIVER' && !isVerified && (
                                                            <Button size="sm" onClick={() => handleVerifyDriver(user.id)} className={styles.actionBtn}>
                                                                <CheckCircle size={14} /> Verify
                                                            </Button>
                                                        )}
                                                        {isActive && user.role !== 'ADMIN' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleBlockUser(user)} className={`${styles.actionBtn} ${styles.btnDanger}`}>
                                                                <ShieldAlert size={14} /> Block
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(activeTab === 'rides' || activeTab === 'overview') && (
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Ride Console</h2>
                            {activeTab === 'overview' && (
                                <Button size="sm" variant="outline" onClick={() => setActiveTab('rides')}>View All</Button>
                            )}
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Ride ID</th>
                                        <th>Driver Name</th>
                                        <th>Route</th>
                                        <th>Date & Time</th>
                                        <th>Seats</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rides.map(ride => (
                                        <tr key={ride.id}>
                                            <td>#{ride.id}</td>
                                            <td>{ride.driverName || ride.driver?.name || 'Unknown'}</td>
                                            <td>{ride.source} ➝ {ride.destination}</td>
                                            <td>{ride.travelDate || ride.date} {ride.travelTime || ride.time}</td>
                                            <td>{ride.availableSeats || ride.seats}</td>
                                            <td>
                                                <span className={`${styles.badge} ${ride.status === 'AVAILABLE' ? styles.badgeGreen : ride.status === 'FULL' ? styles.badgeYellow : styles.badgeRed}`}>
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td>
                                                {ride.status !== 'CANCELLED' && ride.status !== 'CANCELLED_BY_ADMIN' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleCancelRide(ride.id)} className={`${styles.actionBtn} ${styles.btnDanger}`}>
                                                        <XCircle size={14} /> Cancel Ride
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
