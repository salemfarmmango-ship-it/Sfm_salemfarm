
import React from 'react';
import { ProductCardProps } from '@/components/common/ProductCard';
import ShopClient from '@/components/shop/ShopClient';

// Re-export dynamic to ensure no caching issues
export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    // 1. Fetch Products from PHP/MySQL backend
    const searchQuery = searchParams?.search as string | undefined;
    let dbProducts: any[] = [];
    try {
        const url = new URL('http://localhost/SFM/backend/api/products.php');
        if (searchQuery) url.searchParams.append('search', searchQuery);
        
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            dbProducts = Array.isArray(data) ? data : (data.products || []);
        }
    } catch (e) { console.error('Error fetching products from PHP', e); }

    // 2. Fetch categories from MySQL Backend
    let mysqlCategories: any[] = [];
    try {
        const res = await fetch('http://localhost/SFM/backend/api/categories.php', { cache: 'no-store' });
        if (res.ok) mysqlCategories = await res.json();
    } catch (e) { console.error('Error fetching categories from PHP', e); }

    // Create a lookup map for categories
    const categoryMap = new Map();
    mysqlCategories.forEach(c => categoryMap.set(c.id, c.name));

    // 3. Transform Data
    const products: ProductCardProps[] = dbProducts.map((p: any) => {
        // Determine badge based on stock and season status
        let badge = undefined;
        let badgeColor = '#ef4444';

        const isSeasonOver = p.season_over && p.season_over != 0;
        const hasStock = p.stock && p.stock > 0;

        if (isSeasonOver) {
            badge = 'Season Over';
            badgeColor = '#6b7280';
        } else if (!hasStock) {
            badge = 'Out of Stock';
            badgeColor = '#dc2626';
        } else if (p.is_featured == 1 || p.is_featured === true) {
            badge = 'Featured';
            badgeColor = '#f59e0b';
        }

        const categoryName = categoryMap.get(p.category_id) || p.category_name || 'Uncategorized';

        // Images: PHP backend returns as array already (JSON decoded)
        const images: string[] = Array.isArray(p.images) ? p.images : [];
        let image = images.length > 0 ? images[0] : undefined;

        // Fix relative image paths from backend
        if (image && !image.startsWith('http') && !image.startsWith('data:')) {
            image = `http://localhost/SFM/backend/${image.startsWith('/') ? image.substring(1) : image}`;
        }

        return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price || undefined,
            category: categoryName,
            image,
            weight: p.size || '1kg',
            rating: Number(p.avg_rating) || 0,
            reviews: Number(p.review_count) || 0,
            badge,
            badgeColor,
            outOfStock: !hasStock || isSeasonOver,
            is_featured: p.is_featured == 1,
            variations: Array.isArray(p.variations) ? p.variations : []
        };
    });

    const uniqueCategories = mysqlCategories.map(c => c.name).sort();

    const categoryParam = searchParams?.category;
    const sortParam = searchParams?.sort;
    const initialCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
    const initialSort = Array.isArray(sortParam) ? sortParam[0] : sortParam;

    return (
        <ShopClient 
            products={products} 
            categories={uniqueCategories} 
            initialCategory={initialCategory} 
            initialSort={initialSort}
        />
    );
}
