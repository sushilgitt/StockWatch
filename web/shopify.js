import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";

// Sessions (the OFFLINE access token the inventory webhook needs) are stored in
// MongoDB — the same Atlas cluster the app already uses for its data. The old
// SQLiteSessionStorage wrote to an ephemeral file in the container, so every
// redeploy wiped all sessions and the webhook could no longer authenticate to
// the Admin API (No session found -> no low-stock email). Mongo persists across
// redeploys. The dbName must be passed explicitly; the adapter ignores the DB
// path in the connection string.
const SESSION_DB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:admin@oktopuslab.hgowwqx.mongodb.net/Stock_Sentinel";
const SESSION_DB_NAME = "Stock_Sentinel";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // Persistent, redeploy-safe session storage (see note above).
  sessionStorage: new MongoDBSessionStorage(SESSION_DB_URI, SESSION_DB_NAME),
  // Use token exchange instead of the legacy OAuth code-grant flow. Shopify no
  // longer accepts the non-expiring offline tokens produced by code-grant; token
  // exchange issues expiring offline tokens (requires App Bridge in the frontend,
  // which is already loaded).
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
});

export default shopify;
