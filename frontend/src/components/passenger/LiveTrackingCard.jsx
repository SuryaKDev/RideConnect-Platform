import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import Button from '../ui/Button';
import styles from './LiveTrackingCard.module.css';
import { Navigation, Phone, X, Maximize2 } from 'lucide-react';

const mapContainerStyle = { width: '100%', height: '200px', borderRadius: '12px' };

const LiveTrackingCard = ({ activeRide }) => {
    const [directions, setDirections] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    // Fetch directions from Google Maps
    useEffect(() => {
        if (!activeRide || !window.google || !window.google.maps) return;

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: activeRide.ride.source,
                destination: activeRide.ride.destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                }
            }
        );
    }, [activeRide]);

    if (!activeRide) return null;

    const mapCenter = directions?.routes?.[0]?.bounds?.getCenter() || { lat: 20.5937, lng: 78.9629 };
    const duration = directions?.routes?.[0]?.legs?.[0]?.duration?.text;

    return (
        <div className={styles.card}>
            <div className={styles.mapSection} style={{ position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={10}
                    options={{ disableDefaultUI: true, zoomControl: false }}
                >
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{
                                suppressMarkers: false,
                                polylineOptions: {
                                    strokeColor: "#3b82f6",
                                    strokeWeight: 4
                                }
                            }}
                        />
                    )}
                </GoogleMap>
                <button
                    onClick={() => setShowMapModal(true)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                    title="Expand Map"
                >
                    <Maximize2 size={16} color="#64748b" />
                </button>
            </div>

            <div className={styles.infoSection}>
                <div className={styles.header}>
                    <span className={styles.badge}>LIVE RIDE</span>
                    <h3>{duration ? `Arriving in ${duration}` : 'Calculating arrival...'}</h3>
                </div>

                <div className={styles.routeInfo}>
                    <Navigation size={16} className={styles.icon} />
                    <span>{activeRide.ride.source}</span>
                    <span className={styles.arrow}>→</span>
                    <span>{activeRide.ride.destination}</span>
                </div>

                <div className={styles.driverInfo}>
                    <div className={styles.avatar}>{activeRide.ride.driver.name[0]}</div>
                    <div>
                        <p className={styles.driverName}>{activeRide.ride.driver.name}</p>
                        <p className={styles.carModel}>{activeRide.ride.driver.vehicleModel}</p>
                    </div>
                    <button
                        className={styles.callBtn}
                        onClick={() => setShowContactModal(true)}
                        title="Contact driver"
                    >
                        <Phone size={18} />
                    </button>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowContactModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            <X size={20} />
                        </button>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Contact Driver</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                <strong>{activeRide.ride.driver.name}</strong>
                            </p>
                            <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#0f4c81', marginBottom: '0.5rem' }}>
                                {activeRide.ride.driver.phone || 'Phone number not available'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Call your driver to coordinate pickup details
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button
                                variant="outline"
                                onClick={() => setShowContactModal(false)}
                                style={{ flex: 1 }}
                            >
                                Close
                            </Button>
                            {activeRide.ride.driver.phone && (
                                <Button
                                    onClick={() => window.location.href = `tel:${activeRide.ride.driver.phone}`}
                                    style={{ flex: 1 }}
                                >
                                    <Phone size={16} style={{ marginRight: '0.5rem' }} />
                                    Call Now
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Map Modal */}
            {showMapModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '1200px',
                        maxHeight: '800px',
                        position: 'relative',
                        background: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden'
                    }}>
                        <button
                            onClick={() => setShowMapModal(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <X size={24} />
                        </button>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={mapCenter}
                            zoom={12}
                            options={{
                                disableDefaultUI: false,
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false
                            }}
                        >
                            {directions && (
                                <DirectionsRenderer
                                    directions={directions}
                                    options={{
                                        suppressMarkers: false,
                                        polylineOptions: {
                                            strokeColor: "#3b82f6",
                                            strokeWeight: 5
                                        }
                                    }}
                                />
                            )}
                        </GoogleMap>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveTrackingCard;