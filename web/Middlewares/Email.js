import transporter from "./Email.config.js";

// Builds the alert email content (shared by both transports).
const buildContent = (productTitle, currentInventory, domain, gid) => ({
  subject: `⚠️ Inventory Alert: ${productTitle}`,
  text: `The current inventory for ${productTitle} is ${currentInventory}.`,
  html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9fb; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">

            <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Inventory Alert 🚨</h2>
            </div>

            <div style="padding: 20px; color: #333;">
              <p style="font-size: 16px;">Hello,</p>
              <p style="font-size: 16px;">
                The inventory for <strong style="color:#6a11cb;">${productTitle}</strong>
                has dropped to <strong style="color:#e63946;">${currentInventory}</strong>.
              </p>

              <div style="margin: 20px 0; text-align: center;">
                <a href="https://admin.shopify.com/store/${domain}/products/${gid}" target="_blank"
                   style="background: #2575fc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  View Product in Shopify
                </a>
              </div>

              <p style="font-size: 14px; color: #555;">We recommend restocking soon to avoid missed sales.</p>
            </div>

            <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              © ${new Date().getFullYear()} StockSentinel | Inventory Monitoring System
            </div>
          </div>
        </div>
      `,
});

// Send via Brevo's transactional HTTP API. Unlike Gmail SMTP, this can send to
// ANY recipient (with a verified sender, no domain required) and has no SMTP
// handshake per send, so it's faster. The sender MUST be a verified Brevo sender
// (defaults to EMAIL_USER, which is the verified address).
const sendViaBrevo = async (toEmail, { subject, text, html }) => {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
  const senderName = process.env.BREVO_SENDER_NAME || "StockWatch";

  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    // Throw so the caller surfaces the failure (no silent swallow).
    throw new Error(`Brevo send failed (${resp.status}): ${errText.slice(0, 400)}`);
  }

  const data = await resp.json().catch(() => ({}));
  console.log(`✅ [Brevo] alert sent to ${toEmail} (messageId=${data.messageId})`);
  return data;
};

// Fallback transport: Gmail via nodemailer (the original path).
const sendViaGmail = async (toEmail, { subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"StockWatch" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(
    `✅ [Gmail] alert sent to ${toEmail} for product (id=${info.messageId})`
  );
  return info;
};

// Sends the low-stock alert. Uses Brevo when BREVO_API_KEY is set, otherwise
// falls back to Gmail — a zero-downtime, reversible switch. Either transport
// THROWS on failure so the caller knows the alert did not go out.
const sendThresholdAlert = async (
  toEmail,
  productTitle,
  currentInventory,
  domain,
  gid
) => {
  const content = buildContent(productTitle, currentInventory, domain, gid);
  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo(toEmail, content);
  }
  return sendViaGmail(toEmail, content);
};

export default sendThresholdAlert;
