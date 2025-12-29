import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { searchRides, bookRide } from '../../services/api';
import UserProfileModal from '../../components/UserProfileModal'; // Ensure this path is correct locally
import styles from './PassengerDashboard.module.css';
import { Search, MapPin, Calendar, Clock, User, CheckCircle, Filter } from 'lucide-react';

const PassengerDashboard = () => {
    const [searchParams, setSearchParams] = useState({ 
        source: '', destination: '', date: '',
        minPrice: '', maxPrice: '', minSeats: 1
    });
    
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null); 
    const [seatsToBook, setSeatsToBook] = useState(1);
    const [bookingStatus, setBookingStatus] = useState(null); 
    const [showFilters, setShowFilters] = useState(false);
    
    // NEW: State for Profile Modal
    const [viewProfileId, setViewProfileId] = useState(null);

    // Initial Fetch (Browse All)
    useEffect(() => {
        performSearch({});
    }, []);

    const handleSearchChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const performSearch = async (filters) => {
        setLoading(true);
        try {
            const data = await searchRides(filters);
            const mappedRides = data.map(ride => ({
                id: ride.id,
                // Ensure we capture driver ID for the profile click
                driverId: ride.driver.id, 
                driverName: ride.driver.name,
                // Use profile pic if available
                driverPic: ride.driver.profilePictureUrl, 
                carModel: ride.driver.vehicleModel,
                source: ride.source,
                destination: ride.destination,
                stopovers: ride.stopovers,
                date: ride.travelDate,
                time: ride.travelTime,
                seats: ride.availableSeats,
                price: ride.pricePerSeat
            }));
            setRides(mappedRides);
            if (Object.keys(filters).length > 0) setSearched(true);
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

    const handleBookClick = (ride) => {
        setSelectedRide(ride);
        setSeatsToBook(1);
        setBookingStatus(null);
    };

    const confirmBooking = async () => {
        try {
            await bookRide(selectedRide.id, seatsToBook);
            setBookingStatus('success');
            setTimeout(() => { setSelectedRide(null); }, 2000);
        } catch (error) {
            setBookingStatus('error');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.searchHero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Find your ride</h1>
                    <div className={styles.searchContainer}>
                         <form onSubmit={handleSearchSubmit}>
                            {/* ... Search Bar Inputs ... */}
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

                             {/* ... Filters ... */}
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
                                    <div className={styles.filterItem}>
                                        <label>Min Seats</label>
                                        <input type="number" name="minSeats" min="1" value={searchParams.minSeats} onChange={handleSearchChange} />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.resultsSection}>
                    {loading ? <p>Searching...</p> : rides.length === 0 ? <div className={styles.emptyState}>No rides found.</div> : (
                        <div className={styles.ridesGrid}>
                            {rides.map((ride) => (
                                <div key={ride.id} className={styles.rideCard}>
                                    <div className={styles.cardHeader}>
                                        {/* INTERACTIVE DRIVER INFO: Click to open Profile */}
                                        <div 
                                            className={styles.driverInfo} 
                                            onClick={() => setViewProfileId(ride.driverId)}
                                            style={{cursor: 'pointer'}}
                                            title="View Driver Profile"
                                        >
                                            <div className={styles.avatar}>
                                                {ride.driverPic ? (
                                                    <img 
                                                        src={ride.driverPic} 
                                                        alt="" 
                                                        style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} 
                                                    />
                                                ) : (
                                                    ride.driverName[0]
                                                )}
                                            </div>
                                            <div>
                                                <h4>{ride.driverName}</h4>
                                                <p className={styles.carModel}>{ride.carModel}</p>
                                            </div>
                                        </div>
                                        <div className={styles.price}>₹{ride.price}</div>
                                    </div>

                                    <div className={styles.rideDetails}>
                                        <div className={styles.timeLoc}><Clock size={16} /> {ride.time}</div>
                                        <div className={styles.seats}><User size={16} /> {ride.seats} seats left</div>
                                    </div>
                                    {ride.stopovers && <div className={styles.stopovers}><small>Via: {ride.stopovers}</small></div>}
                                    <div className={styles.routeDisplay}>{ride.source} ➝ {ride.destination}</div>

                                    <Button className={styles.bookBtn} onClick={() => handleBookClick(ride)} disabled={ride.seats === 0}>
                                        {ride.seats === 0 ? 'Bookings Closed' : 'Request to Book'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {viewProfileId && <UserProfileModal userId={viewProfileId} onClose={() => setViewProfileId(null)} />}

            {/* Booking Modal */}
            {selectedRide && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Confirm Request</h2>
                        <div className={styles.modalContent}>
                            <div className={styles.summaryRow}><span>Driver</span> <strong>{selectedRide.driverName}</strong></div>
                            <div className={styles.summaryRow}><span>Route</span> <strong>{selectedRide.source} ➝ {selectedRide.destination}</strong></div>
                            <div className={styles.inputRow}>
                                <label>Number of Seats</label>
                                <input type="number" min="1" max={selectedRide.seats} value={seatsToBook} onChange={(e) => setSeatsToBook(e.target.value)} className={styles.seatInput} />
                            </div>
                            <div className={styles.totalRow}><span>Total Price</span> <span className={styles.totalPrice}>₹{selectedRide.price * seatsToBook}</span></div>
                            {bookingStatus === 'success' && <div className={styles.successMessage}><CheckCircle size={18} /> Request Sent!</div>}
                            {bookingStatus === 'error' && <div className={styles.errorMessage}>Request failed.</div>}
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