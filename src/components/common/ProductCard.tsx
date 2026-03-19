'use client';
import React from 'react';
import { Star, Plus, Minus, Trash2, Loader2, Check } from 'lucide-react';
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
    badge?: string;
    badgeColor?: string;
    outOfStock?: boolean;
    is_featured?: boolean;
    variations?: { variation_label: string; price: number }[];  // from product_variations table
};

export const ProductCard = ({ product }: { product: ProductCardProps }) => {
    const { addToCart, decrementItem, removeFromCart, items } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Current quantity of this product in cart
    const cartItemId = product.weight ? `${product.id}_${product.weight}` : String(product.id);
    const cartItem = items.find(i => i.cartItemId === cartItemId);
    const cartQty = cartItem?.quantity || 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product, 1, false);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartQty <= 1) {
            removeFromCart(cartItemId);
        } else {
            decrementItem(cartItemId);
        }
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
                    <div className="product-card-weight" style={{ marginBottom: 0, fontSize: '0.78rem', color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '0.2rem', alignItems: 'center' }}>
                        {/* Show base weight as first chip, then all variation labels */}
                        {product.weight && (
                            <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '1px 6px', color: '#15803d', fontWeight: '500' }}>
                                {product.weight}
                            </span>
                        )}
                        {product.variations && product.variations.length > 0 && product.variations.map((v, i) => (
                            <span key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '1px 6px', color: '#15803d', fontWeight: '500' }}>
                                {v.variation_label}
                            </span>
                        ))}
                        {(!product.weight && (!product.variations || product.variations.length === 0)) && (
                            <span>1kg</span>
                        )}
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

                    {/* Add to Cart / Quantity Controls */}
                    {product.outOfStock ? (
                        <button disabled className="product-card-btn" style={{ opacity: 0.5, cursor: 'default' }}>
                            Unavailable
                        </button>
                    ) : cartQty > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid var(--color-green-600)', borderRadius: '8px', overflow: 'hidden', height: '36px' }}>
                            <button
                                onClick={handleDecrement}
                                style={{ width: '34px', height: '100%', background: cartQty === 1 ? '#fee2e2' : 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cartQty === 1 ? '#ef4444' : 'var(--color-green-700)', fontWeight: 700, transition: 'background 0.2s' }}
                            >
                                {cartQty === 1 ? <Trash2 size={13} strokeWidth={2.5} /> : <Minus size={14} />}
                            </button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-green-700)' }}>
                                {cartQty}
                            </span>
                            <button
                                onClick={handleAddToCart}
                                style={{ width: '34px', height: '100%', background: 'var(--color-green-600)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}
                            >
                                {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            suppressHydrationWarning
                            disabled={isAdding}
                            className="product-card-btn"
                            style={{
                                cursor: isAdding ? 'default' : 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            {isAdding ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <><Plus size={16} /> Add</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
