'use client';
import React, { useState, useEffect } from 'react';
import { Star, User, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

// Types
type Review = {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_name?: string;
};

const REVIEWS_PER_PAGE = 5;

export const ReviewSection = ({ productId }: { productId: number }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

    // Fetch Reviews & User
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Get User and Profile
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                setUserProfile(profile);
            }

            // Get Reviews (only approved ones)
            const { data, error } = await supabase
                .from('reviews')
                .select('id, rating, comment, created_at, reviewer_name')
                .eq('product_id', productId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setReviews(data as any);
            } else if (error) {
                console.error('Error fetching reviews:', error);
                setReviews([]);
            } else {
                setReviews([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review.');
            return;
        }

        setSubmitting(true);
        const { error } = await supabase.from('reviews').insert({
            product_id: productId,
            user_id: user.id,
            reviewer_name: userProfile?.full_name || user.user_metadata?.full_name || 'Anonymous',
            rating,
            comment,
            is_approved: false
        });

        setSubmitting(false);

        if (error) {
            alert('Error submitting review: ' + (error.message || 'Please try again.'));
            console.error(error);
        } else {
            setShowSuccessModal(true);
            setComment('');
            setRating(5);
        }
    };

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = visibleCount < reviews.length;

    return (
        <div style={{ padding: '2rem 0', borderTop: '1px solid var(--border-light)', marginTop: '3rem' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>
                Customer Reviews {reviews.length > 0 && <span style={{ fontSize: '1rem', color: '#666' }}>({reviews.length})</span>}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                {/* Write Review */}
                <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Write a Review</h3>
                    <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={24}
                                        fill={star <= rating ? '#fbbf24' : 'none'}
                                        stroke={star <= rating ? '#fbbf24' : '#ccc'}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Review</label>
                            <textarea
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                required
                            ></textarea>
                        </div>
                        <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
                            {submitting ? 'Submitting...' : (user ? 'Submit Review' : 'Login to Submit')}
                        </Button>
                    </form>
                </div>

                {/* List Reviews */}
                <div>
                    {loading ? (
                        <p>Loading reviews...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {visibleReviews.length > 0 ? (
                                <>
                                    {visibleReviews.map(review => (
                                        <div key={review.id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', color: '#fbbf24' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? '#fbbf24' : 'none'} stroke={i < review.rating ? '#fbbf24' : '#ccc'} />
                                                    ))}
                                                </div>
                                                <span style={{ fontWeight: 'bold' }}>{review.reviewer_name || 'Happy Customer'}</span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{review.comment}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}

                                    {hasMore && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + REVIEWS_PER_PAGE)}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid var(--color-mango-500)',
                                                background: 'white',
                                                color: 'var(--color-mango-600)',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                marginTop: '1rem'
                                            }}
                                        >
                                            Read More Reviews ({reviews.length - visibleCount} remaining)
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>No reviews yet. Be the first to review!</p>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <CheckCircle size={32} color="#16a34a" />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', color: '#1b421b' }}>Thank You!</h3>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Your review has been submitted successfully.
                        </p>
                        <Button onClick={() => setShowSuccessModal(false)} style={{ width: '100%' }}>
                            Done
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
