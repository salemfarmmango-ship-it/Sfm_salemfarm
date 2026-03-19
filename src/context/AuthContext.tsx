'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    email?: string;
    role?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
        phone?: string;
        auth_method?: string;
        [key: string]: any;
    };
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            // Check PHP Backend Cookie via Proxy
            const response = await fetch('/api/auth/me', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                if (data.authenticated && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const signOut = async () => {
        setLoading(true);
        try {
            // Clear PHP auth cookie via proxy
            await fetch('/api/auth/logout', { method: 'POST' });
            
            // Clear local state
            setUser(null);
            
            // Force a hard redirect
            router.refresh();
            window.location.href = '/auth';
        } catch (error) {
            console.error('Sign out failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
