import sendThresholdAlert from "../Middlewares/Email.js";
import ThresholdModel from "../Models/Threshold.Model.js";
import shopify from "../shopify.js";

export const trackProductQuantity = async (session, productId) => {
  try {
    const client = new shopify.api.clients.Graphql({ session });

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

    const data = await client.query({
      data: {
        query,
        variables
      }
    });

    const product = data.body.data.product; // This is an OBJECT
    const totalInventory = product.totalInventory; // This works because product is an object
    const domain = session.shop;
    console.log("Domain:", domain);
    const domainParts = domain.split('.');
    const mainDomain = domainParts[0]; // Extract the main part before .myshopify.com
    // Fetch threshold settings for the store
    const findThreshold = await ThresholdModel.findOne({ domain: domain });
    console.log("Find Threshold:", findThreshold);
    if (findThreshold) {
      const thresholdValue = findThreshold.thresholdValue;
      const email = findThreshold.email;
      console.log(`Total Inventory: ${totalInventory}, Threshold Value: ${thresholdValue}`);
      if (totalInventory <= thresholdValue) {
        await sendThresholdAlert(email, product.title, totalInventory,mainDomain,productGID);
        console.log(`Product ${product.title} is below the threshold. Sending notification to ${email}.`);
      }
    }

    console.log("Product data:", product);

    return { success: true, data: data.body.data.product };
  } catch (error) {
    console.error("GraphQL Error:", JSON.stringify(error.response?.body, null, 2));
    console.error("Error details:", error.message);
    console.log("productId:", productId);
    return { success: false, error };
  }
};