import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import StatCard from '../../components/admin/StatCard';
import ConfirmModal from '../../components/ConfirmModal';
import LocalToast from '../../components/LocalToast';
import { useToast } from '../../utils/useToast';
import { getAllUsers, getAllRides, verifyDriver, blockUser, cancelRideAdmin, getAdminStats } from '../../services/api';
import styles from './AdminDashboard.module.css';
import { Users, Car, DollarSign, Activity, LayoutDashboard, LogOut, Menu, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, XCircle, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for Graph (In Milestone 3.5 we can fetch this from DB)
const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 6390 },
  { name: 'Sun', revenue: 3490 },
];

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
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
                if (activeTab === 'users' || activeTab === 'overview') {
                    const uData = await getAllUsers();
                    setUsers(uData || []);
                }
                if (activeTab === 'rides' || activeTab === 'overview') {
                    const rData = await getAllRides();
                    setRides(rData || []);
                }
            } catch (error) {
                console.error(error);
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
                    if (filterStatus === 'DRIVER') return item.role === 'DRIVER';
                    if (filterStatus === 'PASSENGER') return item.role === 'PASSENGER';
                    if (filterStatus === 'BLOCKED') return !item.isActive;
                    if (filterStatus === 'PENDING') return !item.isVerified && item.role === 'DRIVER';
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
                <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.activeNav : ''}`} onClick={() => {setActiveTab('overview'); setSidebarOpen(false);}}>
                    <LayoutDashboard size={20}/> Overview
                </button>
                <button className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNav : ''}`} onClick={() => {setActiveTab('users'); setSidebarOpen(false);}}>
                    <Users size={20}/> User Management
                </button>
                <button className={`${styles.navItem} ${activeTab === 'rides' ? styles.activeNav : ''}`} onClick={() => {setActiveTab('rides'); setSidebarOpen(false);}}>
                    <Car size={20}/> Ride Console
                </button>
            </nav>
            <div className={styles.sidebarFooter}>
                <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={18}/> Logout</button>
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
                    <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={24}/></button>
                    <h1>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'users' ? 'User Management' : 'Ride Console'}</h1>
                    <div className={styles.headerInfo}>Admin Portal</div>
                </header>

                {/* Stats Row */}
                {activeTab === 'overview' && (
                    <div className={styles.statsGrid}>
                        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}`} icon={DollarSign} color="green" trend="up" trendValue="12%" />
                        <StatCard title="Active Rides" value={stats.activeRides || 0} icon={Car} color="blue" />
                        <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="purple" trend="up" trendValue="5%" />
                        <StatCard title="Completed Trips" value={stats.completedRides || 0} icon={Activity} color="orange" />
                        
                        {/* New Metrics */}
                        <StatCard 
                            title="Cancelled Rides" 
                            value={stats.cancelledRides || 0} 
                            icon={XCircle} 
                            color="red" 
                            trend="down" 
                            trendValue="2%"
                        />
                        <StatCard 
                            title="Refunded Amount" 
                            value={`₹${stats.refundedAmount ? stats.refundedAmount.toLocaleString() : '0'}`} 
                            icon={RefreshCcw} 
                            color="orange" // Reused orange, or define a new color style if needed
                        />
                    </div>
                )}

                <div className={styles.contentArea}>
                    {/* Charts */}
                    {activeTab === 'overview' && !loading && (
                        <div className={styles.chartSection}>
                            <h3>Revenue Trends</h3>
                            <div style={{width:'100%', height: 300}}>
                                <ResponsiveContainer>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name"/><YAxis/><Tooltip/><CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

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
                                        <SortableHeader label="Role" sortKey="role" />
                                        <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem'}}>Status</th>
                                        <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem'}}>Action</th>
                                    </tr>
                                </thead>
                                {loading ? <TableSkeleton cols={5} /> : (
                                    <tbody>
                                        {(activeTab === 'overview' ? recentUsers : paginatedData).map(u => {
                                            const isVerified = u.isVerified !== undefined ? u.isVerified : (u.verified !== undefined ? u.verified : false);
                                            const isActive = u.isActive !== undefined ? u.isActive : (u.active !== undefined ? u.active : true);
                                            return (
                                                <tr key={u.id}>
                                                    <td>#{u.id}</td>
                                                    <td><div className={styles.userName}>{u.name}</div><small className={styles.userEmail}>{u.email}</small></td>
                                                    <td><span className={styles.roleBadge}>{u.role}</span></td>
                                                    <td>
                                                        <div style={{display:'flex', gap:'5px', flexWrap: 'wrap'}}>
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
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>No users found matching filters.</td></tr>
                                        )}
                                    </tbody>
                                )}
                            </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {activeTab === 'users' && !loading && processedData.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, processedData.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, processedData.length)} of {processedData.length} results
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></Button>
                                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem', fontWeight: '600' }}>{currentPage}</span>
                                        <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></Button>
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
                                        <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem'}}>Status</th>
                                        <th style={{padding: '12px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem'}}>Actions</th>
                                    </tr>
                                </thead>
                                {loading ? <TableSkeleton cols={6} /> : (
                                    <tbody>
                                        {(activeTab === 'overview' ? recentRides : paginatedData).map(r => (
                                            <tr key={r.id}>
                                                <td>#{r.id}</td>
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
                                            <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>No rides found matching filters.</td></tr>
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
                                        <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></Button>
                                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem', fontWeight: '600' }}>{currentPage}</span>
                                        <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Cancel Modal */}
            {cancelModal.show && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Cancel Ride #{cancelModal.rideId}</h3>
                        <p>Please provide a reason for cancellation.</p>
                        <textarea className={styles.textarea} value={cancelModal.reason} onChange={(e) => setCancelModal({...cancelModal, reason: e.target.value})} />
                        <div className={styles.modalActions}>
                            <Button variant="outline" onClick={() => setCancelModal({ show: false, rideId: null, reason: '' })}>Close</Button>
                            <Button onClick={submitCancel} className={styles.btnDanger} style={{color:'white', background:'#dc2626'}}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default AdminDashboard;