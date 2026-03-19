'use client';
import React, { useEffect, useRef } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const CartSidebar = () => {
    const { items, isCartOpen, setIsCartOpen, removeFromCart, addToCart, decrementItem } = useCart();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsCartOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [setIsCartOpen]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isCartOpen]);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const formatWeight = (name: string, weight?: string) => {
        if (!weight) return null;
        const normalizedName = name.toLowerCase();
        const normalizedWeight = weight.toLowerCase().trim();
        if (normalizedName.includes(`(${normalizedWeight})`) || normalizedName.includes(`${normalizedWeight}`)) {
            return null;
        }
        return weight;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => setIsCartOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    opacity: isCartOpen ? 1 : 0,
                    pointerEvents: isCartOpen ? 'auto' : 'none',
                    zIndex: 10000,
                    backdropFilter: 'blur(2px)',
                    transition: 'opacity 0.3s'
                }}
            />

            {/* Sidebar Container */}
            <div
                ref={sidebarRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '400px',
                    height: '100vh',
                    background: 'white',
                    zIndex: 10001,
                    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                    visibility: isCartOpen ? 'visible' : 'hidden',
                    transition: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear ${isCartOpen ? '0s' : '0.3s'}`,
                    willChange: 'transform', // Hint for hardware acceleration
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--color-mango-50)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingBag size={24} color="var(--color-mango-600)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Your Cart ({items.length})</h2>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {items.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <ShoppingBag size={64} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>Your cart is empty</p>
                            <Link href="/shop" onClick={() => setIsCartOpen(false)}>
                                <Button variant="outline" style={{ marginTop: '1rem' }}>Start Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {items.map((item) => (
                                <div key={item.cartItemId} style={{ display: 'flex', gap: '1rem' }}>
                                    {/* Item Image */}
                                    <div style={{ width: '80px', height: '80px', background: 'var(--color-gray-100)', borderRadius: '0.5rem', flexShrink: 0, overflow: 'hidden' }}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                <ShoppingBag size={20} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0, paddingRight: '0.5rem' }}>
                                                {item.name}
                                                <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                                    {formatWeight(item.name, item.weight) ? `(${item.weight})` : ''}
                                                </span>
                                            </h3>
                                            <button
                                                onClick={() => removeFromCart(item.cartItemId)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-mango-600)', margin: '0.25rem 0' }}>
                                            ₹{item.price}
                                        </p>

                                        {/* Qty Controls */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                                                <button
                                                    onClick={() => decrementItem(item.cartItemId)}
                                                    style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span style={{ fontSize: '0.9rem', width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => addToCart(item, 1)}
                                                    style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Total: ₹{item.price * item.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{subtotal}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Link href="/cart" onClick={() => setIsCartOpen(false)} style={{ width: '100%' }}>
                                <Button variant="outline" style={{ width: '100%', padding: '0.6rem' }}>View Cart</Button>
                            </Link>
                            <Link href="/checkout" onClick={() => setIsCartOpen(false)} style={{ width: '100%' }}>
                                <Button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}>
                                    Checkout <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
                            Shipping & taxes calculated at checkout.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};
