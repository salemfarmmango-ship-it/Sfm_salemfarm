export class EmailService {
    private static async sendEmail(to: string, subject: string, html: string) {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to, subject, html }),
            });
            return await response.json();
        } catch (error) {
            console.error('Email sending failed:', error);
            return { error: 'Failed to send email' };
        }
    }

    static async sendOrderConfirmation(order: any, items: any[]) {
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <span style="font-weight: 600; color: #333;">${item.name || 'Product'}</span>
                    <br />
                    <span style="font-size: 14px; color: #666;">Qty: ${item.quantity} × ₹${item.price}</span>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #333;">
                    ₹${(item.quantity * item.price).toLocaleString('en-IN')}
                </td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 30px 0; background: #edf7ed; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px; }
                    .order-info { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .button { display: inline-block; padding: 14px 28px; background: #439643; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://salemfarmmango.com/logo.png" alt="Salem Farm Mango" style="height: 60px;" />
                        <h1 style="color: #1b421b; margin: 15px 0 0 0; font-size: 28px;">Order Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${order.shipping_address?.full_name?.split(' ')[0] || 'there'},</p>
                        <p>Thank you for your order! We're excited to let you know that we've received your order and are preparing it for harvest.</p>
                        
                        <div class="order-info">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong>Order ID: #${order.id}</strong>
                                <span>${new Date().toLocaleDateString('en-IN')}</span>
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                <strong>Shipping To:</strong><br />
                                ${order.shipping_address?.full_name}<br />
                                ${order.shipping_address?.address_line1}, ${order.shipping_address?.city}<br />
                                ${order.shipping_address?.state} - ${order.shipping_address?.postal_code}
                            </div>
                        </div>

                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #eee;">Item</th>
                                    <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #eee;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td style="padding: 20px 0 5px 0; text-align: right; font-weight: 600;">Subtotal:</td>
                                    <td style="padding: 20px 0 5px 0; text-align: right; font-weight: 600;">₹${order.total_amount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; text-align: right; font-weight: 600; color: #1b421b; font-size: 18px;">Total Paid:</td>
                                    <td style="padding: 5px 0; text-align: right; font-weight: 600; color: #1b421b; font-size: 18px;">₹${order.total_amount.toLocaleString('en-IN')}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div style="text-align: center;">
                            <a href="https://salemfarmmango.com/account/orders" class="button">View Order Status</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Salem Farm Mango. All rights reserved.</p>
                        <p>Salem, Tamil Nadu, India</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const email = order.user_email || order.profiles?.email || order.shipping_address?.email;
        return this.sendEmail(email, `Order Confirmed: #${order.id} - Salem Farm Mango`, html);
    }

    static async sendShippingNotification(order: any) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; padding: 30px 0; background: #edf7ed; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    .button { display: inline-block; padding: 14px 28px; background: #439643; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
                    .truck-icon { font-size: 48px; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="truck-icon">🚛</div>
                        <h1 style="color: #1b421b; margin: 0; font-size: 28px;">Your Order is Shipped!</h1>
                    </div>
                    <div class="content">
                        <p>Great news! Your delicious mangoes are on their way to you.</p>
                        <p>Order <strong>#${order.id}</strong> has been handed over to our delivery partner and will reach your doorstep soon.</p>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #1b421b;">Delivery Address:</h3>
                            <p style="margin-bottom: 0;">
                                ${order.shipping_address?.full_name}<br />
                                ${order.shipping_address?.address_line1}<br />
                                ${order.shipping_address?.city}, ${order.shipping_address?.state}<br />
                                <strong>PIN: ${order.shipping_address?.postal_code}</strong>
                            </p>
                        </div>

                        <p>We've carefully packed them to ensure they reach you fresh and perfect. When they arrive, remember to unbox them and let them breathe!</p>

                        <div style="text-align: center;">
                            <a href="https://salemfarmmango.com/account/orders" class="button">Track Your Order</a>
                        </div>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            Thanks for choosing <strong>Salem Farm Mango</strong>. We hope you enjoy the "King of Fruits" directly from our trees!
                        </p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Salem Farm Mango. All rights reserved.</p>
                        <p>Need help? Contact us at support@salemfarmmango.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const email = order.user_email || order.profiles?.email || order.shipping_address?.email;
        if (!email) {
            console.error('No email found for order', order.id);
            return;
        }

        return this.sendEmail(email, `Your order #${order.id} has been shipped! - Salem Farm Mango`, html);
    }
}
