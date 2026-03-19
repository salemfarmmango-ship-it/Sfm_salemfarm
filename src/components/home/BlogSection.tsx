'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogInfo {
    id: number;
    title: string;
    slug: string;
    image_url: string;
    content: string;
    created_at: string;
}

interface BlogSectionProps {
    blogs: BlogInfo[];
}

export const BlogSection: React.FC<BlogSectionProps> = ({ blogs }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(8);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const getExcerpt = (html: string) => {
        if (!html) return '';
        // Decode common entities locally so regex matches them
        let clean = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        // Strip HTML tags
        clean = clean.replace(/<[^>]+>/g, '');
        // Erase raw data:image fragments that might have sneaked past
        if (clean.includes('data:image')) {
            clean = clean.split('data:image')[0];
        }
        clean = clean.trim();
        return clean.substring(0, 100) + (clean.length > 100 ? '...' : '');
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
    };

    // Auto-scroll logic
    useEffect(() => {
        if (blogs.length === 0 || isHovering) return;

        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                
                if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
                }
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [blogs.length, isHovering]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // DO NOT change displayLimit based on screen size because 
            // the slider hides overflow horizontally and slicing creates hydration errors
            // We just stick to 8 items in the DOM
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!blogs || blogs.length === 0) return null;

    const displayedBlogs = blogs.slice(0, displayLimit);
    const hasMore = blogs.length > displayLimit;

    return (
        <section className="section-padding" style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <div style={{ color: 'var(--color-mango-600)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Journal</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-green-950)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Farm Stories</h2>
                        <div style={{ width: '60px', height: '4px', background: 'var(--color-mango-500)', borderRadius: '2px' }}></div>
                    </div>
                    <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={scrollLeft} aria-label="Scroll left" style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                border: '1px solid var(--border-light)', background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }} className="slider-nav-btn">
                                <ChevronLeft size={20} color="var(--color-green-800)" />
                            </button>
                            <button onClick={scrollRight} aria-label="Scroll right" style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                border: '1px solid var(--border-light)', background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }} className="slider-nav-btn">
                                <ChevronRight size={20} color="var(--color-green-800)" />
                            </button>
                        </div>
                        <Link href="/blog" style={{ 
                            color: 'var(--color-green-700)', 
                            fontWeight: '700', 
                            fontSize: '0.95rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            background: 'var(--color-green-50)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            transition: 'all 0.3s ease'
                        }}>
                            Explore All Stories <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="blog-slider-track" 
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={{ 
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '1.5rem',
                        paddingBottom: '2rem',
                        paddingTop: '0.5rem',
                        scrollSnapType: 'x mandatory',
                    }}
                >
                    {displayedBlogs.map((blog) => (
                        <div 
                            key={blog.id} 
                            className="blog-slider-item"
                            style={{ 
                                display: 'flex',
                                flexShrink: 0,
                                scrollSnapAlign: 'start'
                            }}
                        >
                            <Link 
                                href={`/blog/${blog.slug}`}
                                style={{ 
                                    textDecoration: 'none', 
                                    color: 'inherit', 
                                    display: 'flex',
                                    width: '100%'
                                }}
                            >
                                <div className="card blog-card-premium" style={{ 
                                padding: '0', 
                                overflow: 'hidden', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                border: '1px solid #f1f5f9',
                                borderRadius: '1.5rem',
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                width: '100%',
                                height: '100%'
                            }}>
                                <div style={{ 
                                    height: '200px', 
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        position: 'absolute',
                                        inset: 0,
                                        background: blog.image_url ? `url(${blog.image_url})` : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        transition: 'transform 0.6s ease'
                                    }} className="blog-img-zoom" />
                                    
                                    {!blog.image_url && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={40} color="#cbd5e1" />
                                        </div>
                                    )}

                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '1rem', 
                                        left: '1rem', 
                                        background: 'rgba(255,255,255,0.9)', 
                                        backdropFilter: 'blur(8px)',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '50px',
                                        fontSize: '0.65rem',
                                        fontWeight: '800',
                                        color: 'var(--color-green-800)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        <Calendar size={12} />
                                        {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '800', 
                                        marginBottom: '0.75rem', 
                                        color: 'var(--color-green-950)',
                                        lineHeight: '1.3',
                                        display: '-webkit-box', 
                                        WebkitLineClamp: 2, 
                                        WebkitBoxOrient: 'vertical', 
                                        overflow: 'hidden' 
                                    }}>
                                        {blog.title}
                                    </h3>
                                    <p style={{ 
                                        color: '#64748b', 
                                        fontSize: '0.85rem', 
                                        lineHeight: '1.5',
                                        display: '-webkit-box', 
                                        WebkitLineClamp: 2, 
                                        WebkitBoxOrient: 'vertical', 
                                        overflow: 'hidden',
                                        marginBottom: '1rem',
                                        flex: 1,
                                        wordBreak: 'break-word'
                                    }}>
                                        {getExcerpt(blog.content)}
                                    </p>
                                    <div style={{ color: 'var(--color-green-700)', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Read Story <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {(hasMore || isMobile) && (
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link href="/blog" style={{ 
                            display: 'inline-flex',
                            alignItems: 'center', 
                            gap: '8px',
                            color: 'var(--color-green-700)', 
                            fontWeight: '700', 
                            fontSize: '1rem', 
                            background: 'var(--color-green-50)',
                            padding: '1rem 2.5rem',
                            borderRadius: '50px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(40, 94, 40, 0.1)'
                        }} className="hover-lift">
                            Read More Stories <ArrowRight size={20} />
                        </Link>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .blog-slider-track::-webkit-scrollbar {
                    display: none;
                }
                .blog-slider-track {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .blog-slider-item {
                    width: calc(100% - 2rem);
                    max-width: 320px;
                }
                @media (min-width: 640px) {
                    .blog-slider-item {
                        width: calc(50% - 1rem);
                    }
                }
                @media (min-width: 1024px) {
                    .blog-slider-item {
                        width: calc(33.333% - 1rem);
                    }
                }
                @media (min-width: 1280px) {
                    .blog-slider-item {
                        width: calc(25% - 1.125rem);
                    }
                }
                .slider-nav-btn:hover {
                    background: var(--color-mango-50) !important;
                    border-color: var(--color-mango-200) !important;
                }
                .blog-card-premium:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                    border-color: var(--color-mango-200);
                }
                .blog-card-premium:hover .blog-img-zoom {
                    transform: scale(1.08);
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                    background: var(--color-green-100);
                    box-shadow: 0 6px 15px rgba(40, 94, 40, 0.15);
                }
            `}</style>
        </section>
    );
};
