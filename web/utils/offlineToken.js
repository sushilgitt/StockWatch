import { Session } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import ShopAuthModel from "../Models/ShopAuth.Model.js";

// Offline-token helpers shared by the /api token-exchange path (web/index.js)
// and the webhook path (Product.Controller.js). Kept standalone so the webhook
// controller can refresh a token WITHOUT importing index.js (which would create
// an import cycle index.js -> routes -> controllers -> index.js).

// Build a Shopify offline Session object from an OAuth token-grant response body
// (works for both the token-exchange grant and the refresh_token grant).
export const buildOfflineSession = (shop, data) =>
  new Session({
    id: shopify.api.session.getOfflineId(shop),
    shop,
    state: "",
    isOnline: false,
    accessToken: data.access_token,
    scope: data.scope,
    ...(data.expires_in && {
      expires: new Date(Date.now() + data.expires_in * 1000),
    }),
  });

// Persist BOTH the offline session (into the session store) AND the rotating
// refresh_token (into ShopAuth). Call this after EVERY successful token grant or
// refresh — Shopify rotates the refresh_token each time, so missing a write here
// would make the next refresh fail with invalid_grant.
export const persistOfflineToken = async (shop, data) => {
  const session = buildOfflineSession(shop, data);
  await shopify.config.sessionStorage.storeSession(session);

  if (data.refresh_token) {
    await ShopAuthModel.findOneAndUpdate(
      { shop },
      {
        shop,
        refreshToken: data.refresh_token,
        accessTokenExpires: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        refreshTokenExpires: data.refresh_token_expires_in
          ? new Date(Date.now() + data.refresh_token_expires_in * 1000)
          : undefined,
      },
      { upsert: true, new: true }
    );
  }
  return session;
};

// Mint a fresh offline access token using the stored refresh_token. Requires no
// incoming user/session token, so it works from the webhook path where the
// stored offline token has expired. Persists the new (rotated) tokens.
export const refreshOfflineToken = async (shop) => {
  const auth = await ShopAuthModel.findOne({ shop });
  if (!auth?.refreshToken) {
    throw new Error(`[refresh] no stored refresh_token for ${shop}`);
  }

  const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: shopify.api.config.apiKey,
      client_secret: shopify.api.config.apiSecretKey,
      grant_type: "refresh_token",
      refresh_token: auth.refreshToken,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(
      `[refresh] failed (${resp.status}) for ${shop}: ${text.slice(0, 300)}`
    );
  }

  const data = await resp.json();
  console.log(
    `[refresh] OK for ${shop}: hasToken=${!!data.access_token} hasRefresh=${!!data.refresh_token} expires_in=${data.expires_in}`
  );
  return persistOfflineToken(shop, data);
};
