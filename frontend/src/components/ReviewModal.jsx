import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from './ui/Button';
import { submitReview } from '../services/api';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submitReview(booking.id, rating, comment);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Review failed", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} color="#64748b" />
                </button>

                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#1e293b' }}>Rate Your Ride</h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={32}
                            fill={star <= rating ? "#fbbf24" : "none"}
                            color={star <= rating ? "#fbbf24" : "#cbd5e1"}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', padding: '10px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        required
                    />
                    <Button type="submit" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;