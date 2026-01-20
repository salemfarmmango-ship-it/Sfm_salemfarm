'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const MangoLoader = () => {
    // A refined, more curvy mango shape path
    const mangoPath = "M49.9,2.8 C24.1,3.4 8.5,33.5 12.5,63.9 C14.9,82.4 29.8,118.6 62.4,124.6 C85.6,128.9 98.4,98.6 97.4,66.9 C96.6,40.1 79.7,2.1 49.9,2.8 Z";
    // Leaf path relative to top
    const leafPath = "M50,4 Q30,-15 15,5 Q30,15 50,4";

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(4px)',
        }}>
            {/* Even Smaller Container */}
            <div style={{ width: '60px', height: '75px', position: 'relative' }}>
                <svg viewBox="0 0 110 130" width="100%" height="100%" style={{ overflow: 'visible' }}>
                    <defs>
                        <mask id="mangoFillMask">
                            {/* The white part reveals content, black hides. We want the mango shape to reveal the wave. */}
                            <path d={mangoPath} fill="white" />
                        </mask>
                    </defs>

                    {/* 1. Base Outline - Green Theme */}
                    <path
                        d={mangoPath}
                        fill="#ECFCCB"
                        stroke="#15803D"
                        strokeWidth="3"
                    />

                    {/* 2. Liquid Fill Content - Green */}
                    <g mask="url(#mangoFillMask)">
                        {/* Waving Rect moving up */}
                        <motion.rect
                            x="0"
                            y="130"
                            width="110"
                            height="130"
                            fill="#16A34A"
                            initial={{ y: 130 }}
                            animate={{ y: 0 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                                times: [0, 1]
                            }}
                        />

                        {/* Decorative wave overlay (lighter) */}
                        <motion.circle
                            cx="55" cy="130" r="80"
                            fill="#4ADE80"
                            initial={{ scale: 0.8, opacity: 0.5, y: 20 }}
                            animate={{ scale: 1.2, opacity: 0, y: -100 }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeOut"
                            }}
                        />
                    </g>

                    {/* 3. Re-draw Stroke */}
                    <path
                        d={mangoPath}
                        fill="none"
                        stroke="#14532D"
                        strokeWidth="3"
                    />

                    {/* 4. Leaf - Darker Green */}
                    <motion.path
                        d={leafPath}
                        fill="#15803D"
                        stroke="#052E16"
                        strokeWidth="2"
                        initial={{ rotate: -5 }}
                        animate={{ rotate: 5 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        style={{ originX: "50px", originY: "4px" }}
                    />
                </svg>
            </div>

            <motion.h2
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    marginTop: '0.75rem',
                    fontFamily: 'serif',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    color: '#14532D',
                    letterSpacing: '0.1em'
                }}
            >
                SFM
            </motion.h2>
        </div>
    );
};
