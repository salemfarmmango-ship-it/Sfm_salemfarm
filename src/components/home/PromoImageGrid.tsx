'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const PANELS = [
    {
        id: 1,
        image: '/promo-panel-1.jpg',
        video: '/1stvid.webm',
        label: 'Sweet & Fresh Mangos',
        sublabel: 'Naturally Rich & Sweet',
        link: '/shop',
        overlay: 'rgba(180, 100, 0, 0.35)',
    },
    {
        id: 2,
        image: '/promo-panel-2.jpg',
        video: '/2slid.webm',
        label: "It's Summer Time",
        sublabel: 'Shop the Season',
        link: '/shop',
        overlay: 'rgba(30, 100, 30, 0.30)',
    },
    {
        id: 3,
        image: '/promo-panel-3.jpg',
        video: '/9vid.webm',
        label: 'Farm Fresh Harvest',
        sublabel: 'Direct from Our Orchards',
        link: '/shop?category=Mangoes',
        overlay: 'rgba(20, 60, 20, 0.30)',
    },
];

const PromoPanel = ({ panel, index, visible }: { panel: typeof PANELS[0], index: number, visible: boolean }) => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <Link
            href={panel.link}
            className="promo-panel"
            style={{
                opacity: visible ? 1 : 0,
                animation: visible
                    ? `promo-fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) ${index * 0.1}s both`
                    : 'none',
                textDecoration: 'none',
            }}
        >
            {/* Image Poster (Always visible until video fades in) */}
            <img
                src={panel.image}
                alt={panel.label}
                className="promo-media"
                style={{
                    opacity: videoLoaded ? 0 : 1,
                    transition: 'opacity 0.8s ease'
                }}
            />

            {/* Auto-playing Video */}
            {panel.video && (
                <video
                    ref={videoRef}
                    src={panel.video}
                    muted
                    loop
                    playsInline
                    autoPlay
                    onCanPlayThrough={() => setVideoLoaded(true)}
                    className="promo-media promo-video"
                    style={{
                        opacity: videoLoaded ? 1 : 0,
                        transition: 'opacity 0.8s ease'
                    }}
                />
            )}

            {/* Color overlay */}
            <div
                className="promo-panel-overlay"
                style={{ background: panel.overlay, opacity: 0.45 }}
            />

            {/* Bottom label */}
            <div className="promo-panel-label">
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    letterSpacing: '-0.01em',
                    margin: 0,
                    lineHeight: 1.2,
                }}>
                    {panel.label}
                </p>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    fontWeight: '400',
                    margin: '0.2rem 0 0',
                    opacity: 0.85,
                }}>
                    {panel.sublabel}
                </p>
                <span className="promo-panel-shop-btn">Shop Now →</span>
            </div>
        </Link>
    );
};

export const PromoImageGrid = () => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
                @keyframes promo-fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .promo-panel {
                    position: relative;
                    overflow: hidden;
                    border-radius: 16px;
                    cursor: pointer;
                    flex: 1;
                    min-width: 260px;
                    aspect-ratio: 1 / 1;
                    background: #eef2f6;
                }
                .promo-media {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.55s cubic-bezier(.22,.68,0,1.2);
                    display: block;
                    position: absolute;
                    inset: 0;
                }
                .promo-video {
                    z-index: 1;
                }
                .promo-panel:hover .promo-media {
                    transform: scale(1.06);
                }
                .promo-panel-overlay {
                    position: absolute;
                    inset: 0;
                    transition: opacity 0.4s ease;
                    z-index: 2;
                }
                .promo-panel:hover .promo-panel-overlay {
                    opacity: 0.7 !important;
                }
                .promo-panel-label {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1.5rem 1.25rem 1.25rem;
                    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%);
                    color: white;
                    transition: padding 0.35s ease;
                    z-index: 3;
                }
                .promo-panel:hover .promo-panel-label {
                    padding-bottom: 1.75rem;
                }
                .promo-panel-shop-btn {
                    display: inline-block;
                    margin-top: 0.5rem;
                    padding: 0.35rem 1rem;
                    border: 1.5px solid rgba(255,255,255,0.8);
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.08em;
                    opacity: 0;
                    transform: translateY(6px);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    text-transform: uppercase;
                }
                .promo-panel:hover .promo-panel-shop-btn {
                    opacity: 1;
                    transform: translateY(0);
                }
                @media (max-width: 767px) {
                    .promo-grid-wrapper {
                        flex-direction: column !important;
                    }
                    .promo-panel {
                        min-width: unset !important;
                        aspect-ratio: 16/9 !important;
                    }
                }
            `}</style>

            <section
                ref={ref}
                style={{
                    padding: '3rem 1rem',
                    background: '#f7f9fc',
                }}
            >
                {/* Section Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--color-green-600)',
                        marginBottom: '0.35rem',
                    }}>Our Collection</p>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        fontWeight: '400',
                        color: '#0f1923',
                        letterSpacing: '-0.02em',
                    }}>Taste the Season</h2>
                </div>

                {/* 3-Panel Grid */}
                <div className="container">
                    <div
                        className="promo-grid-wrapper"
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'stretch',
                        }}
                    >
                        {PANELS.map((panel, index) => (
                            <PromoPanel
                                key={panel.id}
                                panel={panel}
                                index={index}
                                visible={visible}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};
