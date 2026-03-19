import { Metadata } from 'next';
import { ReviewSection } from '@/components/product/ReviewSection';
import { ProductActions } from '@/components/product/ProductActions';
import { TrustElements } from '@/components/product/TrustElements';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { WatchingNow } from '@/components/product/WatchingNow';
import { ProductSpecifications } from '@/components/product/ProductSpecifications';

export const dynamic = 'force-dynamic';

const BACKEND_URL = '${process.env.NEXT_PUBLIC_API_URL}';

async function getProductData(id: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/products.php?id=${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Error fetching product data:', e);
        return null;
    }
}

async function getReviewsData(productId: number) {
    try {
        const res = await fetch(`${BACKEND_URL}/reviews.php?product_id=${productId}`, { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Error fetching reviews:', e);
        return [];
    }
}

async function getRelatedProducts(categoryId: number | null, excludeId: number) {
    try {
        let url = `${BACKEND_URL}/products.php?limit=12`;
        if (categoryId) url += `&category_id=${categoryId}`;
        
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data.filter((p: any) => p.id !== excludeId) : [];
    } catch (e) {
        console.error('Error fetching related products:', e);
        return [];
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const productId = params.slug;
    const product = await getProductData(productId);

    if (!product || product.error) {
        return {
            title: 'Product Not Found | Salem Farm Mango',
        };
    }

    const title = `${product.name} | Buy Authentic Salem Mangoes Online`;
    const description = product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `Buy premium ${product.name} directly from Salem Farm Mango. Organic, fresh, and naturally ripened.`;
    const image = product.images && product.images.length > 0 ? product.images[0] : 'https://img.salemfarmmango.com/uploads/SFMLOGO.png';

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
    const productIdStr = params.slug;
    const product = await getProductData(productIdStr);

    if (!product || product.error) {
        notFound();
    }

    const productId = Number(product.id);
    const reviews = await getReviewsData(productId);
    
    // Calculate review stats
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 
        ? reviews.reduce((acc: number, r: any) => acc + Number(r.rating), 0) / reviewCount 
        : 0;

    const relatedRaw = await getRelatedProducts(product.category_id, productId);
    
    // Process related products
    const relatedProducts = relatedRaw.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price || undefined,
        category: p.category_name || 'General',
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        rating: 0, // Stats fetching for related products could be optimized later
        reviews: 0,
        weight: p.size,
        outOfStock: Number(p.stock) <= 0 || (p.season_over && p.season_over != 0),
        badge: (p.season_over && p.season_over != 0) ? 'Season Over' : (p.is_featured ? 'Best Seller' : undefined)
    })).slice(0, 4);

    // Determine stock status
    const isSeasonOver = product.season_over && product.season_over != 0;
    const isOutOfStock = Number(product.stock) <= 0 || isSeasonOver;
    let badgeLabel = '';

    if (isSeasonOver) {
        badgeLabel = 'Season Over';
    } else if (Number(product.stock) <= 0) {
        badgeLabel = 'Sold Out';
    }

    // Map to props expected by components
    const displayProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price || null,
        originalPrice: product.original_price || Math.round(product.price * 1.25),
        category: product.category_name || 'General',
        category_name: product.category_name || 'General',
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        description: product.description || 'Authentic product from Salem Farm.',
        rating: Number(avgRating),
        reviews: Number(reviewCount),
        features: product.is_seasonal ? ['Seasonal Special', 'Farm Fresh'] : ['Available All Year', 'Premium Quality'],
        outOfStock: isOutOfStock,
        badgeLabel: badgeLabel,
        sku: `SFM-${product.id.toString().padStart(4, '0')}`,
        highlights: product.highlights || [],
        images: product.images || [],
        specifications: product.specifications || [],
        size: product.size || '',
        variations: product.variations || []
    };

    return (
        <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '4rem' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description?.replace(/<[^>]*>/g, ''),
                        image: product.images?.[0] || 'https://img.salemfarmmango.com/uploads/SFMLOGO.png',
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
                            ratingValue: avgRating.toFixed(1),
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
                        <WatchingNow />
                        <ProductActions product={displayProduct} />

                        <div style={{ marginTop: '1.5rem' }}>
                            <TrustElements />
                        </div>
                    </div>
                </div>

                {/* Full Width Details Section */}
                <div style={{ marginTop: '4rem', maxWidth: '100%' }}>
                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '3px solid #16a34a', paddingBottom: '0.5rem', display: 'inline-block' }}>
                            Product Highlights
                        </h3>

                        {displayProduct.highlights && displayProduct.highlights.length > 0 ? (
                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: '#374151', fontSize: '1rem', lineHeight: '1.6' }}>
                                {displayProduct.highlights.map((highlight: string, index: number) => (
                                    <li key={index} style={{ marginBottom: '0.5rem' }}>{highlight}</li>
                                ))}
                            </ul>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, auto) 1fr', gap: '1rem 2rem', fontSize: '1rem', color: '#374151', marginTop: '1.5rem' }}>
                                <div style={{ fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center' }}>Type</div>
                                <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>{displayProduct.category}</div>

                                <div style={{ fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center' }}>Origin</div>
                                <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>Salem, Tamil Nadu</div>

                                <div style={{ fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center' }}>Quality</div>
                                <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>{displayProduct.features.join(', ')}</div>
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '3px solid #16a34a', paddingBottom: '0.5rem', display: 'inline-block', marginTop: '2.5rem' }}>
                            Description
                        </h3>
                        <div
                            className="product-description"
                            style={{ lineHeight: '1.8', color: '#374151', fontSize: '1.05rem' }}
                            dangerouslySetInnerHTML={{ __html: displayProduct.description }}
                        />
                    </div>

                    <ProductSpecifications
                        productName={displayProduct.name}
                        specifications={displayProduct.specifications}
                    />

                </div>

                {/* Reviews & Related */}
                <div style={{ marginTop: '4rem', background: '#f9fafb', marginLeft: '-1rem', marginRight: '-1rem', padding: '3rem 1rem' }}>
                    <div className="container">
                        <ReviewSection productId={displayProduct.id} />
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="container" style={{ marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: '700', borderBottom: '3px solid #16a34a', paddingBottom: '0.5rem', display: 'inline-block' }}>Similar Products</h2>
                        <div className="shop-product-grid">
                            {relatedProducts.map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
