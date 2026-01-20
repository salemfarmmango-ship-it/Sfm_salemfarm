
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductCard, ProductCardProps } from '@/components/common/ProductCard';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { ProductGrid } from '@/components/home/ProductGrid';

// Helper to map DB to UI
const mapProduct = (p: any, statsMap: Map<number, any>): ProductCardProps => {
    const stats = statsMap.get(p.id) || { avg_rating: 0, review_count: 0 };
    return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price || undefined,
        category: p.categories?.name || 'General',
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        weight: p.size || '1kg',
        rating: Number(stats.avg_rating) || 0,
        reviews: Number(stats.review_count) || 0,
        badge: p.is_featured ? 'Best Seller' : (p.id % 2 === 0 ? 'Fresh' : 'Organic'),
        badgeColor: p.is_featured ? '#ef4444' : '#10b981'
    };
};

export const dynamic = 'force-dynamic';

export default async function Home() {
    // Fetch review stats
    const { data: reviewStats } = await supabase
        .from('product_review_stats')
        .select('*');

    const statsMap = new Map(
        (reviewStats || []).map((s: any) => [s.product_id, s])
    );

    // Fetch Featured Products (available only)
    let { data: dbFeatured } = await supabase
        .from('products')
        .select('*, categories(name)')
        .gt('stock', 0)
        .eq('season_over', false)
        .eq('is_featured', true)
        .limit(8);

    // If no featured products, fetch fallback (any available products)
    if (!dbFeatured || dbFeatured.length === 0) {
        const { data: fallback } = await supabase
            .from('products')
            .select('*, categories(name)')
            .gt('stock', 0)
            .eq('season_over', false)
            .order('created_at', { ascending: false })
            .limit(4);
        dbFeatured = fallback;
    }

    const featuredProducts = dbFeatured ? dbFeatured.map(p => mapProduct(p, statsMap)) : [];

    // Fresh Arrivals (available only) - Fetch 8 for initial load
    const { data: dbRecent } = await supabase
        .from('products')
        .select('*, categories(name)')
        .gt('stock', 0)
        .eq('season_over', false)
        .order('created_at', { ascending: false })
        .limit(8);

    const recentProducts = dbRecent ? dbRecent.map(p => mapProduct(p, statsMap)) : [];

    // Fetch All Categories for Featured Categories section
    const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
        .limit(8);

    const categories = dbCategories || [];

    return (
        <main>
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Featured Products */}
            <section className="section-padding" style={{ background: 'var(--color-green-50)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>Customer Favorites</h2>
                    <div className="customer-favorites-grid" style={{ display: 'grid', gap: 'var(--space-8)' }}>
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories - Modern Cards */}
            <section className="section-padding" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>Our Categories</h2>

                    <div className="categories-grid">
                        {categories.map((cat, index) => (
                            <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} key={cat.id} className="category-card-wrapper" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card card-hover" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{
                                        height: '160px',
                                        background: 'var(--color-gray-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        color: 'var(--color-mango-300)',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: `linear-gradient(45deg, var(--color-mango-50), var(--color-mango-100))`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {
                                                    cat.name.toLowerCase().includes('mango') ? '🥭' :
                                                        cat.name.toLowerCase().includes('pickle') ? '🥒' :
                                                            cat.name.toLowerCase().includes('spice') ? '🌶️' :
                                                                cat.name.toLowerCase().includes('oil') ? '🥥' :
                                                                    cat.name.toLowerCase().includes('rice') ? '🌾' :
                                                                        cat.name.toLowerCase().includes('snack') ? '🍪' : '📦'
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{cat.name}</h3>
                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--color-mango-600)', fontWeight: '600', fontSize: '0.85rem' }}>
                                                View Products
                                            </span>
                                            <span style={{
                                                width: '28px',
                                                height: '28px',
                                                background: 'var(--color-green-50)',
                                                color: 'var(--color-green-600)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div style={{ marginTop: 'var(--space-12)', textAlign: 'center' }}>
                        <Link href="/shop" className="btn" style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            background: 'var(--color-green-700)',
                            color: 'white',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)',
                            border: '2px solid transparent',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}>
                            View Full Catalog <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Fresh Arrivals Section */}
            <section className="section-padding" style={{ borderTop: '1px solid var(--border-light)', background: 'white' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>Our Fresh Products</h2>
                    <ProductGrid initialProducts={recentProducts} />
                </div>
            </section>
        </main>
    );
}
