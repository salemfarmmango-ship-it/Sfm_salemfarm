export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'white', padding: '6rem 0 10rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ borderBottom: '1px solid var(--color-gray-200)', marginBottom: '3rem', paddingBottom: '1.5rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: 'var(--color-mango-900)' }}>
                        Terms and Conditions
                    </h1>
                </div>

                <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        Welcome to Salem Farm Mango. By accessing or using our website, you agree to be bound by these terms and conditions.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        1. General Use
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        You must be at least 18 years old or visiting under the supervision of a parent or guardian to make a purchase on this site.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        2. Pricing and Availability
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        All prices are listed in Indian Rupees (INR) and are subject to change without notice. We strive to ensure availability, but as mangoes are seasonal produce, stock may fluctuate naturally.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        3. Product Information
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        We make every effort to display the colors and images of our products accurately. However, as these are natural products, slight variations in size, color, and appearance are normal.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        4. Limitation of Liability
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        Salem Farm Mango shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        5. Governing Law
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of the courts in Salem, Tamil Nadu.
                    </p>
                </div>
            </div>
        </div>
    );
}
