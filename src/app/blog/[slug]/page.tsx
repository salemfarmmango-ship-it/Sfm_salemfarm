'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, ShoppingBag, Clock, User, Share2, Tag, ChevronRight, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MangoLoader } from '@/components/common/MangoLoader';
import Link from 'next/link';

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const [blog, setBlog] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.pageYOffset;
            setScrollProgress((currentScroll / totalScroll) * 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (slug) {
            fetchBlogDetail();
        }
    }, [slug]);

    const fetchBlogDetail = async () => {
        try {
            const res = await fetch(`/api/blogs?slug=${slug}`, { cache: 'no-store' });
            const data = await res.json();
            if (res.ok && data) {
                setBlog(data);
                if (data.product_id) {
                    fetchProductDetail(data.product_id);
                }
            } else {
                throw new Error('Blog not found');
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductDetail = async (productId: number) => {
        try {
            const res = await fetch(`/api/products?id=${productId}`, { cache: 'no-store' });
            const data = await res.json();
            if (res.ok && data) {
                // If it returns an array of 1 object, use first
                const prod = Array.isArray(data) ? data[0] : data;
                setProduct(prod);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    if (loading) return <MangoLoader />;
    if (!blog) return (
        <div style={{ padding: '8rem 1rem', textAlign: 'center', background: '#fcfcfb', minHeight: '100vh' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-green-900)', marginBottom: '1.5rem' }}>Story Not Found</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>The story you're looking for might have been moved or removed.</p>
            <Button onClick={() => router.push('/blog')} variant="primary" style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}>
                Browse All Stories
            </Button>
        </div>
    );

    return (
        <div style={{ background: '#fcfcfb', minHeight: '100vh', color: '#1a1a1a' }}>
            {/* Reading Progress Bar */}
            <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: `${scrollProgress}%`, 
                height: '4px', 
                background: 'var(--color-mango-500)', 
                zIndex: 1000,
                transition: 'width 0.1s ease-out'
            }} />

            {/* Immersive Hero Header */}
            <header style={{ 
                width: '100%', 
                height: '550px', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    position: 'absolute',
                    inset: 0,
                    background: blog.image_url 
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url(${blog.image_url})` 
                        : 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} className="hero-zoom" />

                <div className="container" style={{ 
                    position: 'relative', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    padding: '0 1rem',
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {/* Navigation Breadcrumb */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '2rem', fontWeight: '500' }}>
                            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                            <ChevronRight size={14} />
                            <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Journal</Link>
                            <ChevronRight size={14} />
                            <span style={{ color: 'white' }}>Current Story</span>
                        </div>

                    <div style={{ maxWidth: '900px' }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.6rem', 
                            background: 'var(--color-mango-500)', 
                            color: 'white',
                            padding: '0.4rem 1.25rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem',
                            letterSpacing: '0.05em'
                        }}>
                            <Tag size={12} /> FARM LIFE
                        </div>
                        
                        <h1 style={{ 
                            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
                            color: 'white', 
                            fontWeight: '900', 
                            lineHeight: '1.1',
                            letterSpacing: '-0.04em',
                            marginBottom: '2rem',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            {blog.title}
                        </h1>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem', color: 'rgba(255,255,255,0.9)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={18} />
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author</div>
                                    <div style={{ fontWeight: '700' }}>Salem Farm Editorial</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar size={18} />
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Published</div>
                                    <div style={{ fontWeight: '700' }}>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={18} />
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reading Time</div>
                                    <div style={{ fontWeight: '700' }}>5 min read</div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container" style={{ 
                display: 'grid', 
                gridTemplateColumns: product ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr)', 
                gap: 'clamp(1.5rem, 5vw, 4rem)', 
                padding: '0 clamp(1rem, 3vw, 2rem) 6rem',
                position: 'relative',
                marginTop: 'clamp(-60px, -8vw, -120px)', // Responsive overlap
                zIndex: 10
            }}>
                {/* Mobile/Tablet switch to single column logic handled by CSS or container */}
                
                {/* Main Content Area */}
                <main style={{ maxWidth: product ? '850px' : '900px', margin: product ? '0' : '0 auto' }}>
                    <div style={{ 
                        background: 'white', 
                        padding: 'clamp(2rem, 5vw, 4.5rem)', 
                        borderRadius: '2.5rem', 
                        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div 
                            className="blog-prose"
                            style={{ 
                                fontSize: '1.2rem', 
                                lineHeight: '1.8', 
                                color: '#334155' 
                            }}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Social Share Bar */}
                        <div style={{ 
                            marginTop: '4rem', 
                            paddingTop: '2rem', 
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-green-900)' }}>Enjoyed this story?</div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div 
                                    className="share-icon" 
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: blog.title,
                                                url: window.location.href
                                            }).catch(console.error);
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Link copied to clipboard!");
                                        }
                                    }}
                                    style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Share2 size={18} />
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                            <Link href="/blog">
                                <Button variant="outline" style={{ borderRadius: '50px', padding: '0.75rem 2rem', gap: '0.5rem' }}>
                                    <ArrowLeft size={18} /> Back to All Stories
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="blog-sidebar">
                    {product && (
                        <div style={{ position: 'sticky', top: '120px' }}>
                            <div style={{ 
                                background: 'white',
                                borderRadius: '2.5rem',
                                padding: '2rem',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                border: '2px solid var(--color-mango-100)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative circle */}
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'var(--color-mango-50)', borderRadius: '50%', zIndex: 0 }}></div>
                                
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem', 
                                        background: 'var(--color-green-50)',
                                        color: 'var(--color-green-700)',
                                        padding: '0.4rem 1rem',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <ShoppingBag size={14} /> FARM RECOMMENDATION
                                    </div>
                                    
                                    <div style={{ marginBottom: '1.5rem', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                        <img 
                                            src={product.images?.[0] || '/placeholder.png'} 
                                            alt={product.name} 
                                            style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                                        />
                                    </div>

                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-green-950)', marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{product.size || '1kg'}</span>
                                        <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                                        <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600' }}>In Stock</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--color-green-800)' }}>₹{product.price}</div>
                                        {product.original_price && (
                                            <div style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.original_price}</div>
                                        )}
                                    </div>

                                    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                                        <Button style={{ 
                                            width: '100%', 
                                            padding: '1.25rem', 
                                            borderRadius: '50px', 
                                            fontSize: '1.1rem', 
                                            fontWeight: '700',
                                            boxShadow: '0 10px 20px rgba(230, 149, 0, 0.3)'
                                        }}>
                                            Buy Directly from Farm
                                        </Button>
                                    </Link>
                                    
                                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                                        100% Secure Payments • Farm Fresh Quality
                                    </p>
                                </div>
                            </div>

                            {/* Trust Badge / Info Card */}
                            <div style={{ 
                                marginTop: '2rem', 
                                padding: '2rem', 
                                background: 'var(--color-green-900)', 
                                borderRadius: '2.5rem', 
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Sprout size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }} />
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    The Salem Quality
                                </h4>
                                <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.6' }}>
                                    Every fruit and product from Salem Farm Mangoes is hand-selected and naturally ripened without harmful chemicals. Taste the difference of tradition.
                                </p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
            
            <style jsx global>{`
                .hero-zoom {
                    animation: zoom-slow 20s infinite alternate;
                }
                @keyframes zoom-slow {
                    from { transform: scale(1.05); }
                    to { transform: scale(1.15); }
                }
                .blog-prose p { margin-bottom: 2rem; font-size: 1.2rem; word-break: break-word; overflow-wrap: break-word; }
                .blog-prose { word-break: break-word; overflow-wrap: break-word; }
                .blog-prose h2 { font-size: 2.2rem; font-weight: 800; margin: 3rem 0 1.5rem; color: var(--color-green-950); letter-spacing: -0.02em; }
                .blog-prose h3 { font-size: 1.8rem; font-weight: 800; margin: 2.5rem 0 1.25rem; color: var(--color-green-900); }
                .blog-prose img { max-width: 100%; border-radius: 2rem; margin: 3rem 0; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .blog-prose ul, .blog-prose ol { margin-bottom: 2rem; padding-left: 2rem; }
                .blog-prose li { margin-bottom: 0.8rem; }
                .blog-prose blockquote { 
                    border-left: 5px solid var(--color-mango-500); 
                    padding: 1.5rem 2rem; 
                    background: var(--color-mango-50); 
                    border-radius: 0 1.5rem 1.5rem 0;
                    font-style: italic;
                    font-size: 1.3rem;
                    color: var(--color-green-900);
                    margin: 3rem 0;
                }
                .share-icon:hover { 
                    background: var(--color-mango-500) !important; 
                    color: white !important;
                }
                @media (max-width: 1100px) {
                    .container[style*="grid-template-columns: minmax(0, 1fr) 380px"] {
                        grid-template-columns: 1fr !important;
                    }
                    .blog-sidebar {
                        margin-top: 2rem;
                    }
                    .blog-sidebar [style*="position: sticky"] {
                        position: relative !important;
                        top: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
