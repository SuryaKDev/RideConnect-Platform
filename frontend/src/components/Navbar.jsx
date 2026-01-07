import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import LocalToast from './LocalToast';
import { useToast } from '../utils/useToast';
import { User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { toasts, showToast, removeToast } = useToast();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isVerified = user?.isVerified === true;

    const handlePublishRideClick = (e) => {
        if (!isVerified) {
            e.preventDefault();
            showToast(
                "Your account needs to be verified by an admin before you can publish rides. If you were recently verified, please logout and login again to refresh your status.",
                "WARNING",
                "Verification Required"
            );
        }
    };

    const handleAboutClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const element = document.getElementById('about');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: 'about' } });
        }
    };

    return (
        <nav className={styles.navbar}>
            <LocalToast toasts={toasts} onRemove={removeToast} />
            <div className={`container ${styles.navContainer}`}>
                <Link to="/" className={styles.logo}>
                    RideConnect
                </Link>

                <div className={styles.navLinks}>
                    {location.pathname !== '/login' && location.pathname !== '/register' && (
                        <>
                            {!user && <a href="#about" onClick={handleAboutClick} className={styles.navLink}>About Us</a>}

                            {user?.role === 'PASSENGER' && (
                                <Link to="/passenger-dashboard">
                                    <Button size="sm" variant="outline">Find a Ride</Button>
                                </Link>
                            )}

                            {user?.role === 'DRIVER' && (
                                <>
                                    {isVerified ? (
                                        <Link to="/post-ride">
                                            <Button size="sm" variant="outline">Publish a Ride</Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            onClick={handlePublishRideClick}
                                            style={{ cursor: 'not-allowed' }}
                                        >
                                            Publish a Ride
                                        </Button>
                                    )}
                                </>
                            )}

                            {user?.role === 'ADMIN' && (
                                <Link to="/admin-dashboard">
                                    <Button size="sm" variant="outline">Admin Dashboard</Button>
                                </Link>
                            )}
                        </>
                    )}

                    {user ? (
                        <div className={styles.profileContainer}>
                            <button
                                className={styles.profileBtn}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className={styles.avatar}>
                                    <User size={20} />
                                </div>
                            </button>

                            {showProfileMenu && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <p className={styles.userRole}>{user.name || user.role}</p>
                                        <p className={styles.userEmail}>{user.email}</p>
                                    </div>


                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                                        <User size={16} />Edit Profile
                                    </Link>

                                    {user.role === 'PASSENGER' && (
                                        <Link to="/my-bookings" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                                            <Ticket size={16} /> My Bookings
                                        </Link>
                                    )}

                                    {user.role === 'DRIVER' && (
                                        <Link to="/driver-dashboard" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                                            <LayoutDashboard size={16} /> My Rides
                                        </Link>
                                    )}

                                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>Login</Link>
                            <Link to="/register">
                                <Button size="sm" className={styles.signupBtn}>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
