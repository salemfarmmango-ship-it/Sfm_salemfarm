'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        image: '/hero-model-eating-mango.png',
        title: 'Premium Salem Mangoes',
        subtitle: 'Sweet, Juicy & Chemical Free... Naturally Ripened',
        price: 'Starts from ₹149',
        ctaLink: '/shop?category=Mangoes',
        bgColor: '#FEFCE8',
        badge: 'Season Special',
        badgeColor: '#f59e0b'
    },
    {
        id: 2,
        image: '/hero-mango-model.png',
        title: 'Morning Plucked Freshness',
        subtitle: 'Direct from trees to your doorstep within hours',
        price: 'Starts from ₹179',
        ctaLink: '/shop?category=Mangoes',
        bgColor: '#F0F4E3',
        badge: 'Farm Fresh',
        badgeColor: '#4d7c0f'
    },
    {
        id: 3,
        image: '/hero-model.png',
        title: 'Evening Courier Delivery',
        subtitle: 'Specialized packaging for safe transit across India',
        price: 'Starts from ₹199',
        ctaLink: '/shop?category=Mangoes',
        bgColor: '#ECFDF5',
        badge: 'Fast Shipping',
        badgeColor: '#10b981'
    }
];

export const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Next Slide
            setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
            resetTimeout();
        }

        if (isRightSwipe) {
            // Previous Slide
            setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
            resetTimeout();
        }
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)),
            5000
        );
        return () => resetTimeout();
    }, [current]);

    return (
        <div style={{ padding: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
            <div className="container" style={{ padding: 0 }}>

                <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        position: 'relative',
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: '1.5rem',
                        background: SLIDES[current].bgColor,
                        transition: 'background 0.5s ease',
                        minHeight: '300px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        touchAction: 'pan-y' // Allow vertical scrolling but capture horizontal
                    }}>

                    <div style={{
                        display: 'flex',
                        transition: 'transform 0.5s ease',
                        transform: `translateX(-${current * 100}%)`,
                        height: '100%'
                    }}>
                        {SLIDES.map((slide) => (
                            <div key={slide.id} style={{
                                minWidth: '100%',
                                display: 'flex',
                                position: 'relative',
                                padding: '2rem 1rem',
                                boxSizing: 'border-box',
                                height: '100%',
                                alignItems: 'center',
                                overflow: 'hidden'
                            }}>
                                {/* Text Content (Left) */}
                                <div style={{ flex: '1.2', paddingRight: '1rem', zIndex: 2 }}>

                                    {/* Top Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: '500' }}>{slide.badge}</span>
                                        <span style={{
                                            background: slide.badgeColor,
                                            color: 'white',
                                            padding: '0.1rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}>15%</span>
                                    </div>

                                    {/* Title */}
                                    <h2 style={{
                                        fontSize: '2rem',
                                        lineHeight: '1.2',
                                        marginBottom: '1rem',
                                        color: '#1f2937',
                                        fontWeight: '800'
                                    }}>
                                        {slide.title}
                                    </h2>

                                    {/* Subtitle */}
                                    <p style={{
                                        fontSize: '1rem',
                                        color: '#4b5563',
                                        marginBottom: '1.5rem',
                                        lineHeight: '1.4'
                                    }}>
                                        {slide.subtitle}
                                    </p>

                                    {/* Price */}
                                    <div style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#374151' }}>
                                        Starts from <span style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>{slide.price.replace('Starts from ', '')}</span>
                                    </div>

                                    {/* Button */}
                                    <Link href={slide.ctaLink}>
                                        <button style={{
                                            background: '#4d7c0f',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.6rem 1.2rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.95rem'
                                        }}>
                                            Shop Now <ArrowRight size={16} />
                                        </button>
                                    </Link>
                                </div>

                                {/* Image Content (Right) - Fixed to show full product */}
                                <div className="hidden-mobile" style={{
                                    flex: '0.8',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '160px',
                                        height: '160px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <img src={slide.image} alt={slide.title} style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots (Bottom Center) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 10
                    }}>
                        {SLIDES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrent(idx);
                                    resetTimeout();
                                }}
                                style={{
                                    width: '24px',
                                    height: '4px',
                                    borderRadius: '2px',
                                    border: 'none',
                                    background: current === idx ? '#374151' : '#d1d5db',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'background 0.3s'
                                }}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};
