import shopify from "../shopify.js";

// Run an Admin GraphQL query using res.locals.shopify.session. If Shopify
// rejects the token with 401 (e.g. the cached offline token was revoked
// out-of-band), re-exchange a fresh offline token via the reexchange() helper
// the auth middleware attached to res.locals, then retry once.
export const adminGraphqlQuery = async (res, data) => {
  const run = () => {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
    return client.query({ data });
  };

  try {
    return await run();
  } catch (e) {
    const code = e?.response?.code;
    if (code === 401 && typeof res.locals.shopify?.reexchange === "function") {
      await res.locals.shopify.reexchange();
      return await run();
    }
    throw e;
  }
};
