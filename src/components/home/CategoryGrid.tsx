'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Leaf, Droplet, Flame, Wheat, Cookie, Package } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    image_url?: string | null;
}

interface CategoryGridProps {
    categories: Category[];
}

const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('mango') || n.includes('sample')) return <Leaf size={40} />;
    if (n.includes('oil') || n.includes('ghee')) return <Droplet size={40} />;
    if (n.includes('spice') || n.includes('sugar')) return <Flame size={40} />;
    if (n.includes('rice') || n.includes('grain')) return <Wheat size={40} />;
    if (n.includes('snack') || n.includes('pickle')) return <Cookie size={40} />;
    return <Package size={40} />;
};

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
                @keyframes cat-fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .cat-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 16px;
                    cursor: pointer;
                    aspect-ratio: 1 / 1;
                    background: #eef2f6;
                    text-decoration: none;
                    display: block;
                }

                .cat-card-media {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.55s cubic-bezier(.22,.68,0,1.2);
                    display: block;
                    position: absolute;
                    inset: 0;
                }

                .cat-card:hover .cat-card-media {
                    transform: scale(1.08);
                }

                .cat-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 40, 0, 0.15);
                    transition: opacity 0.4s ease;
                    z-index: 2;
                }

                .cat-card:hover .cat-card-overlay {
                    opacity: 0.7 !important;
                }

                .cat-card-label {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1.25rem 1rem 1rem;
                    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
                    color: white;
                    transition: padding 0.35s ease;
                    z-index: 3;
                    text-align: left;
                }

                .cat-card:hover .cat-card-label {
                    padding-bottom: 1.25rem;
                }

                .cat-card-shop-btn {
                    display: inline-block;
                    margin-top: 0.4rem;
                    padding: 0.25rem 0.75rem;
                    border: 1.5px solid rgba(255,255,255,0.8);
                    border-radius: 50px;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.08em;
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease;
                    text-transform: uppercase;
                }

                .cat-card:hover .cat-card-shop-btn {
                    opacity: 1;
                    transform: translateY(0);
                }

                .cat-card-icon-bg {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-green-600);
                }

                .cat-grid-wrapper {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 1.25rem;
                }

                .cat-grid-wrapper .cat-card {
                    width: calc(25% - 1rem);
                    min-width: 200px;
                }

                @media (max-width: 900px) {
                    .cat-grid-wrapper .cat-card {
                        width: calc(50% - 0.75rem);
                        min-width: 150px;
                    }
                }

                @media (max-width: 500px) {
                    .cat-grid-wrapper .cat-card {
                        width: calc(50% - 0.625rem);
                        min-width: 130px;
                    }
                }
            `}</style>

            <div ref={sectionRef} className="cat-grid-wrapper">
                {categories.map((cat, index) => (
                    <Link
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        key={cat.id}
                        className="cat-card"
                        style={{
                            opacity: visible ? 1 : 0,
                            animation: visible ? `cat-fadeUp 0.6s ease forwards ${index * 0.1}s` : 'none'
                        }}
                    >
                        {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="cat-card-media" />
                        ) : (
                            <div className="cat-card-icon-bg">
                                {getCategoryIcon(cat.name)}
                            </div>
                        )}

                        <div className="cat-card-overlay" />

                        <div className="cat-card-label">
                            <p style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1rem',
                                fontWeight: '700',
                                letterSpacing: '-0.01em',
                                margin: 0,
                                lineHeight: 1.2,
                            }}>
                                {cat.name}
                            </p>
                            <span className="cat-card-shop-btn">Shop Now →</span>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};
