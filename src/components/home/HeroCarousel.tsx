'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        image: '/hero-model-eating-mango.png',
        bgImage: '/Green_hero_1.png',
        title: 'Premium Salem Mangoes',
        subtitle: 'Sweet, Juicy & Chemical Free... Naturally Ripened',
        price: 'Starts from ₹149',
        ctaLink: '/shop?category=Mangoes',
        bgColor: '#F0F4E3',
        badge: 'Season Special',
        badgeColor: '#f59e0b',
        bgPositionDesktop: 'right 12% top'
    },
    {
        id: 2,
        image: '/hero-mango-model.png',
        bgImage: '/Yellow_hero_2.png',
        title: 'Daily Plucked Freshness',
        subtitle: 'Direct from trees to your doorstep within hours',
        price: 'Starts from ₹179',
        ctaLink: '/shop?category=Mangoes',
        bgColor: '#FEFCE8',
        badge: 'Farm Fresh',
        badgeColor: '#4d7c0f',
        bgPositionDesktop: 'right 12% -20px'
    },
    {
        id: 3,
        image: '/hero-model.png',
        bgImage: '/Blue_hero_3.png',
        title: 'Same Day Dispatch',
        subtitle: 'Specialized packaging for safe transit across India',
        price: 'Starts from ₹199',
        ctaLink: '/shop?category=Mangoes',
        bgColor: '#ECFDF5',
        badge: 'Fast Shipping',
        badgeColor: '#10b981',
        bgPositionDesktop: 'right 12% -10px'
    }
];

export const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
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
            setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
            resetTimeout();
        } else if (isRightSwipe) {
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
                        minHeight: isMobile ? '300px' : '400px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        touchAction: 'pan-y',
                        background: '#f3f4f6'
                    }}>

                    <div style={{
                        display: 'flex',
                        transition: 'transform 0.5s ease',
                        transform: `translateX(-${current * 100}%)`,
                        height: '100%',
                        width: '100%',
                        userSelect: 'none'
                    }}>
                        {SLIDES.map((slide) => (
                            <div key={slide.id} style={{
                                flex: '0 0 100%',
                                width: '100%',
                                display: 'flex',
                                position: 'relative',
                                padding: isMobile ? '2rem 1rem' : '2.5rem 4rem',
                                boxSizing: 'border-box',
                                minHeight: isMobile ? '300px' : '400px',
                                alignItems: 'center',
                                overflow: 'hidden',
                                backgroundColor: slide.bgColor,
                                backgroundImage: `url(${slide.bgImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: isMobile ? 'center' : slide.bgPositionDesktop,
                                backgroundRepeat: 'no-repeat'
                            }}>
                                {/* Overlay to ensure text readability */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: isMobile
                                        ? 'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)'
                                        : 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0) 60%)',
                                    zIndex: 1
                                }}></div>

                                {/* Text Content */}
                                <div style={{ flex: '1.2', paddingRight: '1rem', zIndex: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{slide.badge}</span>
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
                                        fontSize: isMobile ? '1.75rem' : '2.5rem',
                                        lineHeight: '1.2',
                                        marginBottom: '1rem',
                                        color: '#111827',
                                        fontWeight: '800',
                                        textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                                    }}>
                                        {isMobile ? (
                                            <>
                                                {slide.title.split(' ').slice(0, 2).join(' ')}
                                                <br />
                                                {slide.title.split(' ').slice(2).join(' ')}
                                            </>
                                        ) : slide.title}
                                    </h2>

                                    <p style={{
                                        fontSize: isMobile ? '0.9rem' : '1.1rem',
                                        color: '#374151',
                                        marginBottom: '1.5rem',
                                        lineHeight: '1.4',
                                        fontWeight: isMobile ? '400' : '500',
                                        maxWidth: isMobile ? '45%' : '100%',
                                        whiteSpace: 'normal',
                                        overflow: 'visible'
                                    }}>
                                        {slide.subtitle}
                                    </p>

                                    <div style={{ marginBottom: '1.5rem', fontSize: '1rem', color: '#111827', fontWeight: '600' }}>
                                        Starts from <span style={{ color: '#dc2626', fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 'bold' }}>{slide.price.replace('Starts from ', '')}</span>
                                    </div>

                                    <Link href={slide.ctaLink}>
                                        <button style={{
                                            background: '#365314',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1.5rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}>
                                            Shop Now <ArrowRight size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots (Bottom Center) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
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
                                    width: current === idx ? '32px' : '12px',
                                    height: '6px',
                                    borderRadius: '3px',
                                    border: 'none',
                                    background: current === idx ? '#111827' : 'rgba(17, 24, 39, 0.2)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
