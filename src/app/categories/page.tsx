
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    // Fetch all categories from Supabase
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
    }

    const displayCategories = categories || [];

    return (
        <div className="section-padding container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Browse Categories</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Explore our range of authentic farm products</p>
            </div>

            {displayCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                    <p>No categories found.</p>
                </div>
            ) : (
                <div className="categories-grid">
                    {displayCategories.map((category, index) => (
                        <Link href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.id} className="category-card-wrapper" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card card-hover" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    height: '160px', /* Reduced height for better mobile fit */
                                    background: 'var(--color-gray-100)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    color: 'var(--color-mango-300)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    {/* Category Image */}
                                    {category.image_url ? (
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(45deg, var(--color-mango-50), var(--color-mango-100))`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {/* Fallback Icon Logic based on name */}
                                            {
                                                category.name.toLowerCase().includes('mango') ? '🥭' :
                                                    category.name.toLowerCase().includes('pickle') ? '🥒' :
                                                        category.name.toLowerCase().includes('spice') ? '🌶️' :
                                                            category.name.toLowerCase().includes('oil') ? '🥥' :
                                                                category.name.toLowerCase().includes('rice') ? '🌾' :
                                                                    category.name.toLowerCase().includes('snack') ? '🍪' : '📦'
                                            }
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{category.name}</h3>
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
            )}
        </div>
    );
}
