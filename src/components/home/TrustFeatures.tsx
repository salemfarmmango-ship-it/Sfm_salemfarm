'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Truck, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

const features = [
    {
        id: 1,
        icon: Leaf,
        title: '100% Organic',
        description: 'Certified naturally grown produce — no pesticides, no compromise.',
        accent: '#2d6a2d',
        accentLight: '#edf7ed',
        accentMid: '#357a35',
        number: '01',
    },
    {
        id: 2,
        icon: Truck,
        title: 'Pan-India Delivery',
        description: 'Temperature-controlled packaging with express nationwide shipping.',
        accent: '#b36b00',
        accentLight: '#fff8e1',
        accentMid: '#e69500',
        number: '02',
    },
    {
        id: 3,
        icon: ShieldCheck,
        title: 'Secure Payments',
        description: 'Bank-grade 256-bit SSL encryption for every transaction.',
        accent: '#1b4f72',
        accentLight: '#eaf4fb',
        accentMid: '#2471a3',
        number: '03',
    },
    {
        id: 4,
        icon: HeartHandshake,
        title: 'Farm to Table',
        description: 'Harvested at peak ripeness, delivered directly from our Salem orchards.',
        accent: '#6d2f7e',
        accentLight: '#f5eef8',
        accentMid: '#8e44ad',
        number: '04',
    },
];

export const TrustFeatures = () => {
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
                @keyframes tf-slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .trust-card {
                    position: relative;
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 2.25rem 2rem;
                    overflow: hidden;
                    transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease;
                    cursor: default;
                }
                .trust-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 48px rgba(0,0,0,0.10);
                }
            `}</style>

            <section
                ref={sectionRef}
                style={{
                    padding: '3rem 1rem',
                    borderBottom: '1px solid #eaecef',
                    background: 'linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%)',
                }}
            >
                {/* Section Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2.5rem',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--color-green-600)',
                        marginBottom: '0.4rem',
                    }}>
                        Why Choose Us
                    </p>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
                        fontWeight: '400',
                        color: '#0f1923',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }}>
                        Our Promise to You
                    </h2>
                </div>

                {/* Cards Grid */}
                <div className="container" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                    gap: '1.25rem',
                }}>
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className="trust-card"
                            style={{
                                opacity: visible ? 1 : 0,
                                animation: visible
                                    ? `tf-slideUp 0.6s cubic-bezier(.22,.68,0,1.2) ${index * 0.12}s both`
                                    : 'none',
                                border: `1px solid ${feature.accentMid}33`,
                                boxShadow: `0 4px 20px ${feature.accent}14`,
                            }}
                        >
                            {/* Background number watermark */}
                            <span style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1.25rem',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '4.5rem',
                                fontWeight: '800',
                                color: feature.accent,
                                opacity: 0.07,
                                lineHeight: 1,
                                userSelect: 'none',
                                pointerEvents: 'none',
                                letterSpacing: '-0.04em',
                            }}>
                                {feature.number}
                            </span>

                            {/* Icon — always solid colored circle */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: feature.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.25rem',
                            }}>
                                <feature.icon
                                    size={26}
                                    strokeWidth={1.75}
                                    color="#ffffff"
                                />
                            </div>

                            {/* Content */}
                            <h3 style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                letterSpacing: '-0.01em',
                                color: '#0f1923',
                                marginBottom: '0.5rem',
                                lineHeight: 1.3,
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.85rem',
                                fontWeight: '400',
                                color: '#64748b',
                                lineHeight: 1.65,
                                margin: 0,
                            }}>
                                {feature.description}
                            </p>

                            {/* Bottom accent line — always full width */}
                            <span style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                height: '3px',
                                width: '100%',
                                background: feature.accent,
                                borderRadius: '0 0 20px 20px',
                            }} />
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};
