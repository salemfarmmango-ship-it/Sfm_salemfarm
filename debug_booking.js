// Debug script: Test Delhivery booking API directly, output to file
const fs = require('fs');

async function testBooking() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/orders/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: 1021 })
        });

        const data = await res.json();
        const output = {
            status: res.status,
            response: data
        };

        fs.writeFileSync('debug_booking_output.json', JSON.stringify(output, null, 2));
        console.log('Status:', res.status);
        console.log('Output written to debug_booking_output.json');
    } catch (err) {
        fs.writeFileSync('debug_booking_output.json', JSON.stringify({ error: err.message }));
        console.error('Error:', err.message);
    }
}

testBooking();
