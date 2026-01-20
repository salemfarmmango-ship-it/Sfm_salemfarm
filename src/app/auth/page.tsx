'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { OTPInput } from '@/components/auth/OTPInput';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Mail } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AuthMode = 'login' | 'signup' | 'reset';
type AuthMethod = 'phone' | 'email';
type SignupStep = 'input' | 'otp' | 'password';
type ResetStep = 'input' | 'otp' | 'newpassword';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>('login');
    const [method, setMethod] = useState<AuthMethod>('phone');
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

            if (data.session) {
                await supabase.auth.setSession(data.session);
            }

            setSuccess('Login successful!');
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
            const purpose = mode === 'signup' ? 'signup' : 'reset';
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, type: method, purpose })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setSuccess('OTP sent!');
            if (mode === 'signup') setSignupStep('otp');
            else setResetStep('otp');
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
            const purpose = mode === 'signup' ? 'signup' : 'reset';
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, code, purpose })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setVerificationToken(data.verificationToken);
            setSuccess('OTP verified!');
            if (mode === 'signup') setSignupStep('password');
            else setResetStep('newpassword');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/account` }
        });
        if (error) setError('Google sign-in failed');
    };

    return (
        <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '500px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h1>

                {/* Google OAuth - Login or Signup Initial Step */}
                {(mode === 'login' || (mode === 'signup' && signupStep === 'input')) && (
                    <>
                        <button onClick={handleGoogleSignIn} style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" /><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" /><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" /><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" /></svg>
                            Continue with Google
                        </button>
                        <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-secondary)' }}>OR</div>
                    </>
                )}

                {/* Phone/Email Toggle */}
                {(mode === 'login' || signupStep === 'input' || resetStep === 'input') && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button onClick={() => { setMethod('phone'); setIdentifier(''); }} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: method === 'phone' ? 'var(--color-green-600)' : 'white', color: method === 'phone' ? 'white' : 'inherit', cursor: 'pointer', fontWeight: '500' }}>Phone</button>
                        <button onClick={() => { setMethod('email'); setIdentifier(''); }} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', background: method === 'email' ? 'var(--color-green-600)' : 'white', color: method === 'email' ? 'white' : 'inherit', cursor: 'pointer', fontWeight: '500' }}>Email</button>
                    </div>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
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

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: 'var(--color-green-600)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Text Links */}
                        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            <button type="button" onClick={() => { setMode('reset'); setResetStep('input'); setPassword(''); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline' }}>
                                Forgot your password?
                            </button>
                            <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
                                Don't have an account? <button type="button" onClick={() => { setMode('signup'); setSignupStep('input'); setPassword(''); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-mango-600)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>Sign up</button>
                            </div>
                        </div>
                    </form>
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
        </div>
    );
}
