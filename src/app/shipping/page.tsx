export default function ShippingPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'white', padding: '6rem 0 10rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ borderBottom: '1px solid var(--color-gray-200)', marginBottom: '3rem', paddingBottom: '1.5rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: 'var(--color-mango-900)' }}>
                        Shipping Policy
                    </h1>
                </div>

                <div style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        At Salem Farm Mango, we are committed to delivering the freshest, naturally ripened mangoes directly from our farm to your doorstep. Please read our shipping policy carefully to understand how we handle your orders.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        1. Delivery Coverage
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        We ship to almost all major cities and towns across India. If you are unsure whether we deliver to your pincode, please contact us before placing an order.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        2. Delivery Timelines
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        Since our mangoes are naturally ripened and harvested based on demand, we process orders within <strong>24 hours</strong> of harvest.
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Metro Cities:</strong> 2-3 business days.</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Other Cities:</strong> 3-5 business days.</li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Remote Areas:</strong> 5-7 business days.</li>
                    </ul>
                    <p style={{ marginBottom: '1rem' }}>
                        Please note that delivery times may vary due to weather conditions, courier delays, or public holidays.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        3. Packaging
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        We use specialized, sturdy packaging designed to protect the fruits during transit. Each mango is individually wrapped or cushioned to prevent damage and maintain freshness.
                    </p>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-mango-800)', marginTop: '2.5rem', marginBottom: '1rem' }}>
                        4. Tracking Your Order
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        Once your order is dispatched, you will receive a tracking link via email and SMS. You can use this link to track the real-time status of your shipment.
                    </p>
                </div>
            </div>
        </div>
    );
}
