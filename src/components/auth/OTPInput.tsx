'use client';
import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete }) => {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if complete
        const otpString = newOtp.join('');
        if (otpString.length === length && !newOtp.includes('')) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);

        if (/^\d+$/.test(pastedData)) {
            const newOtp = pastedData.split('').concat(Array(length).fill('')).slice(0, length);
            setOtp(newOtp);

            // Focus last filled input
            const lastIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[lastIndex]?.focus();

            // Auto-complete if full
            if (pastedData.length === length) {
                onComplete(pastedData);
            }
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    style={{
                        width: '3rem',
                        height: '3rem',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        border: '2px solid var(--border-light)',
                        borderRadius: '0.5rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-mango-600)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                />
            ))}
        </div>
    );
};
