import transporter from "./Email.config.js";

const sendThresholdAlert = async (toEmail, productTitle, currentInventory,domain,gid) => {
  try {
    const mailOptions = {
      from: '"StockSentinel" <yohanalberty13@gmail.com>',
      to: toEmail,
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
                <a href="https://admin.shopify.com/store/${domain}/products/${gid}" target="_blank"}" 
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
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Alert email sent to ${toEmail} for product ${productTitle}`);
  } catch (error) {
    console.error("❌ Error sending alert email:", error);
  }
};

export default sendThresholdAlert;
