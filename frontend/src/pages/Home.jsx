import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import heroImage from '../assets/hero.png';
import styles from './Home.module.css';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll to section if state is present
    useEffect(() => {
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                // Clear state to prevent scrolling on subsequent renders/refreshes
                window.history.replaceState({}, document.title);
            }
        }
    }, [location]);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            {/* Hero Section */}
            <div className={styles.mainContent}>
                {/* Left Content */}
                <div className={styles.textContent}>
                    <p className={styles.badge}>PREMIUM MOBILITY PLATFORM</p>
                    <h1 className={styles.headline}>
                        Carpool your <br />
                        events with us.
                    </h1>
                    <p className={styles.subheadline}>
                        Smart. Simple. Seamless travel.
                    </p>
                    <p className={styles.description}>
                        Join or create a ride for events, trips, and daily travel. <br />
                        Eco-friendly carpooling for everyone.
                    </p>

                    <div className={styles.ctaGroup}>
                        <Button
                            className={styles.primaryBtn}
                            onClick={() => navigate('/login')}
                        >
                            Find a ride
                        </Button>
                        <Button
                            variant="outline"
                            className={styles.secondaryBtn}
                            onClick={() => navigate('/register')}
                        >
                            Become a host
                        </Button>
                    </div>
                </div>

                {/* Right Image */}
                <div className={styles.imageContainer}>
                    <div className={styles.imageOverlay}></div>
                    <img src={heroImage} alt="Ride Share" className={styles.heroImage} />
                </div>
            </div>

            {/* About Us Section */}
            <section id="about" className={styles.aboutSection}>
                <div className={styles.aboutContainer}>
                    <div className={styles.aboutContent}>
                        <h2>Why RideConnect?</h2>
                        <p>
                            Experience the future of travel. Smart, sustainable, and community-driven.
                            Connect with verified drivers and passengers for a seamless journey that saves you money and the planet.
                        </p>
                    </div>
                    <div className={styles.aboutImage}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <h3>Safe & Verified</h3>
                            <p>Every member is verified. Travel with confidence knowing who you're sharing a ride with.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </div>
                            <h3>Community Driven</h3>
                            <p>Connect with like-minded people. Make new friends and grow your professional network.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.88-5.74 5.88-5.74-5.88z" /><path d="M12 22.31l5.74-5.88-5.74-5.88-5.74 5.88z" /></svg>
                            </div>
                            <h3>Eco-Friendly</h3>
                            <p>Reduce your carbon footprint. Every shared ride contributes to a greener planet.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
                            </div>
                            <h3>Cost Effective</h3>
                            <p>Save money on every trip. Split fuel costs and enjoy affordable travel options.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
