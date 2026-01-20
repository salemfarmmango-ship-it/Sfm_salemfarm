'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Copy, Check, Info } from 'lucide-react';

interface Offer {
    id: number;
    title: string;
    description: string;
    coupon_code: string;
    image_url: string;
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchOffers = async () => {
            const { data, error } = await supabase
                .from('offers')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOffers(data);
            } else if (error) {
                console.error('Error fetching offers:', error);
            }
            setLoading(false);
        };

        fetchOffers();
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '1rem', color: '#666' }}>Fetching amazing offers for you...</p>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 90px)', paddingBottom: '4rem' }}>
            {/* Header section */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '4rem 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-green-700)', marginBottom: '1rem' }}>
                        Exclusive Offers & Coupons
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        Save big on your favorite farm-fresh mangoes and products. Copy your coupon and apply it at checkout!
                    </p>
                </div>
            </div>

            <div className="container" style={{ marginTop: '4rem' }}>
                {offers.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <Info size={48} style={{ color: '#94a3b8', marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                            Currently no active offers
                        </h2>
                        <p style={{ color: '#64748b' }}>
                            Check back later for fresh deals and seasonal discounts!
                        </p>
                    </div>
                ) : (
                    <div className="offers-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        {offers.map((offer) => (
                            <div key={offer.id} className="card offer-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', border: 'none' }}>
                                <div style={{ position: 'relative', height: '240px', width: '100%' }}>
                                    {offer.image_url ? (
                                        <Image
                                            src={offer.image_url}
                                            alt={offer.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            unoptimized
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, var(--color-green-50), var(--color-mango-50))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <span style={{ fontSize: '3.5rem' }}></span>
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: '1.25rem',
                                        right: '1.25rem',
                                        background: 'var(--color-mango-500)',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '99px',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                        letterSpacing: '0.05em'
                                    }}>
                                        SPECIAL OFFER
                                    </div>
                                </div>

                                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-green-900)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                                        {offer.title}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                        {offer.description}
                                    </p>

                                    {/* Voucher Section */}
                                    <div className="voucher-separator">
                                        <div className="voucher-cutout-left"></div>
                                        <div className="voucher-cutout-right"></div>
                                    </div>

                                    <div style={{
                                        background: '#f8fafc',
                                        margin: '0 -1.75rem -1.75rem -1.75rem',
                                        padding: '1.5rem 1.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottomLeftRadius: '24px',
                                        borderBottomRightRadius: '24px'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Promo Code
                                            </span>
                                            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--color-green-700)', fontFamily: 'monospace' }}>
                                                {offer.coupon_code}
                                            </span>
                                        </div>

                                        <div
                                            className={`copy-badge ${copiedCode === offer.coupon_code ? 'copied' : ''}`}
                                            onClick={() => copyToClipboard(offer.coupon_code)}
                                        >
                                            {copiedCode === offer.coupon_code ? (
                                                <><Check size={18} /> COPIED</>
                                            ) : (
                                                <><Copy size={18} /> COPY CODE</>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
