import sendThresholdAlert from "../Middlewares/Email.js";
import ThresholdModel from "../Models/Threshold.Model.js";
import shopify from "../shopify.js";

// Run an Admin GraphQL query from the webhook path. Unlike /api requests, a
// webhook has no res.locals session and no incoming session token, so it can't
// run a fresh token exchange. If the cached offline token is rejected with 401
// — e.g. it was rotated out-of-band by a concurrent /api request — reload the
// freshest stored offline session and retry once. If there's still no usable
// token, the error propagates: the webhook returns non-2xx and Shopify retries
// delivery later, by which point normal app usage will have refreshed the token.
const webhookGraphql = async (session, data) => {
  const run = (s) =>
    new shopify.api.clients.Graphql({ session: s }).query({ data });
  try {
    return await run(session);
  } catch (error) {
    if (error?.response?.code === 401) {
      const offlineId = shopify.api.session.getOfflineId(session.shop);
      const fresh = await shopify.config.sessionStorage.loadSession(offlineId);
      if (fresh?.accessToken && fresh.accessToken !== session.accessToken) {
        console.warn(
          `[webhook] cached token 401 for ${session.shop}; retrying with reloaded session`
        );
        return await run(fresh);
      }
      console.error(
        `[webhook] cached token 401 for ${session.shop} and no fresher token in storage; letting Shopify retry`
      );
    }
    throw error;
  }
};

// Resolve an inventory item to its product, then run the existing threshold
// check + alert. Used by the inventory_levels/update webhook (read_inventory),
// which avoids the protected-customer-data read_orders scope.
export const trackInventoryItem = async (session, inventoryItemId) => {
  try {
    const inventoryItemGID = `gid://shopify/InventoryItem/${inventoryItemId}`;

    const data = await webhookGraphql(session, {
      query: `
          query GetInventoryItem($id: ID!) {
            inventoryItem(id: $id) {
              id
              variant { id product { id } }
            }
          }
        `,
      variables: { id: inventoryItemGID },
    });

    const productId = data.body.data.inventoryItem?.variant?.product?.id;
    if (!productId) {
      console.log("No product found for inventory item:", inventoryItemId);
      return { success: false, error: "product not found for inventory item" };
    }

    return await trackProductQuantity(session, productId);
  } catch (error) {
    console.error("trackInventoryItem error:", error.message);
    return { success: false, error };
  }
};

export const trackProductQuantity = async (session, productId) => {
  try {
    console.log("Product ID:", productId);
    const productGID = productId.split('/').pop();

    const query = `
      query GetProductById($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          totalInventory
          tracksInventory
          metafields(first: 3) {
            edges {
              node {
                namespace
                key
              }
            }
          }
        }
      }
    `;

    const variables = {
      id: productId
    };

    const data = await webhookGraphql(session, { query, variables });

    const product = data.body.data.product;
    if (!product) {
      // Product was deleted between the webhook firing and this lookup.
      console.log("No product found for id:", productId);
      return { success: false, error: "product not found" };
    }

    const totalInventory = product.totalInventory;
    const domain = session.shop;
    const mainDomain = domain.split('.')[0]; // store handle, before .myshopify.com

    // Guard against false alerts for products that don't track inventory.
    // Shopify reports totalInventory as 0 (or null) for untracked products, and
    // `0 <= threshold` would otherwise fire a bogus "low stock" email. A
    // low-stock alert is only meaningful when inventory is actually tracked.
    if (
      product.tracksInventory === false ||
      totalInventory === null ||
      totalInventory === undefined
    ) {
      console.log(
        `Skipping ${product.title}: inventory not tracked (tracksInventory=${product.tracksInventory}, totalInventory=${totalInventory}).`
      );
      return { success: true, skipped: "inventory-not-tracked", data: product };
    }

    // This store's low-stock threshold + alert email (keyed on the myshopify
    // domain, which matches how the threshold is saved).
    const findThreshold = await ThresholdModel.findOne({ domain });
    if (!findThreshold) {
      console.log(`No threshold configured for ${domain}; nothing to alert.`);
      return { success: true, data: product };
    }

    const { thresholdValue, email } = findThreshold;
    console.log(
      `Total Inventory: ${totalInventory}, Threshold: ${thresholdValue}`
    );

    // Fire the alert whenever the product is at/below the threshold. This one
    // path covers BOTH triggers of inventory_levels/update:
    //   1. a customer purchase that draws the product's stock down, and
    //   2. a merchant manually editing the quantity in Admin → Inventory.
    // Both cases email the merchant, exactly as required.
    if (totalInventory <= thresholdValue) {
      await sendThresholdAlert(
        email,
        product.title,
        totalInventory,
        mainDomain,
        productGID
      );
      console.log(
        `✅ ${product.title} at/below threshold (${totalInventory} <= ${thresholdValue}); alert sent to ${email}.`
      );
    } else {
      console.log(
        `${product.title} above threshold (${totalInventory} > ${thresholdValue}); no alert.`
      );
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("GraphQL Error:", JSON.stringify(error.response?.body, null, 2));
    console.error("Error details:", error.message);
    console.log("productId:", productId);
    return { success: false, error };
  }
};