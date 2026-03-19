'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface InstagramSectionProps {
    postUrls: string[];
}

export const InstagramSection: React.FC<InstagramSectionProps> = ({ postUrls }) => {
    const [displayLimit, setDisplayLimit] = useState(12);

    useEffect(() => {
        // Load Instagram embed script if not already present
        if (!document.getElementById('instagram-embed-script')) {
            const script = document.createElement('script');
            script.id = 'instagram-embed-script';
            script.src = "https://www.instagram.com/embed.js";
            script.async = true;
            document.body.appendChild(script);
        } else if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }
    }, [postUrls, displayLimit]);

    if (!postUrls || postUrls.length === 0) return null;

    const displayedPosts = postUrls.slice(0, displayLimit);
    const hasMore = postUrls.length > displayLimit;

    return (
        <section className="section-padding" style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ color: 'var(--color-mango-600)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Social Feed</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-green-950)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>On the Farm</h2>
                    <div style={{ width: '60px', height: '4px', background: 'var(--color-mango-500)', borderRadius: '2px', margin: '0 auto' }}></div>
                </div>
                
                <div className="instagram-grid">
                    {displayedPosts.map((url, i) => (
                        <div key={url + i} className="instagram-card-wrapper">
                            <div className="instagram-card">
                                <blockquote 
                                    className="instagram-media" 
                                    data-instgrm-permalink={url}
                                    data-instgrm-version="14"
                                    style={{ 
                                        background: '#FFF', 
                                        border: 0, 
                                        margin: 0, 
                                        padding: 0, 
                                        width: '100%',
                                        minWidth: '100%'
                                    }}
                                >
                                </blockquote>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <button 
                            onClick={() => setDisplayLimit(prev => prev + 12)}
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center', 
                                gap: '8px',
                                color: 'var(--color-green-700)', 
                                fontWeight: '700', 
                                fontSize: '1rem', 
                                background: 'var(--color-green-50)',
                                padding: '1rem 2.5rem',
                                borderRadius: '50px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(40, 94, 40, 0.1)'
                            }} className="hover-lift">
                            Load More Posts <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .instagram-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: 1fr;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                @media (min-width: 640px) {
                    .instagram-grid {
                        grid-template-columns: repeat(2, 1fr);
                        max-width: 100%;
                    }
                }
                
                @media (min-width: 1024px) {
                    .instagram-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .instagram-card-wrapper {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    min-width: 0;
                }

                .instagram-card {
                    width: 100%;
                    max-width: 100%;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    border-radius: 1.5rem;
                    overflow: hidden;
                    background: white;
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
