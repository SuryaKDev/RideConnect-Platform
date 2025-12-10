import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '../../components/ui/Button';
import { searchRides, bookRide } from '../../services/api';
import styles from './PassengerDashboard.module.css';
import { Search, MapPin, Calendar, Clock, User, CheckCircle, Filter } from 'lucide-react';

const PassengerDashboard = () => {
    // Consolidated state for all search params
    const [searchParams, setSearchParams] = useState({ 
        source: '', 
        destination: '', 
        date: '',
        minPrice: '',
        maxPrice: '',
        minSeats: 1
    });
    
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null); 
    const [seatsToBook, setSeatsToBook] = useState(1);
    const [bookingStatus, setBookingStatus] = useState(null); 
    const [showFilters, setShowFilters] = useState(false); // Toggle for advanced filters

    const handleSearchChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            // Pass the whole object to our updated API function
            const data = await searchRides(searchParams);

            const mappedRides = data.map(ride => ({
                id: ride.id,
                driverName: ride.driver.name,
                carModel: ride.driver.vehicleModel,
                source: ride.source,
                destination: ride.destination,
                date: ride.travelDate,
                time: ride.travelTime,
                seats: ride.availableSeats,
                price: ride.pricePerSeat
            }));

            setRides(mappedRides);
            setLoading(false);
        } catch (error) {
            console.error('Search failed', error);
            setLoading(false);
        }
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
            setTimeout(() => {
                setSelectedRide(null); 
            }, 2000);
        } catch (error) {
            setBookingStatus('error');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            {/* Hero Search Section */}
            <div className={styles.searchHero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Find your ride</h1>
                    
                    <div className={styles.searchContainer}>
                        <form onSubmit={handleSearch}>
                            {/* Main Search Row */}
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
                                <Button type="submit" className={styles.searchBtn}>
                                    <Search size={20} /> Search
                                </Button>
                            </div>

                            {/* Filter Toggle */}
                            <div className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                                <Filter size={16} /> {showFilters ? "Hide Filters" : "Advanced Filters"}
                            </div>

                            {/* Advanced Filters Row */}
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

            {/* Results Section */}
            <div className="container">
                <div className={styles.resultsSection}>
                    {loading ? (
                        <p>Searching for rides...</p>
                    ) : searched && rides.length === 0 ? (
                        <div className={styles.emptyState}>No rides found for your criteria.</div>
                    ) : (
                        <div className={styles.ridesGrid}>
                            {rides.map((ride) => (
                                <div key={ride.id} className={styles.rideCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.driverInfo}>
                                            <div className={styles.avatar}>{ride.driverName[0]}</div>
                                            <div>
                                                <h4>{ride.driverName}</h4>
                                                <p className={styles.carModel}>{ride.carModel}</p>
                                            </div>
                                        </div>
                                        <div className={styles.price}>₹{ride.price}</div>
                                    </div>

                                    <div className={styles.rideDetails}>
                                        <div className={styles.timeLoc}>
                                            <Clock size={16} /> {ride.time}
                                        </div>
                                        <div className={styles.seats}>
                                            <User size={16} /> {ride.seats} seats left
                                        </div>
                                    </div>

                                    <Button
                                        className={styles.bookBtn}
                                        onClick={() => handleBookClick(ride)}
                                        disabled={ride.seats === 0}
                                        style={ride.seats === 0 ? { backgroundColor: '#ccc', cursor: 'not-allowed', borderColor: '#ccc' } : {}}
                                    >
                                        {ride.seats === 0 ? 'Bookings Closed' : 'Book Now'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {selectedRide && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Confirm Booking</h2>
                        <div className={styles.modalContent}>
                            <div className={styles.summaryRow}>
                                <span>Driver:</span>
                                <strong>{selectedRide.driverName}</strong>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Route:</span>
                                <strong>{selectedRide.source} ➝ {selectedRide.destination}</strong>
                            </div>
                            <div className={styles.inputRow}>
                                <label>Number of Seats</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedRide.seats}
                                    value={seatsToBook}
                                    onChange={(e) => setSeatsToBook(e.target.value)}
                                    className={styles.seatInput}
                                />
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Price</span>
                                <span className={styles.totalPrice}>₹{selectedRide.price * seatsToBook}</span>
                            </div>

                            {bookingStatus === 'success' && (
                                <div className={styles.successMessage}>
                                    <CheckCircle size={18} /> Booking Confirmed!
                                </div>
                            )}
                            {bookingStatus === 'error' && (
                                <div className={styles.errorMessage}>Booking failed. Try again.</div>
                            )}
                        </div>
                        <div className={styles.modalActions}>
                            <Button variant="outline" onClick={() => setSelectedRide(null)}>Cancel</Button>
                            <Button onClick={confirmBooking} disabled={bookingStatus === 'success'}>
                                {bookingStatus === 'success' ? 'Confirmed' : 'Confirm Booking'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassengerDashboard;