
import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'btn';

    let variantStyles = '';
    switch (variant) {
        case 'primary': variantStyles = 'btn-primary'; break;
        case 'outline': variantStyles = 'btn-outline'; break;
        case 'ghost': variantStyles = 'text-gray-600 hover:bg-gray-100'; break;
        case 'danger': variantStyles = 'bg-red-500 text-white hover:bg-red-600'; break;
    }

    const sizeStyles = size === 'sm' ? 'text-sm py-1 px-3' : size === 'lg' ? 'text-lg py-3 px-6' : '';
    const opacity = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';

    // Note: We are using a mix of global CSS classes and inline/utility-like logic.
    // Ideally, move these strictly to CSS modules for a purer approach, 
    // but for now, we leverage global .btn classes + standard utility-ish names if we had a utility class system.
    // Since we don't have Tailwind, we should rely on style attributes or more CSS classes in globals.
    // I will stick to the .btn classes defined in globals.css and inline styles for dynamic overrides if needed,
    // or add more specific classes to globals.css. 
    // For simplicity in this `other` tool usage, I'll rely on the global classes I created: .btn, .btn-primary, .btn-outline.

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} ${opacity}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" style={{ marginRight: '0.5rem', width: '1em', height: '1em' }} />}
            {children}
        </button>
    );
};
