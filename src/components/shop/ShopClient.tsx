'use client';

import React, { useState, useEffect } from 'react';
import { ProductCardProps } from '@/components/common/ProductCard';
import { ProductCard } from '@/components/common/ProductCard'; // Ensure correct import
import PriceRangeSlider from './PriceRangeSlider';
import { X, Filter, List, ChevronDown, ArrowUpDown } from 'lucide-react';

interface ShopClientProps {
    products: ProductCardProps[];
    categories: string[];
    initialCategory?: string;
}

export default function ShopClient({ products: initialProducts, categories, initialCategory }: ShopClientProps) {
    // Derived dynamic max price (rounded up to nearest 100)
    // Default to 1000 if empty or logic fails
    const maxProductPrice = Math.max(...(initialProducts.length ? initialProducts.map(p => p.price) : [1000]));
    const roundedMaxPrice = Math.ceil(maxProductPrice / 100) * 100 || 1000;

    // State
    const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>(initialProducts);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filters
    // Initialize with prop if available, otherwise 'All'
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

    // Sync state if prop changes (e.g. navigation)
    useEffect(() => {
        setSelectedCategory(initialCategory || 'All');
    }, [initialCategory]);

    // Price Range State
    // activePriceRange drives the UI slider immediately (fast)
    const [activePriceRange, setActivePriceRange] = useState<[number, number]>([100, roundedMaxPrice]);
    // debouncedPriceRange drives the actual filtering (smooth)
    const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([100, roundedMaxPrice]);

    const [stockStatus, setStockStatus] = useState({
        onSale: false,
        inStock: false,
        onBackorder: false
    });
    const [sortOption, setSortOption] = useState('popular');



    // Manual Filter Handler
    const handleApplyFilter = () => {
        setDebouncedPriceRange(activePriceRange);
        setIsMobileFilterOpen(false); // Close mobile drawer on apply
    };

    // Filtering Logic
    useEffect(() => {
        let result = [...initialProducts];

        // 1. Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // 2. Filter by Price (Use APPLIED value - debouncedPriceRange)
        result = result.filter(p => p.price >= debouncedPriceRange[0] && p.price <= debouncedPriceRange[1]);

        // 3. Filter by Stock Status
        if (stockStatus.inStock) {
            result = result.filter(p => !p.outOfStock);
        }
        if (stockStatus.onSale) {
            result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
        }

        // 4. Sort
        switch (sortOption) {
            case 'price-low-high':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-low':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => b.id - a.id);
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'popular':
            default:
                break;
        }

        setFilteredProducts(result);
    }, [debouncedPriceRange, stockStatus, sortOption, selectedCategory, initialProducts]);



    const handleCategoryClick = (category: string) => {
        if (selectedCategory === category) setSelectedCategory('All');
        else setSelectedCategory(category);
    };

    const SidebarContent = ({ hideButton = false }: { hideButton?: boolean }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: hideButton ? 'auto' : '100%', paddingBottom: hideButton ? '0' : '80px' }}>
            {/* Price Filter */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Filter By Price</h3>

                <PriceRangeSlider
                    min={0}
                    max={roundedMaxPrice}
                    value={activePriceRange}
                    onChange={setActivePriceRange}
                    gap={50}
                />

                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                    <span>₹{activePriceRange[0]}</span>
                    <span>₹{activePriceRange[1]}</span>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6' }} />

            {/* Stock Status */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Stock Status</h3>

                <label className="custom-checkbox" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={stockStatus.onSale} onChange={e => setStockStatus({ ...stockStatus, onSale: e.target.checked })} />
                    On sale
                </label>
                <label className="custom-checkbox" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={stockStatus.inStock} onChange={e => setStockStatus({ ...stockStatus, inStock: e.target.checked })} />
                    In stock
                </label>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6' }} />

            {/* Categories */}
            <div style={{ flex: hideButton ? 'none' : 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div
                        onClick={() => handleCategoryClick('All')}
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: selectedCategory === 'All' ? '#e69500' : '#666', cursor: 'pointer', fontWeight: selectedCategory === 'All' ? '600' : '400' }}
                    >
                        <span>All Products</span>
                        <span>({initialProducts.length})</span>
                    </div>
                    {categories.map(cat => (
                        <div
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: selectedCategory === cat ? '#e69500' : '#666', cursor: 'pointer', fontWeight: selectedCategory === cat ? '600' : '400' }}
                        >
                            <span>{cat}</span>
                            <span>({initialProducts.filter(p => p.category === cat).length})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Apply Filter Button - Prominent on Mobile */}
            {!hideButton && (
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button
                        onClick={handleApplyFilter}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--color-green-700)',
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        APPLY FILTERS
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '1.5rem' }}>

            <div className="shop-layout" style={{ gap: '1.5rem' }}>
                {/* Mobile Action Bar */}
                <div className="mobile-action-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#333', cursor: 'pointer' }} onClick={() => setIsMobileFilterOpen(true)}>
                        <List size={24} strokeWidth={1.5} />
                        <span style={{ fontSize: '0.9rem' }}>Filter</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="sort-dropdown"
                            style={{
                                padding: '0.4rem 1.8rem 0.4rem 0.5rem',
                                fontSize: '0.85rem',
                                border: 'none',
                                background: 'transparent',
                                fontWeight: '600',
                                color: '#333',
                                appearance: 'none'
                            }}
                        >
                            <option value="popular">Popularity</option>
                            <option value="rating">Rating</option>
                            <option value="newest">Latest</option>
                            <option value="price-low-high">Price: Low</option>
                            <option value="price-high-low">Price: High</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '0.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} />
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                <div className={`mobile-filter-overlay ${isMobileFilterOpen ? 'open' : ''}`} onClick={() => setIsMobileFilterOpen(false)} />
                <div className={`mobile-filter-drawer ${isMobileFilterOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Filter</h2>
                        <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        <SidebarContent hideButton={true} />
                    </div>

                    <div style={{ padding: '1rem 1.5rem 110px', background: 'white', borderTop: '1px solid #f3f4f6', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
                        <button
                            onClick={handleApplyFilter}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--color-green-700)',
                                color: 'white',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            APPLY FILTERS
                        </button>
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <aside className="shop-sidebar" style={{ width: '250px' }}>
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className="shop-main">
                    {/* Top Bar */}
                    <div className="shop-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Showing all {filteredProducts.length} results
                        </div>

                        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="sort-dropdown"
                                    style={{ padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.85rem' }}
                                >
                                    <option value="popular">Sort by popularity</option>
                                    <option value="rating">Sort by average rating</option>
                                    <option value="newest">Sort by latest</option>
                                    <option value="price-low-high">Sort by price: low to high</option>
                                    <option value="price-high-low">Sort by price: high to low</option>
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }} />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="shop-product-grid">
                        {filteredProducts.length > 0 ? filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#888' }}>
                                No products found matching your filters.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
