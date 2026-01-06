import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import QuickBookCard from '../../components/passenger/QuickBookCard';
import LiveTrackingCard from '../../components/passenger/LiveTrackingCard';
import InteractiveMap from '../../components/maps/InteractiveMap';
import UserProfileModal from '../../components/UserProfileModal';
import { searchRides, bookRide, getRecentRoutes, getActiveRide } from '../../services/api';
import styles from './PassengerDashboard.module.css';
import { Search, MapPin, Calendar, Clock, User, CheckCircle, Filter, Map as MapIcon } from 'lucide-react';

const PassengerDashboard = () => {
    // Search State
    const [searchParams, setSearchParams] = useState({ 
        source: '', destination: '', date: '',
        minPrice: '', maxPrice: '', minSeats: 1
    });
    
    // Data State
    const [rides, setRides] = useState([]);
    const [recentRoutes, setRecentRoutes] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [showMapView, setShowMapView] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [viewProfileId, setViewProfileId] = useState(null);
    
    // Interaction State
    const [selectedRide, setSelectedRide] = useState(null); 
    const [seatsToBook, setSeatsToBook] = useState(1);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [hoveredRideId, setHoveredRideId] = useState(null);
    
    const rideCardRefs = useRef({});

    // Initial Fetch
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // 1. Fetch All Rides (Browse Mode)
                const ridesData = await searchRides({});
                setRides(ridesData || []);

                // 2. Fetch Recent Routes (Optional - may not be implemented yet)
                try {
                    const routesData = await getRecentRoutes();
                    setRecentRoutes(routesData || []);
                } catch (err) {
                    console.log("Recent routes not available:", err.message);
                    setRecentRoutes([]); // Set empty array if endpoint not available
                }

                // 3. Fetch Active Ride (if any)
                try {
                    const activeData = await getActiveRide();
                    setActiveRide(activeData);
                } catch (err) {
                    console.log("No active ride:", err.message);
                    setActiveRide(null);
                }
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const handleSearchChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const performSearch = async (filters) => {
        setLoading(true);
        try {
            const data = await searchRides(filters);
            setRides(data || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performSearch(searchParams);
    };

    const handleQuickBook = (route) => {
        setSearchParams({ ...searchParams, source: route.source, destination: route.destination });
        performSearch({ source: route.source, destination: route.destination });
    };

    const handleMarkerClick = (rideId) => {
        const card = rideCardRefs.current[rideId];
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Optional: Add highlight logic here
        }
    };

    const confirmBooking = async () => {
        try {
            await bookRide(selectedRide.id, seatsToBook);
            setBookingStatus('success');
            setTimeout(() => { setSelectedRide(null); setBookingStatus(null); }, 2000);
        } catch (error) {
            setBookingStatus('error');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            {/* 1. Live Tracking Section (Top Priority) */}
            {activeRide && (
                <div className="container" style={{ marginTop: '2rem' }}>
                    <LiveTrackingCard activeRide={activeRide} />
                </div>
            )}

            {/* 2. Search Hero */}
            <div className={styles.searchHero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Find your ride</h1>
                    
                    {/* Quick Book Widget */}
                    {recentRoutes.length > 0 && (
                        <div className={styles.quickBookSection}>
                            <h3 className={styles.quickBookTitle}>Book Again</h3>
                            <div className={styles.quickBookGrid}>
                                {recentRoutes.map((route, idx) => (
                                    <QuickBookCard key={idx} route={route} onClick={handleQuickBook} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Form */}
                    <div className={styles.searchContainer}>
                        <form onSubmit={handleSearchSubmit}>
                            <div className={styles.searchBar}>
                                <div className={styles.searchInput}>
                                    <MapPin size={18} className={styles.icon} />
                                    <input type="text" name="source" placeholder="Leaving from" value={searchParams.source} onChange={handleSearchChange} />
                                </div>
                                <div className={styles.divider}></div>
                                <div className={styles.searchInput}>
                                    <MapPin size={18} className={styles.icon} />
                                    <input type="text" name="destination" placeholder="Going to" value={searchParams.destination} onChange={handleSearchChange} />
                                </div>
                                <div className={styles.divider}></div>
                                <div className={styles.searchInput}>
                                    <Calendar size={18} className={styles.icon} />
                                    <input type="date" name="date" value={searchParams.date} onChange={handleSearchChange} />
                                </div>
                                <Button type="submit" className={styles.searchBtn}><Search size={20} /> Search</Button>
                            </div>
                            
                            <div className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                                <Filter size={16} /> {showFilters ? "Hide Filters" : "Advanced Filters"}
                            </div>

                            {showFilters && (
                                <div className={styles.filterBar}>
                                    <div className={styles.filterItem}>
                                        <label>Min Price</label>
                                        <input type="number" name="minPrice" placeholder="0" value={searchParams.minPrice} onChange={handleSearchChange} />
                                    </div>
                                    <div className={styles.filterItem}>
                                        <label>Max Price</label>
                                        <input type="number" name="maxPrice" placeholder="5000" value={searchParams.maxPrice} onChange={handleSearchChange} />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* 3. Results Section (Map + List) */}
            <div className="container">
                <div className={styles.viewToggle}>
                    <Button variant={!showMapView ? 'primary' : 'outline'} onClick={() => setShowMapView(false)}>List View</Button>
                    <Button variant={showMapView ? 'primary' : 'outline'} onClick={() => setShowMapView(true)}><MapIcon size={16}/> Map View</Button>
                </div>

                <div className={styles.resultsSection}>
                    {loading ? <p>Searching...</p> : rides.length === 0 ? <div className={styles.emptyState}>No rides found.</div> : (
                        showMapView ? (
                            <div className={styles.splitView}>
                                <div className={styles.mapContainer}>
                                    <InteractiveMap 
                                        rides={rides} 
                                        onMarkerClick={handleMarkerClick}
                                        highlightedRideId={hoveredRideId}
                                    />
                                </div>
                                <div className={styles.listContainer}>
                                    {rides.map(ride => (
                                        <div 
                                            key={ride.id} 
                                            className={styles.rideCard} 
                                            ref={el => rideCardRefs.current[ride.id] = el}
                                            onMouseEnter={() => setHoveredRideId(ride.id)}
                                            onMouseLeave={() => setHoveredRideId(null)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <div className={styles.driverInfo} onClick={() => setViewProfileId(ride.driver.id)} style={{cursor: 'pointer'}}>
                                                    <div className={styles.avatar}>{ride.driver.name[0]}</div>
                                                    <div><h4>{ride.driver.name}</h4><p className={styles.carModel}>{ride.driver.vehicleModel}</p></div>
                                                </div>
                                                <div className={styles.price}>₹{ride.pricePerSeat}</div>
                                            </div>
                                            <div className={styles.rideDetails}>
                                                <div className={styles.timeLoc}><Clock size={16} /> {ride.travelTime}</div>
                                                <div className={styles.seats}><User size={16} /> {ride.availableSeats} seats</div>
                                            </div>
                                            <div className={styles.routeDisplay}>{ride.source} ➝ {ride.destination}</div>
                                            <Button className={styles.bookBtn} onClick={() => setSelectedRide(ride)}>Request to Book</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.ridesGrid}>
                                {rides.map((ride) => (
                                    <div key={ride.id} className={styles.rideCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.driverInfo} onClick={() => setViewProfileId(ride.driver.id)} style={{cursor: 'pointer'}}>
                                                <div className={styles.avatar}>{ride.driver.name[0]}</div>
                                                <div><h4>{ride.driver.name}</h4><p className={styles.carModel}>{ride.driver.vehicleModel}</p></div>
                                            </div>
                                            <div className={styles.price}>₹{ride.pricePerSeat}</div>
                                        </div>
                                        <div className={styles.rideDetails}>
                                            <div className={styles.timeLoc}><Clock size={16} /> {ride.travelTime}</div>
                                            <div className={styles.seats}><User size={16} /> {ride.availableSeats} seats</div>
                                        </div>
                                        <div className={styles.routeDisplay}>{ride.source} ➝ {ride.destination}</div>
                                        <Button className={styles.bookBtn} onClick={() => setSelectedRide(ride)}>Request to Book</Button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Modals */}
            {viewProfileId && <UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />}
            
            {selectedRide && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Confirm Request</h2>
                        <div className={styles.modalContent}>
                            <div className={styles.summaryRow}><span>Driver</span> <strong>{selectedRide.driver.name}</strong></div>
                            <div className={styles.summaryRow}><span>Route</span> <strong>{selectedRide.source} ➝ {selectedRide.destination}</strong></div>
                            <div className={styles.inputRow}>
                                <label>Number of Seats</label>
                                <input type="number" min="1" max={selectedRide.availableSeats} value={seatsToBook} onChange={(e) => setSeatsToBook(e.target.value)} className={styles.seatInput} />
                            </div>
                            <div className={styles.totalRow}><span>Total Price</span> <span className={styles.totalPrice}>₹{selectedRide.pricePerSeat * seatsToBook}</span></div>
                            {bookingStatus === 'success' && <div className={styles.successMessage}><CheckCircle size={18} /> Request Sent!</div>}
                        </div>
                        <div className={styles.modalActions}>
                            <Button variant="outline" onClick={() => setSelectedRide(null)}>Cancel</Button>
                            <Button onClick={confirmBooking} disabled={bookingStatus === 'success'}>{bookingStatus === 'success' ? 'Sent' : 'Send Request'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassengerDashboard;