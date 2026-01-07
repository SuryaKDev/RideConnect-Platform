import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import QuickBookCard from '../../components/passenger/QuickBookCard';
import LiveTrackingCard from '../../components/passenger/LiveTrackingCard';
import InteractiveMap from '../../components/maps/InteractiveMap';
import UserProfileModal from '../../components/UserProfileModal';
import ReviewModal from '../../components/ReviewModal';
import { searchRides, bookRide, getRecentRoutes, getActiveRide, getMyBookings } from '../../services/api';
import { useToast } from '../../utils/useToast';
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
    const [history, setHistory] = useState([]);

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

    const [hasSearched, setHasSearched] = useState(false);

    const [reviewBooking, setReviewBooking] = useState(null);
    const { showToast } = useToast();

    const rideCardRefs = useRef({});

    // Initial Fetch
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // 1. Initial Fetch - Don't fetch all rides automatically
                // const ridesData = await searchRides({});
                // setRides(ridesData || []);
                setRides([]); // Start empty

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

                // 4. Fetch Ride History (My Bookings)
                try {
                    const historyData = await getMyBookings();
                    setHistory(historyData || []);
                } catch (err) {
                    console.log("History fetch failed:", err);
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
            setHasSearched(true);
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
            setHoveredRideId(rideId);
        }
    };

    const handleRateDriver = (booking) => {
        setReviewBooking(booking);
    };

    const handleReviewSuccess = () => {
        showToast("Review submitted successfully!", "SUCCESS");
        setReviewBooking(null);
        // Refresh history to potentially update status if needed (though API might not return 'REVIEWED' status yet)
    };

    const confirmBooking = async () => {
        try {
            await bookRide(selectedRide.id, seatsToBook);
            setBookingStatus('success');
            showToast("Ride booked successfully!", "SUCCESS");
            setTimeout(() => { setSelectedRide(null); setBookingStatus(null); }, 2000);
        } catch (error) {
            setBookingStatus('error');
            showToast(error.message || "Booking failed", "ERROR");
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />



            {/* 2. Search Hero */}
            <div className={styles.searchHero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Find your ride</h1>



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



            {/* 2 & 4. Results Section (Available Rides + View Toggle) */}
            <div className="container" style={{ marginTop: '2rem' }}>
                <div className={styles.viewToggle} style={{ marginBottom: '1rem' }}>
                    <Button variant={!showMapView ? 'primary' : 'outline'} onClick={() => setShowMapView(false)}>List View</Button>
                    <Button variant={showMapView ? 'primary' : 'outline'} onClick={() => setShowMapView(true)}><MapIcon size={16} /> Map View</Button>
                </div>

                <div className={styles.resultsSection}>
                    {!hasSearched ? (
                        <div className={styles.emptyState} style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                            <Search size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#64748b' }}>Ready to go?</h3>
                            <p style={{ color: '#94a3b8' }}>Enter your route and click search to see available rides.</p>
                        </div>
                    ) : (
                        loading ? <p>Searching...</p> : rides.length === 0 ? <div className={styles.emptyState}>No rides found.</div> : (
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
                                                    <div className={styles.driverInfo} onClick={() => setViewProfileId(ride.driver.id)} style={{ cursor: 'pointer' }}>
                                                        <div className={styles.avatar}>{ride.driver.name[0]}</div>
                                                        <div><h4>{ride.driver.name}</h4><p className={styles.carModel}>{ride.driver.vehicleModel}</p></div>
                                                    </div>
                                                    <div className={styles.price}>₹{ride.pricePerSeat}</div>
                                                </div>
                                                <div className={styles.rideDetails}>
                                                    <div className={styles.timeLoc}>
                                                        <Calendar size={16} /> {new Date(ride.travelDate).toLocaleDateString('en-GB')} • <Clock size={16} /> {ride.travelTime}
                                                    </div>
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
                                                <div className={styles.driverInfo} onClick={() => setViewProfileId(ride.driver.id)} style={{ cursor: 'pointer' }}>
                                                    <div className={styles.avatar}>{ride.driver.name[0]}</div>
                                                    <div><h4>{ride.driver.name}</h4><p className={styles.carModel}>{ride.driver.vehicleModel}</p></div>
                                                </div>
                                                <div className={styles.price}>₹{ride.pricePerSeat}</div>
                                            </div>
                                            <div className={styles.rideDetails}>
                                                <div className={styles.timeLoc}>
                                                    <Calendar size={16} /> {new Date(ride.travelDate).toLocaleDateString('en-GB')} • <Clock size={16} /> {ride.travelTime}
                                                </div>
                                                <div className={styles.seats}><User size={16} /> {ride.availableSeats} seats</div>
                                            </div>
                                            <div className={styles.routeDisplay}>{ride.source} ➝ {ride.destination}</div>
                                            <Button className={styles.bookBtn} onClick={() => setSelectedRide(ride)}>Request to Book</Button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )
                    )}
                </div>
            </div>

            {/* 3. Recent Searches */}
            {recentRoutes.length > 0 && (
                <div className="container" style={{ marginTop: '2rem' }}>
                    <div className={styles.quickBookSection}>
                        <h3 className={styles.quickBookTitle}>Recent Searches</h3>
                        <div className={styles.quickBookGrid}>
                            {recentRoutes.map((route, idx) => (
                                <QuickBookCard key={idx} route={route} onClick={handleQuickBook} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Live Tracking (Moved Down) */}
            {activeRide && activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED' && (
                <div className="container" style={{ marginTop: '3rem' }}>
                    <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Current Ride Status</div>
                    <LiveTrackingCard activeRide={activeRide} />
                </div>
            )}

            {/* 6. Spending Summary */}
            {history.length > 0 && (
                <div className="container" style={{ marginTop: '3rem' }}>
                    <div className={styles.sectionTitle}>Your Spending Summary</div>
                    <SpendingChart history={history} />
                </div>
            )}

            {/* 7. Ride History */}
            <div className="container" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                <h2 className={styles.sectionTitle}>Ride History</h2>
                {history.length === 0 ? (
                    <p style={{ color: '#64748b' }}>No past rides found.</p>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Route</th>
                                    <th>Driver</th>
                                    <th>Transaction ID</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{new Date(booking.bookingTime).toLocaleDateString('en-GB')}</td>
                                        <td>{booking.ride.source} → {booking.ride.destination}</td>
                                        <td>{booking.ride.driver.name}</td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                {booking.payment?.transactionId || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'COMPLETED' && (
                                                <Button size="sm" variant="outline" onClick={() => handleRateDriver(booking)}>
                                                    Rate Driver
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {viewProfileId && <UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />}
            {reviewBooking && (
                <ReviewModal
                    booking={reviewBooking}
                    onClose={() => setReviewBooking(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}

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

// Internal Component for Spending Chart
const SpendingChart = ({ history }) => {
    // Process Data: Group by Month
    const data = useMemo(() => {
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            last6Months.push({ name: monthName, uv: 0 }); // uv = Amount
        }

        history.forEach(ride => {
            if (ride.payment && ride.status === 'COMPLETED') {
                const date = new Date(ride.bookingTime);
                const monthName = date.toLocaleString('default', { month: 'short' });
                const monthEntry = last6Months.find(m => m.name === monthName);
                if (monthEntry) {
                    monthEntry.uv += ride.payment.amount;
                }
            }
        });
        return last6Months;
    }, [history]);

    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};