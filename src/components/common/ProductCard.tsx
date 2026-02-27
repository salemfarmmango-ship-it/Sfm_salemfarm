'use client';
import React from 'react';
import { Star, ShoppingCart, Plus, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export type ProductCardProps = {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    image?: string;
    rating?: number;
    reviews?: number;
    weight?: string;
    badge?: string; // 'Offer', 'Best Seller', 'New', etc.
    badgeColor?: string; // e.g., 'red', 'orange', 'green'
    outOfStock?: boolean; // Product is unavailable
};

export const ProductCard = ({ product }: { product: ProductCardProps }) => {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if wrapped in Link

        if (isAdding || isAdded) return;

        setIsAdding(true);

        // Simulate network/processing delay for better UX
        setTimeout(() => {
            addToCart(product, 1, false); // false = don't open sidebar
            setIsAdding(false);
            setIsAdded(true);

            // Reset to default state after 2 seconds
            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        }, 600);
    };

    return (
        <div className="product-card product-card-hover">
            {/* Badge */}
            {product.badge && (
                <span className="product-card-badge" style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: product.badgeColor || '#ef4444',
                    color: 'white',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    zIndex: 10
                }}>
                    {product.badge}
                </span>
            )}

            {/* Image Area */}
            <Link href={`/product/${product.id}`} style={{ display: 'block', position: 'relative' }}>
                <div className="product-card-image-container">
                    {/* Shimmer loading placeholder */}
                    {product.image && !imageLoaded && (
                        <div className="product-card-image-shimmer" />
                    )}
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            ref={(img) => {
                                // If image is already cached/loaded, immediately set state
                                if (img?.complete) {
                                    setImageLoaded(true);
                                }
                            }}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)} // Hide shimmer if image fails to load
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: imageLoaded ? 1 : 0,
                                transition: 'opacity 0.4s ease-in-out',
                            }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                            No Image
                        </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {product.outOfStock && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255, 255, 255, 0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#dc2626',
                            textAlign: 'center',
                            padding: '1rem'
                        }}>
                            {product.badge === 'Season Over' ? 'Season Over' : 'Out of Stock'}
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Area */}
            <div className="product-card-content">
                <div className="product-card-category">
                    {product.category}
                </div>

                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="product-card-title">
                        {product.name}
                    </h3>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div className="product-card-weight" style={{ marginBottom: 0 }}>
                        {product.weight || '1kg'}
                    </div>

                    {/* Ratings */}
                    <div className="product-card-rating" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    fill={i < Math.floor(product.rating || 0) ? '#fbbf24' : 'none'}
                                    stroke={i < Math.floor(product.rating || 0) ? '#fbbf24' : '#d1d5db'}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {product.rating} ({product.reviews || 0})
                        </span>
                    </div>
                </div>

                {/* Footer: Price & Add Button */}
                <div className="product-card-footer">
                    <div className="product-card-price-container">
                        <span className="product-card-price">
                            ₹{product.price}
                        </span>
                        {product.originalPrice && (
                            <span className="product-card-original-price">
                                ₹{product.originalPrice}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        suppressHydrationWarning
                        disabled={product.outOfStock || isAdding || isAdded}
                        className="product-card-btn"
                        style={{
                            opacity: product.outOfStock ? 0.7 : 1,
                            cursor: (product.outOfStock || isAdding || isAdded) ? 'default' : 'pointer',
                            background: isAdded ? 'var(--color-green-600)' : undefined, // Assuming default is defined in CSS, overriding if added
                            color: isAdded ? 'white' : undefined,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        {isAdding ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : isAdded ? (
                            <>
                                <Check size={16} /> Added
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> {product.outOfStock ? 'Unavailable' : 'Add'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
