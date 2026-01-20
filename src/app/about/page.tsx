'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Leaf, Award, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" as const }
    };

    const staggering = {
        initial: { opacity: 0 },
        whileInView: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        },
        viewport: { once: true }
    };

    return (
        <div style={{ background: '#f8fafc', overflowX: 'hidden' }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: '80vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <Image
                    src="/hero-about.jpg"
                    alt="Salem Mango Farm"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
                    zIndex: 1
                }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        textAlign: 'center',
                        color: 'white',
                        padding: '0 1rem'
                    }}
                >
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            color: 'var(--color-mango-400)',
                            display: 'block',
                            marginBottom: '1rem'
                        }}
                    >
                        Established 1984
                    </motion.span>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 5rem)',
                        fontWeight: '900',
                        lineHeight: 1,
                        marginBottom: '1.5rem',
                        textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: 'white'
                    }}>
                        Taste the Salem <br /> Heritage
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        fontWeight: '500',
                        opacity: 0.9
                    }}>
                        From our family groves to your doorstep. Naturally ripened, 100% organic mangoes grown with love in the heart of Tamil Nadu.
                    </p>
                </motion.div>

                {/* Animated scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2,
                        color: 'white',
                        opacity: 0.7
                    }}
                >
                    <div style={{ width: '2px', height: '60px', background: 'linear-gradient(to bottom, white, transparent)' }} />
                </motion.div>
            </section>

            {/* Legacy Section */}
            <section className="container" style={{ padding: '8rem 1rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    <motion.div {...fadeIn}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            color: 'var(--color-green-900)',
                            marginBottom: '2rem',
                            lineHeight: 1.1
                        }}>
                            Three Generations of <br /> <span style={{ color: 'var(--color-mango-600)' }}>Sustainable Farming</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7 }}>
                            <p>
                                What started as a small family grove in the fertile soils of Salem has grown into a legacy of quality.
                                Our ancestors taught us that to get the best fruit, you must respect the tree, the soil, and the season.
                            </p>
                            <p>
                                Today, we continue those same traditions. We don't use artificial ripeners, carbide, or harmful pesticides.
                                Instead, we rely on the sun, the wind, and natural ripening methods passed down through generations.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        style={{ position: 'relative', height: '500px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    >
                        <Image
                            src="/harvesting.png"
                            alt="Traditional Harvesting"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Features Staggered Grid */}
            <section style={{ background: 'white', padding: '8rem 1rem' }}>
                <div className="container">
                    <motion.div
                        {...fadeIn}
                        style={{ textAlign: 'center', marginBottom: '5rem' }}
                    >
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-green-900)' }}>Why Salem Farm?</h2>
                        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>We take pride in our process, ensuring quality at every step.</p>
                    </motion.div>

                    <motion.div
                        variants={staggering}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1.5rem'
                        }}
                    >
                        <FeatureCard
                            icon={<Leaf size={24} />}
                            title="100% Organic"
                            desc="We use only organic fertilizers and traditional pest control methods."
                        />
                        <FeatureCard
                            icon={<Zap size={24} />}
                            title="Carbide Free"
                            desc="Our mangoes are ripened naturally in hay boxes for full flavor."
                        />
                        <FeatureCard
                            icon={<Award size={24} />}
                            title="Premium Quality"
                            desc="Hand-picked at peak maturity and inspected for quality."
                        />
                        <FeatureCard
                            icon={<Heart size={24} />}
                            title="Farm to Home"
                            desc="Direct shipping ensures maximum freshness for you."
                        />
                    </motion.div>
                </div>
            </section>

            {/* Quote Section */}
            <section style={{
                position: 'relative',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginTop: '0'
            }}>
                <Image
                    src="/hero-about.jpg"
                    alt="Farm background"
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(21, 50, 31, 0.85)', // deeply tinted overlay
                    zIndex: 1
                }} />

                <div className="container" style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    color: 'white',
                    maxWidth: '900px',
                    padding: '0 2rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        {/* Decorative Quote Icon */}
                        <div style={{
                            fontSize: '8rem',
                            lineHeight: 1,
                            fontFamily: 'serif',
                            color: 'var(--color-mango-400)',
                            opacity: 0.3,
                            marginBottom: '-2rem',
                            display: 'block'
                        }}>
                            &ldquo;
                        </div>

                        <h2 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: '400',
                            fontFamily: 'serif', // Assuming the project has a serif font loaded or fallback
                            fontStyle: 'italic',
                            color: '#f0fdf4',
                            marginBottom: '3rem',
                            lineHeight: 1.4,
                            textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                            A mango is not just a fruit; it's a taste of summer, a memory of home, and a gift of nature.
                        </h2>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div style={{
                                width: '60px',
                                height: '3px',
                                background: 'var(--color-mango-400)',
                                margin: '0 auto 1.5rem auto'
                            }} />
                            <span style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: 'white',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                opacity: 0.9
                            }}>
                                Our Founding Vision
                            </span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <motion.div
            variants={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5 }}
            style={{
                padding: '2rem 1.5rem',
                background: '#f8fafc',
                borderRadius: '24px',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1px solid rgba(0,0,0,0.03)'
            }}
        >
            <div style={{
                width: '48px',
                height: '48px',
                background: 'var(--color-mango-100)',
                color: 'var(--color-mango-600)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-green-900)' }}>{title}</h3>
            <p style={{ color: '#64748b', lineHeight: 1.5, fontSize: '0.95rem' }}>{desc}</p>
        </motion.div>
    );
}
