
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductCard, ProductCardProps } from '@/components/common/ProductCard';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { ProductGrid } from '@/components/home/ProductGrid';
import { TrustFeatures } from '@/components/home/TrustFeatures';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { PromoImageGrid } from '@/components/home/PromoImageGrid';
import { CategoryGrid } from '@/components/home/CategoryGrid';

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
        <main style={{ background: '#f8f9fa' }}>
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* 3-Panel Promo Image Grid */}
            <PromoImageGrid />

            {/* Featured Products Carousel */}
            <ProductCarousel
                title="Customer Favorites"
                products={featuredProducts}
                viewAllLink="/shop?category=Featured"
            />

            {/* Trust Signals */}
            <TrustFeatures />

            {/* Featured Categories - Modern Circular/Rounded Grid */}
            <section className="section-padding" style={{ background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            color: 'var(--color-green-900)',
                            marginBottom: '0.5rem'
                        }}>Shop by Category</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Explore our wide range of fresh produce</p>
                    </div>

                    <CategoryGrid categories={categories} />

                    <div style={{ marginTop: 'var(--space-12)', textAlign: 'center' }}>
                        <Link href="/shop" className="btn btn-primary" style={{
                            padding: '0.8rem 2.5rem',
                            borderRadius: '50px',
                            boxShadow: '0 4px 12px rgba(230, 149, 0, 0.3)'
                        }}>
                            View Full Catalog
                        </Link>
                    </div>
                </div>
            </section>

            {/* Fresh Arrivals Section */}
            <section className="section-padding" style={{ background: '#f8f9fa', borderTop: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--color-green-900)' }}>Fresh Arrivals</h2>
                        <Link href="/shop?sort=newest" style={{ color: 'var(--color-green-700)', fontWeight: '600', fontSize: '0.9rem' }}>
                            View All
                        </Link>
                    </div>
                    <ProductGrid initialProducts={recentProducts} />
                </div>
            </section>
        </main>
    );
}
