'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Minus, Plus, Loader2, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export const ProductActions = ({ product }: { product: any }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Router unused now but keeping if needed later, or remove it. 
    // Removing unused import is better. 
    // actually useRouter is imported but not used if I remove handleBuyNow. 
    // I will keep it clean.

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        if (product.outOfStock || isAdding || isAdded) return;

        setIsAdding(true);

        setTimeout(() => {
            addToCart(product, quantity, false); // false = don't open sidebar
            setIsAdding(false);
            setIsAdded(true);

            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        }, 600);
    };

    if (product.outOfStock) {
        return (
            <div style={{ marginBottom: '2rem' }}>
                <Button
                    size="lg"
                    disabled
                    style={{
                        width: '100%',
                        background: '#e5e7eb',
                        color: '#9ca3af',
                        cursor: 'not-allowed',
                        border: '1px solid #d1d5db',
                        height: '50px',
                        fontSize: '1.1rem'
                    }}
                >
                    {product.badgeLabel || 'Out of Stock'}
                </Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem', marginTop: '1.5rem' }}>
            {/* Quantity and Total */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white' }}>
                        <button
                            onClick={handleDecrement}
                            style={{
                                padding: '0.6rem 1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: quantity === 1 ? '#9ca3af' : '#374151',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            disabled={quantity <= 1}
                        >
                            <Minus size={16} />
                        </button>
                        <span style={{ padding: '0 0.5rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            style={{
                                padding: '0.6rem 1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isAdding || isAdded}
                    style={{
                        flex: 1,
                        gap: '0.5rem',
                        background: isAdded ? 'var(--color-green-600)' : '#ffd814', // Green if added
                        color: isAdded ? 'white' : '#0f1111',
                        border: 'none',
                        height: '50px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                    }}
                    className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    {isAdding ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Adding...
                        </>
                    ) : isAdded ? (
                        <>
                            <Check size={20} /> Added
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={20} /> Add to Cart
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
