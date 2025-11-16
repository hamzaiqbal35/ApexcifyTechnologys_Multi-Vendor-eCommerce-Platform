// Email service using nodemailer
// For production, configure with actual SMTP settings
const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const sendOrderConfirmationEmail = async (userEmail, orders) => {
  try {
    const orderDetails = orders.map(order => {
      const items = order.orderItems.map(item => 
        `- ${item.name} x${item.quantity} - $${item.price * item.quantity}`
      ).join('\n');
      
      return `
Order #${order._id}
Items:
${items}
Total: $${order.totalPrice}
Status: ${order.status}
      `;
    }).join('\n\n');

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@ecommerce.com',
      to: userEmail,
      subject: 'Order Confirmation',
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order has been confirmed and will be processed shortly.</p>
        <pre>${orderDetails}</pre>
        <p>You can track your order status in your account dashboard.</p>
      `
    };

    // Only send if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('Email would be sent:', mailOptions);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendOrderStatusUpdateEmail = async (userEmail, order) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@ecommerce.com',
      to: userEmail,
      subject: `Order #${order._id} Status Update`,
      html: `
        <h2>Order Status Update</h2>
        <p>Your order #${order._id} status has been updated to: <strong>${order.status}</strong></p>
        ${order.trackingNumber ? `<p>Tracking Number: <strong>${order.trackingNumber}</strong></p>` : ''}
        <p>You can view more details in your account dashboard.</p>
      `
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('Email would be sent:', mailOptions);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};

