export default function ReturnsPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'white', padding: '6rem 0 10rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ borderBottom: '1px solid var(--color-gray-200)', marginBottom: '3rem', paddingBottom: '1.5rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: 'var(--color-mango-900)' }}>
                        Returns & Refunds Policy
                    </h1>
                </div>

                <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        We take great pride in the quality of our mangoes. However, as fresh produce is perishable, we have specific guidelines regarding returns and refunds.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        1. Perishable Goods Policy
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        Due to the perishable nature of mangoes, <strong>we generally do not accept returns</strong> once the order has been delivered. We strongly advise checking the package upon delivery.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        2. Damaged or Spoiled Items
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        In the unlikely event that you receive damaged, squashed, or spoiled fruit, we are happy to offer a replacement or a refund. To be eligible:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}>You must inform us within <strong>24 hours</strong> of delivery.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Please send us clear photographs of the damaged fruit/packaging via WhatsApp or email.</li>
                        <li style={{ marginBottom: '0.5rem' }}>Do not discard the item until our team has reviewed your claim.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        3. Refund Process
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        Once your claim is approved, we will initiate a refund to your original payment method. The refund typically processes within <strong>5-7 business days</strong>, depending on your bank's policies.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        4. Cancellations
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        You can cancel your order at any time <strong>before shipment</strong>. Once the order has been dispatched from our farm, it cannot be cancelled.
                    </p>
                </div>
            </div>
        </div>
    );
}
