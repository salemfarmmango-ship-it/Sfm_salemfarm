'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
    images: string[];
    name: string;
    badgeLabel?: string;
}

export const ProductGallery = ({ images, name, badgeLabel }: ProductGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Reset index if images change
    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <div style={{
                width: '100%',
                aspectRatio: '1/1',
                background: '#f9fafb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e5e7eb',
                color: '#9ca3af'
            }}>
                No Image Available
            </div>
        );
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        const nextIndex = currentIndex + newDirection;
        if (nextIndex >= 0 && nextIndex < images.length) {
            setDirection(newDirection);
            setCurrentIndex(nextIndex);
        }
    };

    return (
        <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1rem',
                background: '#fff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    background: '#f9fafb',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Badge Overlay */}
                    {badgeLabel && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#dc2626',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            zIndex: 10
                        }}>
                            {badgeLabel}
                        </div>
                    )}

                    <AnimatePresence initial={false} custom={direction}>
                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex]}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);

                                if (swipe < -swipeConfidenceThreshold) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold) {
                                    paginate(-1);
                                }
                            }}
                            alt={name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                cursor: 'grab',
                                position: 'absolute'
                            }}
                            whileTap={{ cursor: 'grabbing' }}
                        />
                    </AnimatePresence>
                </div>

                {/* Mobile Pagination Dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '1.5rem',
                    marginBottom: '0.5rem'
                }}>
                    {images.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setDirection(i > currentIndex ? 1 : -1);
                                setCurrentIndex(i);
                            }}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: i === currentIndex ? 'var(--color-mango-500)' : '#e5e7eb',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                {/* Desktop Thumbnails (Hidden on very small screens if needed, but keeping for now) */}
                {images.length > 1 && (
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {images.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    setDirection(i > currentIndex ? 1 : -1);
                                    setCurrentIndex(i);
                                }}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    border: currentIndex === i ? '2px solid var(--color-mango-500)' : '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    opacity: currentIndex === i ? 1 : 0.6,
                                    background: '#fff',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
