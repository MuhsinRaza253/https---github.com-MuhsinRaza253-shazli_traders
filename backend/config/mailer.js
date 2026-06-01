const nodemailer = require('nodemailer');

// Build a transporter from env. Returns null if email isn't configured, so the
// rest of the app keeps working (orders still succeed) without SMTP set up.
let cached;
function getTransporter() {
  if (cached !== undefined) return cached;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.warn('✉️  Email not configured (EMAIL_HOST/EMAIL_USER/EMAIL_PASS) — skipping order emails.');
    cached = null;
    return cached;
  }
  const port = Number(EMAIL_PORT) || 587;
  cached = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465, // true for 465, false for 587/STARTTLS
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return cached;
}

const money = n => `PKR ${Number(n || 0).toLocaleString()}`;

function itemsTable(order) {
  const rows = order.orderItems.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` — ${i.color}` : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${money(i.price * i.quantity)}</td>
    </tr>`).join('');
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
      <thead>
        <tr style="background:#f4efe4">
          <th style="padding:8px 12px;text-align:left">Item</th>
          <th style="padding:8px 12px;text-align:center">Qty</th>
          <th style="padding:8px 12px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function shell(title, bodyHtml) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#1a5c3a;color:#fff;padding:20px 24px">
      <div style="font-size:20px;font-weight:700">Shazli Traders</div>
      <div style="font-size:12px;opacity:.8;letter-spacing:.05em">PREMIUM ISLAMIC HEADWEAR</div>
    </div>
    <div style="padding:24px">
      <h2 style="margin:0 0 12px;color:#1a3026">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="background:#faf7f0;color:#8a7f6a;padding:16px 24px;font-size:12px;text-align:center">
      Shazli Traders, Gujranwala · Thank you for your trust.
    </div>
  </div>`;
}

function addressBlock(a) {
  return `${a.name}<br/>${a.street}<br/>${a.city}, ${a.province}${a.postalCode ? ' ' + a.postalCode : ''}<br/>${a.phone}`;
}

const shortId = order => `#${order._id.toString().slice(-6).toUpperCase()}`;
const methodLabel = m => (m === 'cod' ? 'Cash on Delivery' : m === 'online' ? 'Advance / Online Payment' : (m || '').toUpperCase());

// Sends confirmation to the customer and a notification to the admin.
// Never throws — failures are logged so order placement is unaffected.
async function sendOrderEmails(order, customer) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    const from = process.env.EMAIL_FROM || `Shazli Traders <${process.env.EMAIL_USER}>`;
    const adminTo = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const id = shortId(order);

    const summary = `
      ${itemsTable(order)}
      <table style="width:100%;font-size:14px;margin-top:8px">
        <tr><td>Subtotal</td><td style="text-align:right">${money(order.itemsPrice)}</td></tr>
        <tr><td>Delivery</td><td style="text-align:right">${order.shippingPrice ? money(order.shippingPrice) : 'FREE'}</td></tr>
        <tr><td style="font-weight:700;padding-top:6px">Total</td><td style="text-align:right;font-weight:700;color:#1a5c3a;padding-top:6px">${money(order.totalPrice)}</td></tr>
      </table>
      <p style="font-size:14px"><strong>Payment:</strong> ${methodLabel(order.paymentMethod)}</p>
      <p style="font-size:14px"><strong>Delivery address:</strong><br/>${addressBlock(order.shippingAddress)}</p>`;

    const tasks = [];

    if (customer?.email) {
      tasks.push(transporter.sendMail({
        from, to: customer.email,
        subject: `Your Shazli Traders order ${id} is confirmed ✓`,
        html: shell(`Thank you, ${customer.name || 'valued customer'}!`,
          `<p style="font-size:14px">We've received your order <strong>${id}</strong> and will process it shortly.${order.paymentMethod === 'online' ? ' Your payment will be verified before dispatch.' : ''}</p>${summary}`),
      }));
    }

    if (adminTo) {
      tasks.push(transporter.sendMail({
        from, to: adminTo,
        subject: `🛒 New order ${id} — ${money(order.totalPrice)}`,
        html: shell(`New order ${id}`,
          `<p style="font-size:14px"><strong>Customer:</strong> ${customer?.name || '—'} (${customer?.email || '—'}${customer?.phone ? ', ' + customer.phone : ''})</p>${summary}`),
      }));
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error('✉️  Order email error:', err.message);
  }
}

module.exports = { sendOrderEmails };
