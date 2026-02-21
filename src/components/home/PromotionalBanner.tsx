'use client';

import React from 'react';
import Link from 'next/link';

export const PromotionalBanner = () => {
    return (
        <section style={{
            marginTop: '2rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="container">
                <div style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #164e63 0%, #064e3b 100%)', // Deep teal to deep green
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3rem 4rem',
                    boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.3)'
                }}
                    className="promo-banner-content"
                >
                    {/* Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 20%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 20%)',
                        backgroundSize: '100% 100%'
                    }}></div>

                    <div style={{ flex: 1, zIndex: 2, maxWidth: '600px', color: 'white' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.4rem 1rem',
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '50px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            letterSpacing: '0.5px'
                        }}>
                            🌿 SEASON SPECIAL
                        </span>
                        <h2 style={{
                            fontSize: '2.5rem',
                            marginBottom: '1rem',
                            fontWeight: '800',
                            lineHeight: '1.1',
                            color: 'white'
                        }}>
                            Pre-book Your <br />
                            <span style={{ color: '#fcd34d' }}>Alphonso Mangoes</span> Today!
                        </h2>
                        <p style={{
                            opacity: 0.9,
                            marginBottom: '2rem',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            maxWidth: '450px'
                        }}>
                            Get the first batch of the season delivered straight from our Ratnagiri farms. 100% Carbide-free and naturally ripened.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link href="/shop?category=Mangoes" className="btn" style={{
                                background: '#fcd34d',
                                color: '#064e3b',
                                padding: '1rem 2.5rem',
                                fontWeight: '700',
                                borderRadius: '50px',
                                fontSize: '1rem',
                                boxShadow: '0 4px 15px rgba(252, 211, 77, 0.4)',
                                border: 'none',
                                transition: 'transform 0.2s ease'
                            }}>
                                Book Now
                            </Link>
                            <Link href="/contact" className="btn" style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(5px)',
                                color: 'white',
                                padding: '1rem 2rem',
                                fontWeight: '600',
                                borderRadius: '50px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                fontSize: '1rem'
                            }}>
                                Bulk Enquiry
                            </Link>
                        </div>
                    </div>

                    {/* Image side - Hidden on small mobile */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        position: 'relative',
                        zIndex: 1
                    }}
                        className="hidden-mobile-image"
                    >
                        {/* Replace with actual image later or use a decorative element */}
                        <div style={{
                            width: '350px',
                            height: '350px',
                            background: 'radial-gradient(circle, #fbbf24 0%, rgba(251, 191, 36, 0) 70%)',
                            opacity: 0.4,
                            borderRadius: '50%',
                            filter: 'blur(40px)',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}></div>
                        {/* Placeholder circle for image */}
                        <div style={{
                            width: '320px',
                            height: '320px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            border: '8px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <span style={{ fontSize: '6rem' }}>🥭</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 992px) {
                    .promo-banner-content {
                        flex-direction: column;
                        padding: 2.5rem 1.5rem !important;
                        text-align: center;
                        align-items: center !important;
                    }
                    .hidden-mobile-image {
                        display: none !important;
                    }
                    .promo-banner-content h2 {
                        fontSize: 1.8rem !important;
                    }
                    .promo-banner-content p {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    div[style*="display: flex"] {
                        justify-content: center;
                    }
                }
            `}</style>
        </section>
    );
};
