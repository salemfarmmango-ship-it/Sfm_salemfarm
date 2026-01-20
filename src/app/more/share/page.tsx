'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Share2, Copy, Check, Link as LinkIcon, ExternalLink, Search as SearchIcon, ShoppingBag, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SharePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [userMode, setUserMode] = useState<'guest' | 'customer'>('guest');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Check User Session
                const { data: { session } } = await supabase.auth.getSession();

                let productIds: number[] = [];

                if (session) {
                    // 2. Fetch User's Orders to get Product IDs
                    const { data: orders } = await supabase
                        .from('orders')
                        .select('id')
                        .eq('user_id', session.user.id);

                    if (orders && orders.length > 0) {
                        const orderIds = orders.map(o => o.id);
                        const { data: items } = await supabase
                            .from('order_items')
                            .select('product_id')
                            .in('order_id', orderIds);

                        if (items) {
                            productIds = Array.from(new Set(items.map(i => i.product_id))); // Deduplicate
                        }
                    }
                }

                // 3. Decide what to fetch based on history
                let query = supabase.from('products').select('*').gt('stock', 0).eq('season_over', false);

                if (productIds.length > 0) {
                    setUserMode('customer');
                    query = query.in('id', productIds);
                } else {
                    setUserMode('guest');
                    // Fallback to Featured if no orders or guest
                    query = query.order('is_featured', { ascending: false }).limit(12);
                }

                const { data: finalProducts } = await query;

                if (finalProducts) {
                    setProducts(finalProducts);
                }

            } catch (error) {
                console.error("Error fetching share data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getShareData = (product: any) => {
        const url = `https://salemfarmmango.com/product/${product.id}`;
        const text = `Check out ${product.name} from Salem Farm Mango! 🥭\nOrder here:`;
        return { url, text };
    };

    const handleCopy = (product: any) => {
        const { url, text } = getShareData(product);
        navigator.clipboard.writeText(`${text} ${url}`);
        setCopiedId(product.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleWhatsApp = (product: any) => {
        const { url, text } = getShareData(product);
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    };

    const handleX = (product: any) => {
        const { url, text } = getShareData(product);
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const handleInstagram = async (product: any) => {
        const { url, text } = getShareData(product);
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Salem Farm Mango', text: text, url: url });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy(product);
            alert("Link copied! Paste it in your Instagram Story/DM.");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa', color: 'var(--color-gray-900)', paddingBottom: '6rem' }}>

            {/* Header Section */}
            <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '4rem 0 3rem' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--color-mango-900)' }}>
                        {userMode === 'customer' ? 'Share Your Favorites' : 'Spread the Mango Love'}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                        {userMode === 'customer'
                            ? "Loved your recent order? Share these mangoes with your friends and family instantly."
                            : "Know someone who loves mangoes? Share our farm-fresh goodness with them."}
                    </p>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                        <SearchIcon size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input
                            type="text"
                            placeholder="Search for a mango..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '3rem',
                                border: '1px solid #e0e0e0',
                                fontSize: '1rem',
                                outline: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container" style={{ paddingTop: '3rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: 'var(--color-mango-500)', borderRadius: '50%', margin: '0 auto' }} />
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            {userMode === 'customer' ? <ShoppingBag size={24} color="var(--color-mango-600)" /> : <Star size={24} color="var(--color-mango-600)" />}
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                {searchTerm ? 'Search Results' : (userMode === 'customer' ? 'Recently Purchased' : 'Best Sellers')}
                            </h2>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
                                <p>No mangoes found matching "{searchTerm}".</p>
                                <Button variant="outline" onClick={() => setSearchTerm('')} style={{ marginTop: '1rem' }}>Clear Search</Button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                {filteredProducts.map(product => (
                                    <div key={product.id} style={{
                                        background: 'white',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        border: '1px solid #eee',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}>
                                        {/* Image */}
                                        <div style={{ position: 'relative', height: '240px', background: '#f8f8f8', flexShrink: 0 }}>
                                            {product.images?.[0] ? (
                                                <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>
                                                    <Share2 size={48} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, lineHeight: '1.4' }}>{product.name}</h3>
                                                <span style={{ fontWeight: '800', color: 'var(--color-mango-700)', background: 'var(--color-mango-50)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                                    ₹{product.price}
                                                </span>
                                            </div>

                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', height: '2.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {product.description || 'Authentic, naturally ripened mangoes from Salem Farm.'}
                                            </p>

                                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                {/* Social Share Buttons */}
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <SocialButton onClick={() => handleWhatsApp(product)} color="#25D366" icon={<WhatsAppIcon />} />
                                                    <SocialButton onClick={() => handleInstagram(product)} color="#E1306C" icon={<InstagramIcon />} />
                                                    <SocialButton onClick={() => handleX(product)} color="#000" icon={<XIcon />} />
                                                </div>

                                                {/* Copy Button */}
                                                <button
                                                    onClick={() => handleCopy(product)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                        padding: '0 1rem', background: copiedId === product.id ? 'var(--color-mango-600)' : '#f8f8f8',
                                                        border: 'none', borderRadius: '0.5rem',
                                                        color: copiedId === product.id ? 'white' : 'var(--text-secondary)',
                                                        fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}>
                                                    {copiedId === product.id ? <><Check size={16} /> Copied</> : <><LinkIcon size={16} /> Copy</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                            <Link href="/shop">
                                <Button variant="outline" style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', borderRadius: '2rem' }}>
                                    View Full Catalog <ExternalLink size={16} style={{ marginLeft: '8px' }} />
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function SocialButton({ onClick, color, icon }: { onClick: () => void, color: string, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', background: '#fff',
                border: '1px solid #eee', borderRadius: '50%',
                color: color, cursor: 'pointer', transition: 'transform 0.1s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {icon}
        </button>
    );
}

// Custom Icons
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);
