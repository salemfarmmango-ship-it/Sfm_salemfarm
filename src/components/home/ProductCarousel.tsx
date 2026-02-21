'use client';

import React, { useRef, useState } from 'react';
import { ProductCard, ProductCardProps } from '@/components/common/ProductCard';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProductCarouselProps {
    title: string;
    products: ProductCardProps[];
    viewAllLink?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, viewAllLink }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // -10 buffer
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8;

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="section-padding" style={{ background: '#fafafa' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '0.5rem',
                            color: 'var(--color-green-900)',
                            position: 'relative',
                            display: 'inline-block'
                        }}>
                            {title}
                            <span style={{
                                position: 'absolute',
                                bottom: '-8px',
                                left: '0',
                                width: '60px',
                                height: '3px',
                                background: 'var(--color-mango-500)',
                                borderRadius: '2px'
                            }}></span>
                        </h2>
                    </div>

                    {viewAllLink && (
                        <Link href={viewAllLink} className="hidden-mobile" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-green-700)',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'gap 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.gap = '0.75rem'}
                            onMouseLeave={(e) => e.currentTarget.style.gap = '0.5rem'}
                        >
                            View All <ArrowRight size={18} />
                        </Link>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scroll('left')}
                            style={{
                                position: 'absolute',
                                left: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'white',
                                border: '1px solid var(--color-gray-200)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--color-gray-800)',
                                transition: 'all 0.2s'
                            }}
                            className="carousel-arrow"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Scroll Container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            paddingBottom: '2rem',
                            paddingTop: '0.5rem',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            scrollBehavior: 'smooth'
                        }}
                        className="hide-scrollbar"
                    >
                        {products.map((product) => (
                            <div key={product.id} style={{
                                flex: '0 0 auto',
                                width: '280px',
                                scrollSnapAlign: 'start'
                            }}>
                                <ProductCard product={product} />
                            </div>
                        ))}

                        {/* View More Card */}
                        {viewAllLink && (
                            <div style={{ flex: '0 0 auto', width: '200px', scrollSnapAlign: 'start', display: 'flex' }}>
                                <Link href={viewAllLink} style={{
                                    width: '100%',
                                    background: 'var(--color-green-50)',
                                    borderRadius: '12px',
                                    border: '2px dashed var(--color-green-200)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-green-700)',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s',
                                    height: '100%' // Match height of cards if possible, or min 350px
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1rem',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <ArrowRight size={24} />
                                    </div>
                                    <span style={{ fontWeight: '600' }}>View All Products</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <button
                            onClick={() => scroll('right')}
                            style={{
                                position: 'absolute',
                                right: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'white',
                                border: '1px solid var(--color-gray-200)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--color-gray-800)',
                                transition: 'all 0.2s'
                            }}
                            className="carousel-arrow"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .carousel-arrow:hover {
                    background: var(--color-mango-50) !important;
                    border-color: var(--color-mango-300) !important;
                    color: var(--color-mango-700) !important;
                    transform: translateY(-50%) scale(1.1) !important;
                }
                @media (max-width: 768px) {
                    .carousel-arrow {
                        display: none !important;
                    }
                }
            `}</style>
        </section>
    );
};
