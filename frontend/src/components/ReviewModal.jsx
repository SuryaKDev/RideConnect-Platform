import React, { useState } from 'react';
import Button from './ui/Button';
import styles from './ReviewModal.module.css';
import { Star, X } from 'lucide-react';
import { submitReview } from '../services/api';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return alert("Please select a star rating.");
        
        setLoading(true);
        try {
            await submitReview(booking.id, rating, comment);
            onSuccess();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Rate your Trip</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20}/></button>
                </div>
                
                <div className={styles.content}>
                    <p className={styles.subtitle}>
                        How was your ride with <strong>{booking.ride.driver?.name}</strong>?
                    </p>

                    <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={32}
                                className={styles.starIcon}
                                fill={(hover || rating) >= star ? "#ffc107" : "none"}
                                color={(hover || rating) >= star ? "#ffc107" : "#cbd5e1"}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder="Share your experience (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />

                    <Button onClick={handleSubmit} disabled={loading} style={{width: '100%'}}>
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;