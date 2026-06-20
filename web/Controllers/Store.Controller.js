import shopify from "../shopify.js";
import StoreModel from "../Models/Store.Model.js";

export const getShop = async (req, res) => {
    try {
        const Store = await shopify.api.rest.Shop.all({
            session: res.locals.shopify.session,
        });
        if (Store && Store.data && Store.data.length > 0) {
            const storeName = Store.data[0].name;
            const domain = Store.data[0].domain;
            const country = Store.data[0].country;
            const Store_Id = Store.data[0].id;

            // Check if storeName exists in the database
            let existingStore = await StoreModel.findOne({ storeName });

            if (!existingStore) {
                // If it doesn't exist, save it
                const newStore = new StoreModel({
                    storeName,
                    domain,
                    country,
                    Store_Id,
                });
                await newStore.save();
                existingStore = newStore;
            }

            // Send response with existingStore only
            return res.status(200).json(existingStore); // Send existingStore directly in the response
        } else {
            return res.status(404).json({ message: "Store not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};