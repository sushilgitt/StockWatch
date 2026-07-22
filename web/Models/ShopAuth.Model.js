import mongoose from "mongoose";

// Stores the OFFLINE-token refresh_token per shop. The Shopify Session object
// has no native refresh_token field and the session-storage adapter only
// serializes standard Session properties, so we keep the refresh token here.
// The webhook path uses it to mint a fresh access token when the stored one
// expires (Shopify's grant_type=refresh_token needs no user session token).
// NOTE: Shopify rotates the refresh_token on every refresh, so this row must be
// updated on each successful token exchange AND each refresh.
const ShopAuthSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true, unique: true, index: true },
    refreshToken: { type: String, required: true },
    accessTokenExpires: { type: Date },
    refreshTokenExpires: { type: Date },
  },
  { timestamps: true }
);

const ShopAuthModel = mongoose.model("ShopAuth", ShopAuthSchema);

export default ShopAuthModel;
