'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Offer {
    id: number;
    title: string;
    description: string;
    coupon_code: string;
    image_url: string;
    is_active: boolean;
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
        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching offers:', error);
        } else {
            setOffers(data || []);
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
        const { data, error } = await supabase
            .from('offers')
            .insert([{
                title,
                description,
                coupon_code: couponCode.toUpperCase(),
                image_url: imageUrl,
                is_active: true
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding offer:', error);
            alert('Failed to add offer: ' + error.message);
        } else {
            setOffers([data, ...offers]);
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
                        tag: `offer-${data.id}`,
                        icon: imageUrl || '/logo.png'
                    }
                })
            }).catch(err => console.error('Failed to broadcast Push Notification:', err));

            alert('Offer added successfully!');
        }
        setSubmitting(false);
    };

    const handleDeleteOffer = async (id: number) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        const { error } = await supabase
            .from('offers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting offer:', error);
            alert('Failed to delete offer');
        } else {
            setOffers(offers.filter(o => o.id !== id));
        }
    };

    const toggleOfferStatus = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from('offers')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } else {
            setOffers(offers.map(o => o.id === id ? { ...o, is_active: !currentStatus } : o));
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manage Offers</h1>
                <Button onClick={fetchOffers} variant="outline" style={{ display: 'flex', gap: '8px' }}>
                    Refresh
                </Button>
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
                            onChange={(e) => setCouponCode(e.target.value)}
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
                            style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
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
                                <div style={{ width: '50px', height: '40px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <Image src={imageUrl} alt="Preview" fill style={{ objectFit: 'cover' }} unoptimized />
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Provide a direct link to an image (e.g., from Supabase Storage or Unsplash)</p>
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Existing Offers</h2>
                {loading ? (
                    <p>Loading offers...</p>
                ) : offers.length === 0 ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No offers created yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        {offers.map((offer) => (
                            <div key={offer.id} className="card" style={{ display: 'flex', padding: '1rem', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '100px', height: '80px', position: 'relative', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    {offer.image_url ? (
                                        <Image src={offer.image_url} alt={offer.title} fill style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <ImageIcon style={{ color: '#cbd5e1' }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{offer.title}</h3>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            background: offer.is_active ? '#dcfce7' : '#fee2e2',
                                            color: offer.is_active ? '#166534' : '#991b1b',
                                            fontWeight: '600'
                                        }}>
                                            {offer.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0' }}>{offer.description || 'No description'}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-green-700)' }}>{offer.coupon_code}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button
                                        onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                                        variant="outline"
                                        style={{ padding: '0.5rem 1rem' }}
                                    >
                                        {offer.is_active ? 'Deactivate' : 'Activate'}
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
