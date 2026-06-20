import shopify from "../shopify.js";

export const getPayment = async (req, res) => {
    try {
        const client = new shopify.api.clients.Graphql({
            session: res.locals.shopify.session
        });
        const data = await client.query({
            data: `{
                        app {
                            installation {
                            id
                            activeSubscriptions {
                                id
                                name
                                status
                                createdAt
                            }
                            }
                        }
                    }
                        `
        });
        return res.status(200).json({
            data: data.body.data.app.installation.activeSubscriptions,
            message: "Payment fetched successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}