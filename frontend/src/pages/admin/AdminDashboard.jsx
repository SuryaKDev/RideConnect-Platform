import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { getAllUsers, getAllRides, verifyDriver, blockUser, cancelRideAdmin } from '../../services/api';
import UserProfileModal from '../../components/UserProfileModal';
import LocalToast from '../../components/LocalToast';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../utils/useToast';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toasts, showToast, removeToast } = useToast();

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({ 
        show: false, 
        type: 'warning',
        title: '',
        message: '', 
        onConfirm: null 
    });

    // Cancel Modal State
    const [cancelModal, setCancelModal] = useState({ show: false, rideId: null, reason: '' });
    
    // Profile Modal State
    const [viewProfileId, setViewProfileId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const data = await getAllUsers();
                setUsers(data || []);
            } else {
                const data = await getAllRides();
                setRides(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleVerify = async (id) => {
        setConfirmModal({
            show: true,
            type: 'info',
            title: 'Verify Driver',
            message: 'Are you sure you want to verify this driver? They will be able to publish rides after verification.',
            onConfirm: async () => {
                try {
                    await verifyDriver(id);
                    setUsers(users.map(u => {
                        if (u.id === id) {
                            return { ...u, isVerified: true, verified: true };
                        }
                        return u;
                    }));
                    showToast("Driver verified successfully!", "SUCCESS");
                } catch (err) { showToast(err.message, "ERROR"); }
            }
        });
    };

    const handleBlock = async (id) => {
        setConfirmModal({
            show: true,
            type: 'danger',
            title: 'Block User',
            message: "Are you sure you want to block this user? They won't be able to login anymore.",
            confirmText: 'Block User',
            onConfirm: async () => {
                try {
                    await blockUser(id);
                    setUsers(users.map(u => {
                        if (u.id === id) {
                            return { ...u, isActive: false, active: false };
                        }
                        return u;
                    }));
                    showToast("User blocked successfully!", "SUCCESS");
                } catch (err) { showToast(err.message, "ERROR"); }
            }
        });
    };

    const openCancelModal = (rideId) => {
        setCancelModal({ show: true, rideId, reason: '' });
    };

    const submitCancel = async () => {
        if (!cancelModal.reason.trim()) {
            showToast("Please provide a reason.", "WARNING");
            return;
        }
        try {
            await cancelRideAdmin(cancelModal.rideId, cancelModal.reason);
            showToast("Ride Cancelled Successfully", "SUCCESS");
            setCancelModal({ show: false, rideId: null, reason: '' });
            fetchData();
        } catch (err) {
            showToast(err.message, "ERROR");
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className="container">
                <h1 className={styles.title}>Admin Dashboard</h1>
                
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'users' ? styles.active : ''}`} 
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </button>
                    <button 
                        className={`${styles.tabBtn} ${activeTab === 'rides' ? styles.active : ''}`} 
                        onClick={() => setActiveTab('rides')}
                    >
                        Ride Console
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? <p>Loading data...</p> : (
                        activeTab === 'users' ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => {
                                        // FIX: Normalize the boolean fields
                                        // Backend might send 'verified' OR 'isVerified' depending on serialization
                                        const isVerified = u.isVerified !== undefined ? u.isVerified : (u.verified !== undefined ? u.verified : false);
                                        const isActive = u.isActive !== undefined ? u.isActive : (u.active !== undefined ? u.active : true);

                                        return (
                                            <tr key={u.id}>
                                                <td>#{u.id}</td>
                                                <td>
                                                    {u.role === 'ADMIN' ? (
                                                        <>
                                                            <div className={styles.userName}>{u.name}</div>
                                                            <small className={styles.userEmail}>{u.email}</small>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div 
                                                                className={styles.userName} 
                                                                onClick={() => setViewProfileId(u.id)}
                                                                style={{cursor: 'pointer', color: '#0f4c81'}}
                                                                title="View User Profile"
                                                            >
                                                                {u.name}
                                                            </div>
                                                            <small className={styles.userEmail}>{u.email}</small>
                                                        </>
                                                    )}
                                                </td>
                                                <td><span className={styles.roleBadge}>{u.role}</span></td>
                                                <td>
                                                    {u.role === 'DRIVER' && (
                                                        isVerified 
                                                        ? <span className={styles.verified}>Verified</span> 
                                                        : <span className={styles.pending}>Pending</span>
                                                    )}
                                                    {!isActive && <span className={styles.blocked}>Blocked</span>}
                                                    {isActive && u.role === 'PASSENGER' && <span className={styles.activeStatus}>Active</span>}
                                                    {isActive && u.role === 'DRIVER' && isVerified && <span className={styles.activeStatus}>Active</span>}
                                                </td>
                                                <td>
                                                    {u.role === 'DRIVER' && !isVerified && (
                                                        <Button size="sm" onClick={() => handleVerify(u.id)} className={styles.actionBtn}>Verify</Button>
                                                    )}
                                                    {isActive && u.role !== 'ADMIN' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            onClick={() => handleBlock(u.id)} 
                                                            style={{color: '#dc3545', borderColor: '#dc3545', marginLeft: '5px'}}
                                                        >
                                                            Block
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Driver</th><th>Route</th><th>Status</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rides.map(r => (
                                        <tr key={r.id}>
                                            <td>#{r.id}</td>
                                            <td>{r.driver?.name}</td>
                                            <td>{r.source} → {r.destination}</td>
                                            <td>
                                                <span className={r.status === 'CANCELLED_BY_ADMIN' || r.status === 'CANCELLED' ? styles.blocked : styles.verified}>
                                                    {r.status || 'AVAILABLE'}
                                                </span>
                                            </td>
                                            <td>
                                                {r.status !== 'CANCELLED' && r.status !== 'CANCELLED_BY_ADMIN' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => openCancelModal(r.id)} 
                                                        style={{color: '#dc3545', borderColor: '#dc3545'}}
                                                    >
                                                        Cancel Ride
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>

            {/* Cancel Reason Modal */}
            {cancelModal.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Cancel Ride #{cancelModal.rideId}</h3>
                        <p>Please provide a reason for cancellation. This will be visible to the driver.</p>
                        <textarea 
                            className={styles.textarea}
                            placeholder="Reason (e.g. Violation of safety policy)"
                            value={cancelModal.reason}
                            onChange={(e) => setCancelModal({...cancelModal, reason: e.target.value})}
                        />
                        <div className={styles.modalActions}>
                            <Button variant="outline" onClick={() => setCancelModal({ show: false, rideId: null, reason: '' })}>Close</Button>
                            <Button onClick={submitCancel} style={{backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white'}}>Confirm Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {viewProfileId && <UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />}
            
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.show}
                onClose={() => setConfirmModal({ ...confirmModal, show: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
            
            <LocalToast toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default AdminDashboard;