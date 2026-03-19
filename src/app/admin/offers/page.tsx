'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, ExternalLink, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import Image from 'next/image';

interface Offer {
    id: number;
    title: string;
    description: string;
    coupon_code: string;
    image_url: string | null;
    is_active: boolean | 1 | 0;
}

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/offers');
            if (!res.ok) throw new Error('Failed to fetch offers');
            const data = await res.json();
            setOffers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
        setLoading(false);
    };

    const handleAddOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !couponCode) {
            alert('Title and Coupon Code are required');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    coupon_code: couponCode.toUpperCase(),
                    image_url: imageUrl || null,
                    is_active: true
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create offer');

            await fetchOffers();
            setTitle('');
            setDescription('');
            setCouponCode('');
            setImageUrl('');

            // Broadcast Push Notification for New Offer
            fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    broadcast: true,
                    notification: {
                        title: 'New Offer! 🥭',
                        body: `${title} - Use code: ${couponCode.toUpperCase()}`,
                        url: `/offers`,
                        icon: imageUrl || 'https://img.salemfarmmango.com/uploads/SFMLOGO.png'
                    }
                })
            }).catch(err => console.error('Failed to send notification:', err));

            alert('Offer added successfully!');
        } catch (err: any) {
            alert('Failed to add offer: ' + err.message);
        }
        setSubmitting(false);
    };

    const handleDeleteOffer = async (id: number) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const res = await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            setOffers(offers.filter(o => o.id !== id));
        } catch (err: any) {
            alert('Failed to delete offer: ' + err.message);
        }
    };

    const toggleOfferStatus = async (offer: Offer) => {
        const newStatus = !offer.is_active;
        try {
            const res = await fetch(`/api/admin/offers?id=${offer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: offer.title,
                    description: offer.description,
                    coupon_code: offer.coupon_code,
                    image_url: offer.image_url,
                    is_active: newStatus
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update status');
            setOffers(offers.map(o => o.id === offer.id ? { ...o, is_active: newStatus } : o));
        } catch (err: any) {
            alert('Failed to update status: ' + err.message);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manage Offers</h1>
                <Button onClick={fetchOffers} variant="outline">Refresh</Button>
            </div>

            {/* Add Offer Form */}
            <div className="card" style={{ padding: '2rem', marginBottom: '3rem', background: 'white' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={20} /> Add New Offer Post
                </h2>
                <form onSubmit={handleAddOffer} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Offer Title*</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. 20% Off on First Order"
                            style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Coupon Code*</label>
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="e.g. MANGO20"
                            style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the offer details..."
                            style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Image URL</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            {imageUrl && imageUrl.startsWith('http') && (
                                <div style={{ width: '50px', height: '40px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee', flexShrink: 0 }}>
                                    <Image src={imageUrl} alt="Preview" fill style={{ objectFit: 'cover' }} unoptimized />
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Provide a direct image URL (optional)</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <Button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem' }}>
                            {submitting ? 'Creating Offer...' : 'Create Offer Post'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Offers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Existing Offers ({offers.length})</h2>
                {loading ? (
                    <p>Loading offers...</p>
                ) : offers.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No offers created yet. Use the form above to add one.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        {offers.map((offer) => (
                            <div key={offer.id} className="card" style={{ display: 'flex', padding: '1rem', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '100px', height: '80px', position: 'relative', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    {offer.image_url ? (
                                        <Image src={offer.image_url} alt={offer.title} fill style={{ objectFit: 'cover' }} unoptimized />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <ImageIcon style={{ color: '#cbd5e1' }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                                        <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{offer.title}</h3>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                            background: offer.is_active ? '#dcfce7' : '#fee2e2',
                                            color: offer.is_active ? '#166534' : '#991b1b',
                                            fontWeight: '600'
                                        }}>
                                            {offer.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 6px' }}>{offer.description || 'No description'}</p>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-green-700)', background: '#f0fdf4', padding: '3px 10px', borderRadius: '4px' }}>
                                        {offer.coupon_code}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                    <Button
                                        onClick={() => toggleOfferStatus(offer)}
                                        variant="outline"
                                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        {offer.is_active
                                            ? <><ToggleRight size={16} /> Deactivate</>
                                            : <><ToggleLeft size={16} /> Activate</>}
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteOffer(offer.id)}
                                        style={{ padding: '0.5rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    <a href="/offers" target="_blank" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
