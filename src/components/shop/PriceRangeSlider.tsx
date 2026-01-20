'use client';

import React, { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
    gap?: number;
}

export default function PriceRangeSlider({
    min,
    max,
    value,
    onChange,
    step = 10,
    gap = 100
}: PriceRangeSliderProps) {
    const [localValue, setLocalValue] = useState(value);

    // Sync local value when prop value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Handle min thumb change
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        // Prevent crossing max - gap
        const limitedValue = Math.min(val, localValue[1] - gap);
        const nextValue: [number, number] = [limitedValue, localValue[1]];
        setLocalValue(nextValue);
    };

    // Handle max thumb change
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        // Prevent crossing min + gap
        const limitedValue = Math.max(val, localValue[0] + gap);
        const nextValue: [number, number] = [localValue[0], limitedValue];
        setLocalValue(nextValue);
    };

    // Commit change on drag end
    const handleCommit = () => {
        onChange(localValue);
    };

    // Calculate percentage for track styling
    const minPercent = ((localValue[0] - min) / (max - min)) * 100;
    const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

    return (
        <div style={{ width: '100%' }}>
            <div className="range-input-container">
                {/* Visual Track (Background) */}
                <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    height: '4px', background: '#e5e7eb', borderRadius: '2px',
                    transform: 'translateY(-50%)'
                }}></div>

                {/* Visual Active Range (Green) */}
                <div style={{
                    position: 'absolute', top: '50%', height: '4px',
                    background: '#439643', borderRadius: '2px',
                    transform: 'translateY(-50%)',
                    left: `${minPercent}%`,
                    right: `${100 - maxPercent}%`
                }}></div>

                {/* Range Inputs */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[0]}
                    onChange={handleMinChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className="range-slider-input"
                    style={{ zIndex: 20 }}
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[1]}
                    onChange={handleMaxChange}
                    onMouseUp={handleCommit}
                    onTouchEnd={handleCommit}
                    className="range-slider-input"
                    style={{ zIndex: 20 }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    Price: <b style={{ color: '#333' }}>₹{localValue[0]} — ₹{localValue[1]}</b>
                </span>
            </div>
        </div>
    );
}
