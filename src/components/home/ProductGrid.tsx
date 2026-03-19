'use client';

import React, { useState } from 'react';
import { ProductCard, ProductCardProps } from '@/components/common/ProductCard';

interface ProductGridProps {
    initialProducts: ProductCardProps[];
}

const ITEMS_PER_PAGE = 12;

export const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
    const [products, setProducts] = useState<ProductCardProps[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialProducts.length >= ITEMS_PER_PAGE);
    const [offset, setOffset] = useState(initialProducts.length);

    // Helper to map DB to UI
    const mapProduct = (p: any): ProductCardProps => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price || undefined,
        category: p.categories?.name || 'General',
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        weight: p.size || '1kg',
        rating: p.avg_rating || 0,
        reviews: p.review_count || 0,
        badge: p.is_featured ? 'Best Seller' : (p.id % 2 === 0 ? 'Fresh' : 'Organic'),
        badgeColor: p.is_featured ? '#ef4444' : '#10b981',
        variations: p.variations || []
    });

    const loadMore = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map(mapProduct);
                setProducts([...products, ...mapped]);
                setHasMore(data.length === ITEMS_PER_PAGE);
                setOffset(offset + ITEMS_PER_PAGE);
            }
        } catch (e) {
            console.error("Failed to load more products", e);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="products-grid">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '2rem' }}>
                    <button
                        onClick={loadMore}
                        suppressHydrationWarning
                        disabled={loading}
                        className="btn"
                        style={{
                            padding: '0.8rem 2rem',
                            fontSize: '1rem',
                            minWidth: '200px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white',
                            color: 'var(--color-green-700)',
                            border: '2px solid var(--color-green-700)',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-green-700)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'var(--color-green-700)';
                        }}
                    >
                        {loading ? 'Loading...' : 'Load More Products'}
                    </button>
                </div>
            )}
        </div>
    );
};
