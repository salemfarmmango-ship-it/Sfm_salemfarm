import { Metadata } from 'next';
import React from 'react';
import { Star } from 'lucide-react';
import { ReviewSection } from '@/components/product/ReviewSection';
import { ProductActions } from '@/components/product/ProductActions';
import { TrustElements } from '@/components/product/TrustElements';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';


export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const productId = params.slug;

    // Fetch minimal product data for SEO
    const { data: product } = await supabase
        .from('products')
        .select('name, description, images')
        .eq('id', productId)
        .single();

    if (!product) {
        return {
            title: 'Product Not Found | Salem Farm Mango',
        };
    }

    const title = `${product.name} | Buy Authentic Salem Mangoes Online`;
    const description = product.description?.slice(0, 160) || `Buy premium ${product.name} directly from Salem Farm Mango. Organic, fresh, and naturally ripened.`;
    const image = product.images?.[0] || '/logo.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: image }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        }
    };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    // Determine ID from params (slug is effectively the ID in current linking strategy)
    const productId = params.slug;

    // Fetch product from DB
    const { data: product, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', productId)
        .single();

    if (error || !product) {
        notFound();
    }

    // Fetch related products (simple logic: same category or just everything else, limited to 4)
    // Ideally filter by category, but for now generic "You might also like"
    const { data: relatedData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .neq('id', productId)
        .limit(4);

    // Fetch stats for related products
    const relatedIds = relatedData?.map(p => p.id) || [];
    let relatedStatsMap = new Map();

    if (relatedIds.length > 0) {
        const { data: relStats } = await supabase
            .from('product_review_stats')
            .select('*')
            .in('product_id', relatedIds);

        relatedStatsMap = new Map((relStats || []).map((s: any) => [s.product_id, s]));
    }

    const relatedProducts = relatedData?.map(p => {
        const stats = relatedStatsMap.get(p.id) || { avg_rating: 0, review_count: 0 };
        return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price || undefined,
            category: p.categories?.name || 'General',
            image: p.images && p.images.length > 0 ? p.images[0] : null,
            rating: Number(stats.avg_rating) || 0,
            reviews: Number(stats.review_count) || 0,
            weight: p.size,
            outOfStock: p.stock <= 0 || p.season_over,
            badge: p.season_over ? 'Season Over' : (p.is_featured ? 'Best Seller' : undefined)
        };
    }) || [];

    // Determine stock status
    const isSeasonOver = product.season_over;
    const isOutOfStock = product.stock <= 0 || isSeasonOver;
    let badgeLabel = '';

    if (isSeasonOver) {
        badgeLabel = 'Season Over';
    } else if (product.stock <= 0) {
        badgeLabel = 'Sold Out';
    }

    // Fetch review stats
    const { data: reviewStats } = await supabase
        .from('product_review_stats')
        .select('*')
        .eq('product_id', productId)
        .single();

    // Default values if no stats found
    const avgRating = reviewStats?.avg_rating || 0;
    const reviewCount = reviewStats?.review_count || 0;

    // Map to props expected by components
    const displayProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price || Math.round(product.price * 1.25), // Fake original price if not present for demo
        category: product.categories?.name || 'General',
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        description: product.description || 'Authentic product from Salem Farm.',
        rating: Number(avgRating),
        reviews: Number(reviewCount),
        features: product.is_seasonal ? ['Seasonal Special', 'Farm Fresh'] : ['Available All Year', 'Premium Quality'],
        outOfStock: isOutOfStock,
        badgeLabel: badgeLabel,
        sku: `SFM-${product.id.toString().padStart(4, '0')}`, // Fake SKU
        highlights: product.highlights || [],
        images: product.images || []
    };

    const discountPercentage = Math.round(((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100);

    return (
        <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '4rem' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description,
                        image: product.images?.[0] || 'https://salemfarmmango.com/logo.png',
                        brand: {
                            '@type': 'Brand',
                            name: 'Salem Farm Mango'
                        },
                        offers: {
                            '@type': 'Offer',
                            url: `https://salemfarmmango.com/product/${product.id}`,
                            priceCurrency: 'INR',
                            price: product.price,
                            availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
                            itemCondition: 'https://schema.org/NewCondition'
                        },
                        aggregateRating: avgRating > 0 ? {
                            '@type': 'AggregateRating',
                            ratingValue: avgRating,
                            reviewCount: reviewCount
                        } : undefined
                    })
                }}
            />

            {/* Breadcrumbs */}
            <div className="container" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <a href="/" style={{ textDecoration: 'none', color: '#6b7280' }}>Home</a>
                    <span>/</span>
                    <a href="/shop" style={{ textDecoration: 'none', color: '#6b7280' }}>Shop</a>
                    <span>/</span>
                    <span style={{ color: '#111827', fontWeight: '500' }}>{product.name}</span>
                </div>
            </div>

            <div className="container" style={{ padding: '0 1rem', marginTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem' }}>

                    {/* Left Column: Image Gallery */}
                    <div style={{ position: 'relative' }}>
                        <ProductGallery
                            images={displayProduct.images}
                            name={displayProduct.name}
                            badgeLabel={badgeLabel}
                        />
                    </div>

                    {/* Right Column: Product Details */}
                    <div>
                        <div style={{ marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem', fontWeight: '500' }}>
                            {displayProduct.category} | SKU: {displayProduct.sku}
                        </div>

                        <h1 style={{ marginBottom: '1rem', fontSize: '1.8rem', lineHeight: '1.2', fontWeight: '600', color: '#111827' }}>
                            {displayProduct.name}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#388e3c',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: '700',
                                gap: '4px',
                                fontSize: '0.9rem'
                            }}>
                                {displayProduct.rating.toFixed(1)} <Star size={12} fill="white" strokeWidth={0} />
                            </div>
                            <span style={{ color: '#6b7280' }}>{displayProduct.reviews.toLocaleString()} Ratings & Reviews</span>
                        </div>

                        {/* Price Block */}
                        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>₹{displayProduct.price}</span>
                                <span style={{ fontSize: '1.2rem', color: '#6b7280', textDecoration: 'line-through' }}>₹{displayProduct.originalPrice}</span>
                                <span style={{ fontSize: '1.2rem', color: '#16a34a', fontWeight: '700' }}>{discountPercentage}% off</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '600', marginTop: '0.25rem' }}>
                                Inclusive of all taxes
                            </div>
                        </div>

                        {/* Interactive Actions */}
                        <ProductActions product={displayProduct} />

                        {/* Description & Features */}
                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', display: 'inline-block' }}>
                                Product Highlights
                            </h3>

                            {displayProduct.highlights && displayProduct.highlights.length > 0 ? (
                                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: '#374151', fontSize: '1rem', lineHeight: '1.6' }}>
                                    {displayProduct.highlights.map((highlight: string, index: number) => (
                                        <li key={index} style={{ marginBottom: '0.5rem' }}>{highlight}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr', gap: '1rem 2rem', fontSize: '1rem', color: '#4b5563', marginTop: '1rem' }}>
                                    <div style={{ fontWeight: '600', color: '#9ca3af' }}>Type</div>
                                    <div>{displayProduct.category}</div>

                                    <div style={{ fontWeight: '600', color: '#9ca3af' }}>Quantity</div>
                                    <div>{product.size || '1Kg'}</div>

                                    <div style={{ fontWeight: '600', color: '#9ca3af' }}>Origin</div>
                                    <div>Salem, Tamil Nadu</div>

                                    <div style={{ fontWeight: '600', color: '#9ca3af' }}>Quality</div>
                                    <div>{displayProduct.features.join(', ')}</div>
                                </div>
                            )}

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', display: 'inline-block', marginTop: '2.5rem' }}>
                                Description
                            </h3>
                            <p style={{ lineHeight: '1.8', color: '#374151', fontSize: '1.05rem' }}>
                                {displayProduct.description}
                            </p>
                        </div>

                        {/* Trust Elements */}
                        <TrustElements />

                    </div>
                </div>

                {/* Reviews & Related */}
                {/* (Kept slightly separate visually now) */}
                <div style={{ marginTop: '4rem', background: '#f9fafb', marginLeft: '-1rem', marginRight: '-1rem', padding: '3rem 1rem' }}>
                    <div className="container">
                        <ReviewSection productId={displayProduct.id} />
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="container" style={{ marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: '700' }}>Similar Products</h2>
                        <div className="shop-product-grid">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
