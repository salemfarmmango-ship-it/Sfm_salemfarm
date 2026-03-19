'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const DEFAULT_SLIDES = [
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
        bgPositionDesktop: 'right top'
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
        bgPositionDesktop: 'center top'
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
        bgPositionDesktop: 'center top'
    }
];

interface HeroSlide {
    id: string | number;
    image: string;
    bgImage: string;
    title: string;
    subtitle: string;
    price: string;
    ctaLink: string;
    bgColor: string;
    badge: string;
    badgeColor: string;
    bgPositionDesktop: string;
}

interface HeroCarouselProps {
    livePreviewSlides?: any[];
    isCompact?: boolean;
    forceMode?: 'mobile' | 'tablet' | 'desktop';
}

export const HeroCarousel = ({ livePreviewSlides, isCompact, forceMode }: HeroCarouselProps) => {
    const [current, setCurrent] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [dbSlides, setDbSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(!livePreviewSlides);

    // Determine which slides to show
    const activeSlides = livePreviewSlides || (dbSlides.length > 0 ? dbSlides : DEFAULT_SLIDES);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
        // Fetch real slides if not in preview mode
        if (!livePreviewSlides) {
            fetch('/api/hero-slides')
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        // Map db fields to component props if necessary
                        setDbSlides(data.map((s: any) => ({
                            id: s.id,
                            image: s.image,
                            bgImage: s.bg_image,
                            title: s.title,
                            subtitle: s.subtitle,
                            price: s.price,
                            ctaLink: s.cta_link,
                            bgColor: s.bg_color,
                            badge: s.badge,
                            badgeColor: s.badge_color,
                            bgPositionDesktop: s.bg_position_desktop,
                            textWidth: s.text_width
                        })));
                    }
                })
                .catch(err => console.error('Failed to load hero slides', err))
                .finally(() => setIsLoading(false));
        }
    }, [livePreviewSlides]);

    // Handle when slide count changes during live preview shrinking
    useEffect(() => {
        if (current >= activeSlides.length) {
            setCurrent(0);
        }
    }, [activeSlides.length, current]);

    useEffect(() => {
        const handleResize = () => {
            if (forceMode) {
                setIsMobile(forceMode === 'mobile');
                setIsTablet(forceMode === 'tablet');
            } else {
                setIsMobile(window.innerWidth < 768);
                setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [forceMode]);

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
            setCurrent((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
            resetTimeout();
        } else if (isRightSwipe) {
            setCurrent((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
            resetTimeout();
        }
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        if (activeSlides.length === 0) return;
        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrent((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1)),
            5000
        );
        return () => resetTimeout();
    }, [current, activeSlides.length]);

    if (isLoading && !livePreviewSlides) {
        return (
            <div style={{ padding: 'var(--space-4)', paddingBottom: 'var(--space-12)' }}>
                <div className="container" style={{ padding: 0 }}>
                    <div style={{
                        borderRadius: '1.5rem',
                        height: (isMobile || isCompact) ? '320px' : '420px',
                        background: '#f3f4f6',
                        animation: 'pulse 2s infinite'
                    }} />
                </div>
            </div>
        );
    }

    if (activeSlides.length === 0) return null;

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
                        minHeight: (isMobile || isCompact || isTablet) ? '320px' : '420px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        touchAction: 'pan-y',
                        background: '#f3f4f6',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>

                    <div style={{
                        display: 'flex',
                        transition: 'transform 0.5s ease',
                        transform: `translateX(-${current * 100}%)`,
                        flex: 1,
                        width: '100%',
                        userSelect: 'none',
                        alignItems: 'stretch'
                    }}>
                        {activeSlides.map((slide) => (
                            <div key={slide.id} style={{
                                flex: '0 0 100%',
                                width: '100%',
                                display: 'flex',
                                position: 'relative',
                                padding: isMobile ? '2.5rem 1.25rem' : isTablet ? '3rem 3.5rem' : (isCompact ? '1.5rem 1.5rem' : '4rem 5rem'),
                                boxSizing: 'border-box',
                                alignItems: 'center',
                                overflow: 'hidden',
                                backgroundColor: slide.bgColor,
                                backgroundImage: `url(${slide.bgImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: isMobile ? 'center top' : slide.bgPositionDesktop,
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
                                        : isTablet
                                            ? 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0) 100%)'
                                            : 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0) 60%)',
                                    zIndex: 1
                                }}></div>

                                {/* Text Content */}
                                <div style={{ flex: '1.2', paddingRight: '1rem', zIndex: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '600' }}>{slide.badge}</span>
                                        <span style={{
                                            background: slide.badgeColor,
                                            color: 'white',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>15%</span>
                                    </div>
                                    {/* Title */}
                                    <h2 style={{
                                        fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : (isCompact ? '1.5rem' : '2.5rem'),
                                        lineHeight: '1.2',
                                        marginBottom: '0.75rem',
                                        color: '#111827',
                                        fontWeight: '800',
                                        textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                                        whiteSpace: (isMobile || isTablet) ? 'pre-line' : 'normal',
                                        maxWidth: (isMobile || isTablet) ? '100%' : `${slide.textWidth || 55}%`
                                    }}>
                                        {slide.title}
                                    </h2>

                                    <p style={{
                                        fontSize: isMobile ? '0.85rem' : isTablet ? '1rem' : (isCompact ? '0.9rem' : '1.1rem'),
                                        color: '#374151',
                                        marginBottom: '1.25rem',
                                        lineHeight: '1.4',
                                        fontWeight: (isMobile || isCompact) ? '400' : '500',
                                        maxWidth: isMobile ? '100%' : isTablet ? '80%' : `${slide.textWidth || 55}%`,
                                        whiteSpace: (isMobile || isTablet) ? 'pre-line' : 'normal',
                                        overflow: 'visible'
                                    }}>
                                        {slide.subtitle}
                                    </p>

                                    <div style={{ marginBottom: '1.25rem', fontSize: '1rem', color: '#111827', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '400' }}>Starts from</span>
                                        <span style={{ color: '#dc2626', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '800' }}>{slide.price.replace('Starts from ', '')}</span>
                                    </div>

                                    <Link href={slide.ctaLink}>
                                        <button
                                            suppressHydrationWarning
                                            style={{
                                                background: '#365314',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: isMobile ? '0.6rem 1.25rem' : '0.75rem 1.5rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: isMobile ? '0.9rem' : '1rem',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}>
                                            Shop Now <ArrowRight size={isMobile ? 16 : 18} />
                                        </button>
                                    </Link>
                                </div>

                                {/* Foreground Image */}
                                {slide.image && (
                                    <div style={{
                                        flex: '1',
                                        display: isMobile ? 'none' : 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 2,
                                        height: '100%',
                                        position: 'relative'
                                    }}>
                                        <img
                                            src={slide.image}
                                            alt=""
                                            style={{
                                                maxHeight: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))'
                                            }}
                                        />
                                    </div>
                                )}
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
                        {activeSlides.map((_, idx) => (
                            <button
                                key={idx}
                                suppressHydrationWarning
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
