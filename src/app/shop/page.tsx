
import React from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCardProps } from '@/components/common/ProductCard';
import ShopClient from '@/components/shop/ShopClient';

// Re-export dynamic to ensure no caching issues if needed (optional)
export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    // 1. Fetch Products with review stats
    const { data: dbProducts } = await supabase
        .from('products')
        .select(`
            *,
            categories (name, slug)
        `);

    // 2. Fetch review stats
    const { data: reviewStats } = await supabase
        .from('product_review_stats')
        .select('*');

    // Create a map for quick lookup
    const statsMap = new Map(
        (reviewStats || []).map((s: any) => [s.product_id, s])
    );

    // 3. Transform Data
    let products: ProductCardProps[] = [];

    if (dbProducts) {
        products = dbProducts.map((p: any) => {
            // Get review stats for this product
            const stats = statsMap.get(p.id) || { avg_rating: 0, review_count: 0 };

            // Determine badge based on stock and season status
            let badge = undefined;
            let badgeColor = '#ef4444';

            if (p.season_over) {
                badge = 'Season Over';
                badgeColor = '#6b7280';
            } else if (p.stock === 0 || p.stock === null) {
                badge = 'Out of Stock';
                badgeColor = '#dc2626';
            } else if (p.is_featured) {
                badge = 'Best Seller';
                badgeColor = '#ef4444';
            }

            return {
                id: p.id,
                name: p.name,
                price: p.price,
                originalPrice: p.original_price || undefined,
                category: p.categories?.name || 'Uncategorized',
                image: p.images && p.images.length > 0 ? p.images[0] : null,
                weight: p.size || '1kg',
                rating: Number(stats.avg_rating) || 0,
                reviews: Number(stats.review_count) || 0,
                badge,
                badgeColor,
                outOfStock: p.stock === 0 || p.stock === null || p.season_over
            };
        });
    }

    // 3. Extract Categories
    // We can hardcode specific categories to ensure order, or derive from DB.
    // For now, let's derive unique categories from products, ensuring "Mangoes" is present.
    const derivedCategories = Array.from(new Set(products.map(p => p.category))).filter(c => c !== 'Uncategorized');

    // Ensure core categories exist and are sorted nicely (e.g. Mangoes first)
    // Note: The original pills had Mangoes, Sugar (=Spices?), Oil
    const displayCategories = ['Mangoes', 'Spices', 'Pickles', 'Oils'].filter(c => derivedCategories.includes(c) || true); // logic to include what matches or default set

    // Actually, let's just use the unique ones from DB + mapping fixes if needed
    // If DB has "Sugar", we might want to map it to "Spices" in the UI if that was the intent, but let's stick to DB values for now.
    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();

    const categoryParam = searchParams?.category;
    const initialCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;

    return (
        <ShopClient products={products} categories={uniqueCategories} initialCategory={initialCategory} />
    );
}
