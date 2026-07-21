import { DeliveryMethod } from "@shopify/shopify-api";
import { trackInventoryItem } from "./Controllers/Product.Controller.js";
import shopify from "./shopify.js";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  // Fires whenever a product's available inventory changes at a location (sale,
  // restock, manual edit). Only needs read_inventory — no protected customer
  // data — so it avoids the read_orders/403 issue that orders/create caused.
  INVENTORY_LEVELS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log("🔔 Webhook received:", topic, shop);

      try {
        const data = typeof body === 'string' ? JSON.parse(body) : body;
        console.log("Inventory level data:", JSON.stringify(data, null, 2));

        // Load the OFFLINE session for this shop. Prefer the canonical offline
        // session id over sessions[0], which could be an online (per-user)
        // session with a short-lived token and different scopes.
        const offlineId = shopify.api.session.getOfflineId(shop);
        let session = await shopify.config.sessionStorage.loadSession(offlineId);
        if (!session?.accessToken) {
          const sessions =
            await shopify.config.sessionStorage.findSessionsByShop(shop);
          session =
            sessions?.find((s) => !s.isOnline && s.accessToken) || sessions?.[0];
        }
        if (!session?.accessToken) {
          throw new Error(`No session found for shop: ${shop}`);
        }

        const inventoryItemId = data.inventory_item_id;
        console.log(`Webhooks Id: ${webhookId}, inventory_item_id: ${inventoryItemId}`);

        const resp = await trackInventoryItem(session, inventoryItemId);
        console.log(resp);
      } catch (error) {
        console.error("Webhook processing error:", error);
        throw error;
      }
    },
  }
};
