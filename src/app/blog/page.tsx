'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, User, Tag, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { MangoLoader } from '@/components/common/MangoLoader';
import { BlogHero } from '@/components/blog/BlogHero';

const BLOGS_PER_PAGE = 10;

export default function BlogListPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    // Robust function to strip HTML safely on the client
    const getExcerpt = (html: string) => {
        if (!html) return '';
        if (typeof window !== 'undefined') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const text = (tempDiv.textContent || tempDiv.innerText || '').trim();
            return text.substring(0, 120) + (text.length > 120 ? '...' : '');
        }
        return html.replace(/<[^>]+>/g, '').substring(0, 120) + '...';
    };

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch('/api/blogs?status=published', { cache: 'no-store' });
                const data = await res.json();
                if (res.ok) {
                    setBlogs(data || []);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) {
        return <MangoLoader />;
    }

    // Auto-scroll logic
    useEffect(() => {
        if (blogs.length === 0 || isHovering) return;

        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                
                // If we reached the end, scroll back to start
                if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll by one card roughly (320px + gap)
                    scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
                }
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [blogs.length, isHovering]);

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

    return (
        <div style={{ background: '#fcfcfb', minHeight: '100vh', paddingBottom: '6rem' }}>
            <BlogHero />

            <div className="container" style={{ padding: '0 1rem' }}>
                {blogs.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '8rem 2rem', background: 'white',
                        borderRadius: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍃</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-green-900)', marginBottom: '1rem' }}>Our Journal is Being Prepared</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                            We're currently writing fresh stories from the farm. Check back soon!
                        </p>
                    </div>
                ) : (
                    <>
                    <div 
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        {/* Header with Title and Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Showing {blogs.length} stories
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={scrollLeft} style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    border: '1px solid var(--border-light)', background: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }} className="slider-nav-btn">
                                    <ChevronLeft size={20} color="var(--color-green-800)" />
                                </button>
                                <button onClick={scrollRight} style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    border: '1px solid var(--border-light)', background: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }} className="slider-nav-btn">
                                    <ChevronRight size={20} color="var(--color-green-800)" />
                                </button>
                            </div>
                        </div>

                        {/* Slider track */}
                        <div 
                            ref={scrollContainerRef}
                            className="blog-slider-track"
                            style={{
                                display: 'flex',
                                overflowX: 'auto',
                                gap: '1.5rem',
                                paddingBottom: '2rem',
                                paddingTop: '0.5rem',
                                scrollSnapType: 'x mandatory',
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none' // IE 10+
                            }}
                        >
                            {blogs.map((blog) => (
                                <Link
                                    href={`/blog/${blog.slug}`}
                                    key={blog.id}
                                    style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, scrollSnapAlign: 'start' }}
                                    className="blog-slider-item"
                                >
                                    <article className="blog-card" style={{
                                        height: '100%', display: 'flex', flexDirection: 'column',
                                        background: 'white', borderRadius: '1.25rem', overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        cursor: 'pointer', border: '1px solid rgba(0,0,0,0.03)'
                                    }}>
                                        {/* Image */}
                                        <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: blog.image_url ? `url(${blog.image_url})` : 'var(--color-green-800)',
                                                backgroundSize: 'cover', backgroundPosition: 'center',
                                                transition: 'transform 0.6s ease'
                                            }} className="blog-image" />
                                            <div style={{
                                                position: 'absolute', top: '1rem', left: '1rem',
                                                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                                                padding: '0.35rem 0.75rem', borderRadius: '50px',
                                                fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-green-800)',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}>
                                                <Tag size={10} /> FARM LIFE
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    <Calendar size={12} color="var(--color-mango-600)" />
                                                    {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    <Clock size={12} color="var(--color-mango-600)" />
                                                    5 min read
                                                </div>
                                            </div>

                                            <h2 style={{
                                                fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem',
                                                color: 'var(--color-green-950)', lineHeight: '1.3',
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }} className="blog-title">
                                                {blog.title}
                                            </h2>

                                            <p style={{
                                                color: '#64748b', fontSize: '0.86rem', lineHeight: '1.5',
                                                flex: 1, marginBottom: '0.75rem',
                                                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>
                                                {getExcerpt(blog.content)}
                                            </p>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-mango-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={14} color="var(--color-mango-700)" />
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Farm Admin</span>
                                                </div>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%', background: '#f8fafc',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                                                }} className="arrow-btn">
                                                    <ArrowRight size={16} color="var(--color-green-700)" />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                    </>
                )}
            </div>

            <style jsx global>{`
                .blog-slider-track::-webkit-scrollbar {
                    display: none;
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
                .slider-nav-btn:hover {
                    background: var(--color-mango-50);
                    border-color: var(--color-mango-200);
                }
                .blog-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }
                .blog-card:hover .blog-image { transform: scale(1.08); }
                .blog-card:hover .blog-title { color: var(--color-green-700); }
                .blog-card:hover .arrow-btn { background: var(--color-mango-500); }
            `}</style>
        </div>
    );
}
