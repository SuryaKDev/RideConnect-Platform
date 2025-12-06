import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
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
            <div className={`container ${styles.navContainer}`}>
                <Link to="/" className={styles.logo}>
                    RideConnect
                </Link>

                <div className={styles.navLinks}>
                    {location.pathname !== '/login' && location.pathname !== '/register' && (
                        <>
                            <a href="#about" onClick={handleAboutClick} className={styles.navLink}>About Us</a>

                            {user?.role === 'PASSENGER' && (
                                <Link to="/passenger-dashboard">
                                    <Button size="sm" variant="outline">Find a Ride</Button>
                                </Link>
                            )}

                            {user?.role === 'DRIVER' && (
                                <Link to="/post-ride">
                                    <Button size="sm" variant="outline">Publish a Ride</Button>
                                </Link>
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
                                    </div>


                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>
                                        <User size={16} /> Profile
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
