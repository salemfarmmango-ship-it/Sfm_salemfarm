export default function PrivacyPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'white', padding: '6rem 0 10rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ borderBottom: '1px solid var(--color-gray-200)', marginBottom: '3rem', paddingBottom: '1.5rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: 'var(--color-mango-900)' }}>
                        Privacy Policy
                    </h1>
                </div>

                <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        Your privacy is important to us. This policy outlines how Salem Farm Mango collects, uses, and protects your personal information.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        1. Information We Collect
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        We collect information necessary to process your orders and improve your shopping experience, including:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Name, delivery address, and contact details (phone/email).</li>
                        <li style={{ marginBottom: '0.5rem' }}>Order history and preferences.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Payment details (processed securely via our payment gateway).</li>
                    </ul>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        2. How We Use Your Information
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        We use your data strictly for:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>Processing and delivering your orders.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Communicating order updates and tracking information.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Sending seasonal offers or newsletters (only if you opted in).</li>
                    </ul>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        3. Data Security
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        We implement industry-standard security measures to protect your data. We do not sell, trade, or share your personal information with third parties for marketing purposes.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        4. Contact Us
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        If you have questions about our privacy practices, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
}
