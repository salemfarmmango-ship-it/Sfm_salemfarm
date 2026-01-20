'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { items, removeFromCart, addToCart, decrementItem } = useCart();

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1200px' }}>
            <h1 style={{ marginBottom: 'var(--space-8)', fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Your Cart</h1>

            {/* Responsive Styles */}
            <style jsx>{`
                .cart-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                    align-items: start;
                }
                .cart-items-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid var(--border-light);
                    overflow: hidden;
                }
                .cart-header {
                    display: grid;
                    grid-template-columns: 2.5fr 1fr 1fr 0.5fr;
                    padding: 1rem 1.5rem;
                    background: #f9fafb;
                    border-bottom: 1px solid var(--border-light);
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .cart-item {
                    display: grid;
                    grid-template-columns: 2.5fr 1fr 1fr 0.5fr;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-light);
                    transition: background 0.2s;
                    position: relative;
                }
                .cart-item:last-child {
                    border-bottom: none;
                }
                .summary-card {
                    position: sticky;
                    top: 100px;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-light);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                /* Default visibility (Desktop) */
                .mobile-only { display: none; }
                
                /* Mobile Styles */
                @media (max-width: 900px) {
                    .cart-wrapper {
                        grid-template-columns: 1fr;
                    }
                    .summary-card {
                        position: static;
                        order: 2;
                    }
                    .cart-header {
                        display: none; /* Hide header on mobile */
                    }
                    .cart-item {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem;
                    }
                    
                    /* Top Section: Image + Text */
                    .item-top-row {
                        display: flex;
                        gap: 1rem;
                        width: 100%;
                    }
                    
                    .item-image-col { 
                        width: 80px; 
                        flex-shrink: 0;
                    }

                    .item-details-col {
                        flex: 1;
                        padding-right: 2rem;
                    }

                    /* Bottom Section: Controls + Price */
                    .item-controls-col { 
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        background: #f9fafb;
                        padding: 0.5rem;
                        border-radius: 8px;
                    }

                    .desktop-only { display: none; }
                    .mobile-only { display: block; }

                    /* Absolute Remove Button for Mobile */
                    .mobile-remove-btn {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                    }
                }
            `}</style>

            {items.length > 0 ? (
                <div className="cart-wrapper">
                    {/* Cart Items List */}
                    <div className="cart-items-container">
                        <div className="cart-header desktop-only">
                            <div>Product</div>
                            <div>Price</div>
                            <div>Quantity</div>
                            <div style={{ textAlign: 'right' }}>Action</div>
                        </div>
                        {items.map((item) => (
                            <div key={item.id} className="cart-item">

                                {/* Top Row Wrapper for Mobile */}
                                <div className="item-top-row">
                                    {/* Image */}
                                    <div className="item-image-col">
                                        <div style={{ width: '80px', height: '80px', background: 'var(--color-gray-100)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>

                                    {/* Name & Unit Price */}
                                    <div className="item-details-col">
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4', color: 'var(--color-text-primary)' }}>{item.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹{item.price}</p>
                                    </div>
                                </div>

                                {/* Price (Desktop) */}
                                <div className="desktop-only" style={{ fontWeight: '500' }}>₹{item.price}</div>

                                {/* Controls Row (Mobile combines controls + total here) */}
                                <div className="item-controls-col">
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                                        <button onClick={() => decrementItem(item.id)} style={{ padding: '8px 12px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', borderRight: '1px solid var(--border-light)' }}>
                                            <Minus size={16} />
                                        </button>
                                        <span style={{ padding: '0 12px', fontSize: '0.95rem', fontWeight: '600', minWidth: '36px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} style={{ padding: '8px 12px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', borderLeft: '1px solid var(--border-light)' }}>
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Mobile Total Price */}
                                    <div className="mobile-only" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-mango-600)' }}>
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>



                                {/* Remove Button */}
                                <div className="desktop-only" style={{ textAlign: 'right' }}>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background 0.2s' }}
                                        title="Remove Item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Mobile Remove Button (Absolute) */}
                                <button
                                    className="mobile-only mobile-remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Summary */}
                    <div className="summary-card">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Order Summary</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            <span>Subtotal</span>
                            <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>₹{subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                            <span>Shipping</span>
                            <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>Calculated at checkout</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingTop: '1rem', borderTop: '2px dashed var(--border-light)' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-mango-600)' }}>₹{subtotal}</span>
                        </div>

                        <Link href="/checkout" style={{ width: '100%', display: 'block' }}>
                            <Button style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>
                                Proceed to Checkout <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Button>
                        </Link>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link href="/shop" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '6rem 1rem', background: '#f9fafb', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--color-gray-200)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
                        <Trash2 size={32} /> {/* Using Trash Icon as generic 'empty' placeholder or ShoppingBag would be better but keeping simple */}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Your cart is empty</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Looks like you haven't added any mangoes yet.</p>
                    <Link href="/shop">
                        <Button size="lg">Start Shopping</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
