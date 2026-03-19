'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Tag, Copy, Check } from 'lucide-react';

interface OfferInfo {
    id: number;
    title: string;
    description: string;
    coupon_code: string;
    image_url: string;
    created_at: string;
}

interface OffersSectionProps {
    offers: OfferInfo[];
}

export const OffersSection: React.FC<OffersSectionProps> = ({ offers }) => {
    const [displayLimit, setDisplayLimit] = useState(8);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setDisplayLimit(6); // 2 columns x 3 rows
            } else {
                setDisplayLimit(8); // 4 columns x 2 rows
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const copyToClipboard = (e: React.MouseEvent, code: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (!offers || offers.length === 0) return null;

    const displayedOffers = offers.slice(0, displayLimit);
    const hasMore = offers.length > displayLimit;

    return (
        <section className="section-padding" style={{ background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ color: 'var(--color-mango-600)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Our Collection</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-green-950)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Taste the Season</h2>
                    <div style={{ width: '60px', height: '4px', background: 'var(--color-mango-500)', borderRadius: '2px', margin: '0 auto' }}></div>
                </div>

                <div className="offers-grid" style={{ 
                    display: 'grid', 
                    gap: '2rem' 
                }}>
                    {displayedOffers.map((offer) => (
                        <div key={offer.id} className="card offer-card-premium" style={{ 
                            padding: '0', 
                            overflow: 'hidden', 
                            display: 'flex', 
                            flexDirection: 'column',
                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                            border: '1px solid #f1f5f9',
                            borderRadius: '1.5rem',
                            background: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            width: '100%',
                            height: '100%'
                        }}>
                            <div style={{ 
                                height: '180px', 
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ 
                                    position: 'absolute',
                                    inset: 0,
                                    background: offer.image_url ? `url(${offer.image_url})` : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    transition: 'transform 0.6s ease'
                                }} className="offer-img-zoom" />
                                
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '1rem', 
                                    right: '1rem', 
                                    background: 'var(--color-mango-500)', 
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '50px',
                                    fontSize: '0.65rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <Tag size={12} />
                                    OFFER
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '800', 
                                    marginBottom: '0.5rem', 
                                    color: 'var(--color-green-950)',
                                    lineHeight: '1.3'
                                }}>
                                    {offer.title}
                                </h3>
                                <p style={{ 
                                    color: '#64748b', 
                                    fontSize: '0.85rem', 
                                    lineHeight: '1.5',
                                    display: '-webkit-box', 
                                    WebkitLineClamp: 2, 
                                    WebkitBoxOrient: 'vertical', 
                                    overflow: 'hidden',
                                    marginBottom: '1rem',
                                    flex: 1
                                }}>
                                    {offer.description}
                                </p>
                                
                                <div style={{
                                    background: '#f8fafc',
                                    margin: '0 -0.25rem',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px dashed #cbd5e1'
                                }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-green-700)', fontFamily: 'monospace' }}>
                                        {offer.coupon_code}
                                    </span>
                                    <button 
                                        onClick={(e) => copyToClipboard(e, offer.coupon_code)}
                                        style={{
                                            background: copiedCode === offer.coupon_code ? 'var(--color-green-600)' : 'var(--color-green-100)',
                                            color: copiedCode === offer.coupon_code ? 'white' : 'var(--color-green-700)',
                                            border: 'none',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {copiedCode === offer.coupon_code ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <Link href="/offers" style={{ 
                            display: 'inline-flex',
                            alignItems: 'center', 
                            gap: '8px',
                            color: 'var(--color-green-700)', 
                            fontWeight: '700', 
                            fontSize: '1rem', 
                            background: 'var(--color-green-50)',
                            padding: '1rem 2.5rem',
                            borderRadius: '50px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(40, 94, 40, 0.1)'
                        }} className="hover-lift">
                            View All Offers <ArrowRight size={20} />
                        </Link>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .offers-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                @media (min-width: 1024px) {
                    .offers-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                .offer-card-premium:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                    border-color: var(--color-mango-200);
                }
                .offer-card-premium:hover .offer-img-zoom {
                    transform: scale(1.08);
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                    background: var(--color-green-100);
                    box-shadow: 0 6px 15px rgba(40, 94, 40, 0.15);
                }
            `}</style>
        </section>
    );
};
