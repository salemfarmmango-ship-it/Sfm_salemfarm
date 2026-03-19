'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Minus, Plus, Loader2, Check, Zap, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export const ProductActions = ({ product }: { product: any }) => {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedVariationLabel, setSelectedVariationLabel] = useState<string>('');  // '' = base product (Variation 1)

    // Derived state from selected variation
    const selectedVariation = product.variations?.find((v: any) => v.variation_label === selectedVariationLabel);
    const displayPrice = Number(selectedVariation ? selectedVariation.price : (product.price || 0));
    const originalPrice = selectedVariation?.original_price
        ? Number(selectedVariation.original_price)
        : (product.original_price ? Number(product.original_price) : null);

    // Dynamic name: use variation's name override if set, else base product name
    const displayName = (selectedVariation?.name && selectedVariation.name.trim())
        ? selectedVariation.name
        : product.name;

    // Currently selected label text for display (e.g. "1 Kg" for base, "3kg" for variation)
    const currentVariantLabel = selectedVariationLabel === ''
        ? (product.size || '1 Kg')
        : selectedVariationLabel;

    const discountPercentage = originalPrice && originalPrice > displayPrice
        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
        : 0;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        if (product.outOfStock || isAdding || isAdded) return;
        setIsAdding(true);
        addToCart({
            ...product,
            name: displayName,
            price: displayPrice,
            original_price: originalPrice,
            weight: currentVariantLabel
        }, quantity, false);
        setIsAdding(false);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (product.outOfStock || isBuyingNow) return;
        setIsBuyingNow(true);
        addToCart({
            ...product,
            name: displayName,
            price: displayPrice,
            original_price: originalPrice,
            weight: currentVariantLabel
        }, quantity, false);
        router.push('/checkout');
        setIsBuyingNow(false);
    };

    const hasVariations = product.variations && product.variations.length > 0;

    if (product.outOfStock) {
        return (
            <div style={{ marginBottom: '2rem' }}>
                {/* Dynamic header even for out of stock */}
                <DynamicProductHeader
                    name={displayName}
                    displayPrice={displayPrice}
                    originalPrice={originalPrice}
                    discountPercentage={discountPercentage}
                    rating={product.rating}
                    reviews={product.reviews}
                    category={product.category}
                    sku={product.sku}
                />
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
        <>
            {/* ── Dynamic Product Header ─────────────────────────────── */}
            <DynamicProductHeader
                name={displayName}
                displayPrice={displayPrice}
                originalPrice={originalPrice}
                discountPercentage={discountPercentage}
                rating={product.rating}
                reviews={product.reviews}
                category={product.category}
                sku={product.sku}
            />

            {/* ── Actions ───────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Variant selector */}
                {hasVariations && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>
                            Select Variant:{' '}
                            <span style={{ color: 'var(--color-green-700)' }}>{currentVariantLabel}</span>
                        </span>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Base product button (Variation 1) */}
                            <button
                                onClick={(e) => { e.preventDefault(); setSelectedVariationLabel(''); }}
                                style={{
                                    padding: '0.5rem 1.2rem',
                                    fontSize: '0.95rem',
                                    border: `1.5px solid ${selectedVariationLabel === '' ? 'var(--color-green-600)' : '#d1d5db'}`,
                                    background: selectedVariationLabel === '' ? 'var(--color-green-50)' : 'white',
                                    color: selectedVariationLabel === '' ? 'var(--color-green-800)' : '#374151',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: selectedVariationLabel === '' ? 600 : 500,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {product.size || '1 Kg'}
                            </button>

                            {/* Additional variation buttons */}
                            {product.variations.map((v: any) => (
                                <button
                                    key={v.variation_label}
                                    onClick={(e) => { e.preventDefault(); setSelectedVariationLabel(v.variation_label); }}
                                    style={{
                                        padding: '0.5rem 1.2rem',
                                        fontSize: '0.95rem',
                                        border: `1.5px solid ${selectedVariationLabel === v.variation_label ? 'var(--color-green-600)' : '#d1d5db'}`,
                                        background: selectedVariationLabel === v.variation_label ? 'var(--color-green-50)' : 'white',
                                        color: selectedVariationLabel === v.variation_label ? 'var(--color-green-800)' : '#374151',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: selectedVariationLabel === v.variation_label ? 600 : 500,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {v.variation_label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Quantity:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white' }}>
                            <button
                                onClick={handleDecrement}
                                style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: quantity === 1 ? '#9ca3af' : '#374151', display: 'flex', alignItems: 'center' }}
                                disabled={quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span style={{ padding: '0 0.5rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Total: <strong style={{ color: '#111827' }}>₹{(displayPrice * quantity).toFixed(2)}</strong>
                    </span>
                </div>

                {/* Desktop buttons */}
                {!isMobile && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={isAdding || isAdded}
                            style={{
                                flex: 1, gap: '0.5rem',
                                background: isAdded ? 'var(--color-green-600)' : '#ffd814',
                                color: isAdded ? 'white' : '#0f1111',
                                border: 'none', height: '50px', fontSize: '1rem', fontWeight: '500', transition: 'all 0.3s ease'
                            }}
                            className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                            {isAdding ? (<><Loader2 size={20} className="animate-spin" /> Adding...</>) :
                             isAdded  ? (<><Check size={20} /> Added</>) :
                                        (<><ShoppingCart size={20} /> Add to Cart</>)}
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleBuyNow}
                            disabled={isBuyingNow}
                            style={{
                                flex: 1, gap: '0.5rem',
                                background: '#fa8900', color: 'white',
                                border: 'none', height: '50px', fontSize: '1rem', fontWeight: '500', transition: 'all 0.3s ease'
                            }}
                            className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                        >
                            {isBuyingNow ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                            Buy Now
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile fixed bottom bar */}
            {isMobile && (
                <div style={{
                    position: 'fixed', bottom: '70px', left: 0, right: 0,
                    background: 'white', padding: '0.75rem 1rem',
                    borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem',
                    zIndex: 40, boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <Button size="lg" onClick={handleAddToCart} disabled={isAdding || isAdded}
                        style={{ flex: 1, gap: '0.5rem', background: isAdded ? 'var(--color-green-600)' : '#ffd814', color: isAdded ? 'white' : '#0f1111', border: 'none', height: '48px', fontSize: '0.95rem', fontWeight: '600', borderRadius: '8px' }}>
                        {isAdding ? <Loader2 size={18} className="animate-spin" /> : isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                        {isAdded ? 'Added' : 'Add to Cart'}
                    </Button>
                    <Button size="lg" onClick={handleBuyNow} disabled={isBuyingNow}
                        style={{ flex: 1, gap: '0.5rem', background: '#fa8900', color: 'white', border: 'none', height: '48px', fontSize: '0.95rem', fontWeight: '600', borderRadius: '8px' }}>
                        {isBuyingNow ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                        Buy Now
                    </Button>
                </div>
            )}
        </>
    );
};

// ── Sub-component: Dynamic Product Header ──────────────────────────────────
function DynamicProductHeader({
    name, displayPrice, originalPrice, discountPercentage, rating, reviews, category, sku
}: {
    name: string;
    displayPrice: number;
    originalPrice: number | null;
    discountPercentage: number;
    rating: number;
    reviews: number;
    category: string;
    sku: string;
}) {
    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Category + SKU */}
            <div style={{ marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem', fontWeight: '500' }}>
                {category} | SKU: {sku}
            </div>

            {/* Product Name */}
            <h1 style={{ marginBottom: '1rem', fontSize: '1.8rem', lineHeight: '1.2', fontWeight: '600', color: '#111827', transition: 'all 0.2s' }}>
                {name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#388e3c', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', gap: '4px', fontSize: '0.9rem' }}>
                    {Number(rating || 0).toFixed(1)} <Star size={12} fill="white" strokeWidth={0} />
                </div>
                <span style={{ color: '#6b7280' }}>{reviews?.toLocaleString()} Ratings &amp; Reviews</span>
            </div>

            {/* Price Block */}
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', transition: 'all 0.2s' }}>
                        ₹{displayPrice.toFixed(2)}
                    </span>
                    {originalPrice && originalPrice > displayPrice && (
                        <>
                            <span style={{ fontSize: '1.2rem', color: '#6b7280', textDecoration: 'line-through' }}>
                                ₹{originalPrice.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '1.2rem', color: '#16a34a', fontWeight: '700' }}>
                                {discountPercentage}% off
                            </span>
                        </>
                    )}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '600', marginTop: '0.25rem' }}>
                    Inclusive of all taxes
                </div>
            </div>
        </div>
    );
}
