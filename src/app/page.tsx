
import React from 'react';
import Link from 'next/link';
import { ProductCardProps } from '@/components/common/ProductCard';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { ProductGrid } from '@/components/home/ProductGrid';
import { TrustFeatures } from '@/components/home/TrustFeatures';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { PromoImageGrid } from '@/components/home/PromoImageGrid';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BlogSection } from '@/components/home/BlogSection';
import { OffersSection } from '@/components/home/OffersSection';
import { InstagramSection } from '@/components/home/InstagramSection';

const transformProduct = (p: any, categoryMap: Map<number, string>): ProductCardProps => {
    const isSeasonOver = p.season_over && p.season_over != 0;
    const hasStock = p.stock && p.stock > 0;
    
    let badge = undefined;
    let badgeColor = '#ef4444';

    if (isSeasonOver) {
        badge = 'Season Over';
        badgeColor = '#6b7280';
    } else if (!hasStock) {
        badge = 'Out of Stock';
        badgeColor = '#dc2626';
    } else if (p.is_featured == 1 || p.is_featured === true) {
        badge = 'Featured';
        badgeColor = '#f59e0b'; // Amber-500
    }

    // Images: PHP backend returns as array already (JSON decoded)
    const images: string[] = Array.isArray(p.images) ? p.images : [];
    let image = images.length > 0 ? images[0] : null;

    // Fix relative image paths from backend
    if (image && !image.startsWith('http') && !image.startsWith('data:')) {
        image = `http://localhost/SFM/backend/${image.startsWith('/') ? image.substring(1) : image}`;
    }

    return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price || undefined,
        category: p.category_name || categoryMap.get(p.category_id) || 'General',
        image: image || undefined,
        weight: p.size || '1kg',
        rating: Number(p.avg_rating) || 0,
        reviews: Number(p.review_count) || 0,
        badge,
        badgeColor,
        outOfStock: !hasStock || isSeasonOver,
        is_featured: p.is_featured == 1 || p.is_featured === true,
        variations: Array.isArray(p.variations) ? p.variations : []
    };
};

export const dynamic = 'force-dynamic';

export default async function Home() {
    // 1. Fetch categories from MySQL Backend
    let mysqlCategories: any[] = [];
    try {
        const res = await fetch('http://salemfarmmango.com/api/categories.php', { cache: 'no-store' });
        if (res.ok) mysqlCategories = await res.json();
    } catch (e) { console.error('Error fetching categories from PHP', e); }

    const categoryMap = new Map();
    mysqlCategories.forEach(c => categoryMap.set(c.id, c.name));

    // 2. Fetch Featured Products from PHP API
    let featuredProducts: ProductCardProps[] = [];
    try {
        const res = await fetch('http://salemfarmmango.com/api/products.php?is_featured=true', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            const dbFeatured = Array.isArray(data) ? data : [];
            featuredProducts = dbFeatured.map(p => transformProduct(p, categoryMap));
        }
    } catch (e) { console.error('Error fetching featured products', e); }

    // 3. Fresh Arrivals
    let recentProducts: ProductCardProps[] = [];
    try {
        const res = await fetch('http://salemfarmmango.com/api/products.php?limit=12', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            const dbRecent = Array.isArray(data) ? data : [];
            recentProducts = dbRecent.map(p => transformProduct(p, categoryMap));
        }
    } catch (e) { console.error('Error fetching recent products', e); }

    // 4. Fetch Published Blogs
    let blogs: any[] = [];
    try {
        const res = await fetch('http://salemfarmmango.com/api/blogs.php?status=published', { cache: 'no-store' });
        if (res.ok) blogs = await res.json();
    } catch (e) { console.error('Error fetching blogs for home', e); }

    // 5. Fetch Active Offers
    let offers: any[] = [];
    try {
        const res = await fetch('http://salemfarmmango.com/api/offers.php', { cache: 'no-store' });
        if (res.ok) offers = await res.json();
    } catch (e) { console.error('Error fetching offers for home', e); }

    // 6. Fetch Public Settings (including Instagram posts)
    let publicSettings: any = {};
    try {
        const res = await fetch('http://salemfarmmango.com/api/public-settings.php', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            publicSettings = data.settings || {};
        }
    } catch (e) { console.error('Error fetching public settings', e); }

    const categories = mysqlCategories.slice(0, 8);
    const instagramPosts = publicSettings.instagram_posts ? publicSettings.instagram_posts.split(',').map((s: string) => s.trim()) : [];

    return (
        <main style={{ background: '#f8f9fa' }}>
            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}>
                Salem Farm Mango - Buy Authentic Salem Fresh Mangoes Online Directly from Farm
            </h1>

            <HeroCarousel />

            <ProductCarousel
                title="Customer Favorites"
                products={featuredProducts}
                viewAllLink="/shop?sort=featured"
            />

            <TrustFeatures />

            <section className="section-padding" style={{ background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--color-green-900)', marginBottom: '0.5rem' }}>Shop by Category</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Explore our wide range of fresh produce</p>
                    </div>

                    <CategoryGrid categories={categories} />

                    <div style={{ marginTop: 'var(--space-12)', textAlign: 'center' }}>
                        <Link href="/shop?sort=featured" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '50px', boxShadow: '0 4px 12px rgba(230, 149, 0, 0.3)' }}>
                            View Full Catalog
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--color-green-900)' }}>Fresh Arrivals</h2>
                        <Link href="/shop" style={{ color: 'var(--color-green-700)', fontWeight: '600', fontSize: '0.9rem' }}>
                            View All
                        </Link>
                    </div>
                    <ProductGrid initialProducts={recentProducts} />
                </div>
            </section>

            <BlogSection blogs={blogs} />

            <OffersSection offers={offers} />

            <InstagramSection postUrls={instagramPosts} />
        </main>
    );
}
