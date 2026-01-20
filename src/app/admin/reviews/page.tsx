'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Star, Check, X, Trash2, CheckCircle2, XCircle } from 'lucide-react';

type Review = {
    id: number;
    rating: number;
    comment: string;
    is_approved: boolean;
    created_at: string;
    reviewer_name?: string;
    profiles?: { full_name: string };
    products?: { name: string };
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    // Reset selection when filter changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews?filter=${filter}`);
            const data = await res.json();
            if (data.reviews) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        await fetch('/api/admin/reviews', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_approved: true })
        });
        fetchReviews();
    };

    const handleReject = async (id: number) => {
        await fetch('/api/admin/reviews', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_approved: false })
        });
        fetchReviews();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        await fetch('/api/admin/reviews', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchReviews();
    };

    // Bulk Actions
    const handleSelectAll = () => {
        if (selectedIds.size === reviews.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(reviews.map(r => r.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) return;
        await fetch('/api/admin/reviews', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedIds), is_approved: true })
        });
        setSelectedIds(new Set());
        fetchReviews();
    };

    const handleBulkReject = async () => {
        if (selectedIds.size === 0) return;
        await fetch('/api/admin/reviews', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedIds), is_approved: false })
        });
        setSelectedIds(new Set());
        fetchReviews();
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} reviews?`)) return;
        await fetch('/api/admin/reviews', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedIds) })
        });
        setSelectedIds(new Set());
        fetchReviews();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    Reviews Management
                    {selectedIds.size > 0 && (
                        <span style={{ fontSize: '0.9rem', background: '#e5e7eb', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 'normal' }}>
                            {selectedIds.size} Selected
                        </span>
                    )}
                </h1>

                {selectedIds.size > 0 ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={handleBulkApprove}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#dcfce7', color: '#166534', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                        >
                            <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                            onClick={handleBulkReject}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#fef3c7', color: '#92400e', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                        >
                            <XCircle size={16} /> Disapprove
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 0.5rem' }}></div>
                        <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>Cancel</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['pending', 'approved', 'all'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: filter === f ? '2px solid var(--color-mango-500)' : '1px solid #ddd',
                                    background: filter === f ? 'var(--color-mango-50)' : 'white',
                                    fontWeight: filter === f ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>No {filter !== 'all' ? filter : ''} reviews found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Select All Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={selectedIds.size === reviews.length && reviews.length > 0}
                            onChange={handleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label style={{ fontSize: '0.9rem', color: '#666', cursor: 'pointer' }} onClick={handleSelectAll}>Select All {reviews.length} Reviews</label>
                    </div>

                    {reviews.map(review => (
                        <div key={review.id} className="card" style={{ padding: '1.5rem', border: selectedIds.has(review.id) ? '1px solid var(--color-mango-500)' : '1px solid transparent' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(review.id)}
                                        onChange={() => toggleSelect(review.id)}
                                        style={{ marginTop: '5px', width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <strong>{review.products?.name || `Product ID: ${review.id}`}</strong>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                background: review.is_approved ? '#dcfce7' : '#fef3c7',
                                                color: review.is_approved ? '#166534' : '#92400e'
                                            }}>
                                                {review.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', color: '#fbbf24', marginBottom: '0.5rem' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < review.rating ? '#fbbf24' : 'none'} stroke="#fbbf24" />
                                            ))}
                                        </div>
                                        <p style={{ color: '#555', marginBottom: '0.5rem' }}>{review.comment}</p>
                                        <div style={{ fontSize: '0.85rem', color: '#999' }}>
                                            By {review.reviewer_name || review.profiles?.full_name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!review.is_approved && (
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#dcfce7', border: 'none', cursor: 'pointer' }}
                                            title="Approve"
                                        >
                                            <Check size={18} color="#166534" />
                                        </button>
                                    )}
                                    {review.is_approved && (
                                        <button
                                            onClick={() => handleReject(review.id)}
                                            style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fef3c7', border: 'none', cursor: 'pointer' }}
                                            title="Unapprove"
                                        >
                                            <X size={18} color="#92400e" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fee2e2', border: 'none', cursor: 'pointer' }}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} color="#dc2626" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
