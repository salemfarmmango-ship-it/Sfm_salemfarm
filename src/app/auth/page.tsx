'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { OTPInput } from '@/components/auth/OTPInput';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Phone, Mail } from 'lucide-react';
import Script from 'next/script';



type AuthMode = 'login' | 'signup' | 'reset';
type AuthMethod = 'phone' | 'email';
type LoginStep = 'input';
type SignupStep = 'input' | 'otp' | 'password';
type ResetStep = 'input' | 'otp' | 'newpassword';

export default function AuthPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [method, setMethod] = useState<AuthMethod>('phone');
    const [loginStep, setLoginStep] = useState<LoginStep>('input');
    const [signupStep, setSignupStep] = useState<SignupStep>('input');
    const [resetStep, setResetStep] = useState<ResetStep>('input');

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleGoogleResponse = useCallback(async (response: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Google login failed');

            setSuccess('Login successful!');
            await refreshUser();
            setTimeout(() => router.push('/account'), 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [refreshUser, router]);

    useEffect(() => {
        /* global google */
        if (typeof window !== 'undefined' && (window as any).google) {
            (window as any).google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            const btn = document.getElementById('google-signin-button');
            if (btn) {
                (window as any).google.accounts.id.renderButton(
                    btn,
                    { theme: 'outline', size: 'large', width: '100%' }
                );
            }
        }
    }, [mode, handleGoogleResponse]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Login successful!');
            await refreshUser();
            setTimeout(() => router.push('/account'), 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const purpose = mode === 'signup' ? 'signup' : (mode === 'reset' ? 'reset' : 'login');
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, type: method, purpose })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('OTP sent!');
            if (mode === 'signup') setSignupStep('otp');
            else if (mode === 'reset') setResetStep('otp');
            setResendTimer(45);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (code: string) => {
        setError('');
        setLoading(true);

        try {
            const purpose = mode === 'signup' ? 'signup' : (mode === 'reset' ? 'reset' : 'login');
            setSuccess(''); // Clear previous success (like "OTP sent")
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, code, purpose })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setVerificationToken(data.verificationToken);
            setSuccess('OTP verified!');
            
            if (mode === 'signup') {
                setSignupStep('password');
            } else if (mode === 'reset') {
                setResetStep('newpassword');
            } else if (mode === 'login') {
                handleLoginOTP(data.verificationToken);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginOTP = async (token: string) => {
        try {
            const response = await fetch('/api/auth/login-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, verificationToken: token, type: method })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Login successful!');
            setTimeout(() => router.push('/account'), 1000);
        } catch (err: any) {
            setSuccess('');
            setError(err.message);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, verificationToken, type: method })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Account created! Please login.');
            setTimeout(() => {
                setMode('login');
                setSignupStep('input');
                setPassword('');
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, newPassword: password, verificationToken })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('Password reset! Please login.');
            setTimeout(() => {
                setMode('login');
                setResetStep('input');
                setPassword('');
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '500px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h1>

                {/* Phone/Email Toggle */}
                {((mode === 'login' && loginStep === 'input') || signupStep === 'input' || resetStep === 'input') && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button onClick={() => { setMethod('phone'); setIdentifier(''); }} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: method === 'phone' ? 'var(--color-green-600)' : 'white', color: method === 'phone' ? 'white' : 'inherit', cursor: 'pointer', fontWeight: '500' }}>Phone</button>
                        <button onClick={() => { setMethod('email'); setIdentifier(''); }} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: method === 'email' ? 'var(--color-green-600)' : 'white', color: method === 'email' ? 'white' : 'inherit', cursor: 'pointer', fontWeight: '500' }}>Email</button>
                    </div>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                    <>
                    {loginStep === 'input' && (
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '1rem' }}>
                                {/* Label hidden as per request */}
                                {/* <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{method === 'phone' ? 'Phone Number' : 'Email'}</label> */}

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {method === 'phone' ? (
                                        <>
                                            <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: 'var(--color-gray-100)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={18} style={{ color: 'var(--text-secondary)' }} />
                                                <span>+91</span>
                                            </div>
                                            <input type="tel" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="9876543210" required maxLength={10} style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                        </>
                                    ) : (
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                            <input type="email" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                            {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                            {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}

                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-green-600)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginBottom: '1rem' }}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                            
                            {/* Text Links */}
                            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                                <button type="button" onClick={() => { setMode('reset'); setResetStep('input'); setPassword(''); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Forgot your password?
                                </button>
                                <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Don&apos;t have an account? <button type="button" onClick={() => { setMode('signup'); setSignupStep('input'); setPassword(''); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>Sign up</button>
                                </div>
                            </div>

                            <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                            </div>

                            <div id="google-signin-button" style={{ width: '100%', marginBottom: '1.5rem' }}></div>
                        </form>
                    )}
                    
                    </>
                )}

                {/* SIGNUP FLOW */}
                {mode === 'signup' && (
                    <>
                        {signupStep === 'input' && (
                            <form onSubmit={handleSendOTP}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{method === 'phone' ? 'Phone Number' : 'Email'}</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {method === 'phone' && <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: 'var(--color-gray-100)', fontWeight: '500' }}>+91</div>}
                                        <input type={method === 'phone' ? 'tel' : 'email'} value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={method === 'phone' ? '9876543210' : 'you@example.com'} required maxLength={method === 'phone' ? 10 : undefined} style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                    </div>
                                </div>
                                {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                                {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-green-600)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>Login</button>
                                </div>
                            </form>
                        )}

                        {signupStep === 'otp' && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <h3>Verify Your {method === 'phone' ? 'Phone' : 'Email'}</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Code sent to {method === 'phone' ? `+91 ${identifier}` : identifier}</p>
                                </div>
                                <div style={{ marginBottom: '2rem' }}><OTPInput onComplete={handleVerifyOTP} /></div>
                                {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                                {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}
                                <div style={{ textAlign: 'center' }}>
                                    {resendTimer > 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resend OTP in {resendTimer}s</p> : <button onClick={() => { setSignupStep('input'); setIdentifier(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>Resend OTP</button>}
                                </div>
                            </>
                        )}

                        {signupStep === 'password' && (
                            <form onSubmit={handleSignup}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Set Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                    </div>
                                    <small style={{ color: 'var(--text-secondary)' }}>Minimum 6 characters</small>
                                </div>
                                {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                                {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-green-600)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {/* RESET PASSWORD FLOW */}
                {mode === 'reset' && (
                    <>
                        {resetStep === 'input' && (
                            <form onSubmit={handleSendOTP}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{method === 'phone' ? 'Phone Number' : 'Email'}</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {method === 'phone' && <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: 'var(--color-gray-100)', fontWeight: '500' }}>+91</div>}
                                        <input type={method === 'phone' ? 'tel' : 'email'} value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={method === 'phone' ? '9876543210' : 'you@example.com'} required maxLength={method === 'phone' ? 10 : undefined} style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                    </div>
                                </div>
                                {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                                {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-green-600)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginBottom: '1rem' }}>
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Remember your password? <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>Login</button>
                                </div>
                            </form>
                        )}

                        {resetStep === 'otp' && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <h3>Verify Identity</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Code sent to {method === 'phone' ? `+91 ${identifier}` : identifier}</p>
                                </div>
                                <div style={{ marginBottom: '2rem' }}><OTPInput onComplete={handleVerifyOTP} /></div>
                                {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                                {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}
                            </>
                        )}

                        {resetStep === 'newpassword' && (
                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontSize: '1rem' }} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                    </div>
                                </div>
                                {error && <div style={{ padding: '0.75rem', background: '#fee', color: '#c00', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                                {success && <div style={{ padding: '0.75rem', background: '#efe', color: '#060', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-green-600)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
            <Script 
                src="https://accounts.google.com/gsi/client" 
                strategy="afterInteractive" 
                onLoad={() => {
                    /* global google */
                    if ((window as any).google) {
                        (window as any).google.accounts.id.initialize({
                            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                            callback: handleGoogleResponse
                        });
                        const btn = document.getElementById('google-signin-button');
                        if (btn) {
                            (window as any).google.accounts.id.renderButton(
                                btn,
                                { theme: 'outline', size: 'large', width: '100%' }
                            );
                        }
                    }
                }}
            />
        </div>
    );
}
