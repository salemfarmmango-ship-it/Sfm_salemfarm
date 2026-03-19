'use client';
import React from 'react';
import { Sprout, BookOpen, Clock } from 'lucide-react';

export const BlogHero = () => {
    return (
        <section style={{ 
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', 
            padding: '6rem 1rem', 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '0 0 3rem 3rem',
            marginBottom: '4rem'
        }}>
            {/* Background decorative elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1, transform: 'rotate(15deg)' }}>
                <Sprout size={400} color="white" />
            </div>
            
            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '0.5rem 1.25rem', 
                    borderRadius: '50px',
                    color: '#fbbf24',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <BookOpen size={16} />
                    OUR FARM JOURNAL
                </div>
                
                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
                    color: 'white', 
                    fontWeight: '800', 
                    marginBottom: '1.5rem',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em'
                }}>
                    Stories from the <br />
                    <span style={{ color: '#fbbf24' }}>Heart of Salem</span>
                </h1>
                
                <p style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '1.2rem', 
                    maxWidth: '700px', 
                    margin: '0 auto 2.5rem',
                    lineHeight: '1.6' 
                }}>
                    Discover the secrets of organic mango farming, traditional recipes, and the daily rhythm of our orchard.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'white', fontSize: '0.9rem', opacity: 0.9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color="#fbbf24" />
                        <span>Fresh Weekly Updates</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sprout size={16} color="#fbbf24" />
                        <span>100% Organic Content</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
