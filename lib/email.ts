import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendBookingConfirmation({
  to,
  bookingNumber,
  serviceName,
  startTime,
  endTime,
}: {
  to: string;
  bookingNumber: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0A1A33;">Booking Confirmation</h2>
      <p>Thank you for booking a consultation. Your booking details are below:</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Number:</strong> ${bookingNumber}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date & Time:</strong> ${startTime.toLocaleString()} - ${endTime.toLocaleString()}</p>
      </div>
      <p>We will contact you shortly to confirm your appointment.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Booking Confirmation - ${bookingNumber}`,
    html,
  });
}

export async function sendOrderConfirmation({
  to,
  orderNumber,
  items,
  total,
}: {
  to: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}) {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>KSh ${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0A1A33;">Order Confirmation</h2>
      <p>Thank you for your order. Your order details are below:</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="border-bottom: 2px solid #E5E7EB;">
              <th style="text-align: left; padding: 10px;">Item</th>
              <th style="text-align: center; padding: 10px;">Qty</th>
              <th style="text-align: right; padding: 10px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p style="text-align: right; margin-top: 15px; font-weight: bold;">
          Total: KSh ${total.toFixed(2)}
        </p>
      </div>
      <p>Your order will be processed shortly.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
  });
}

