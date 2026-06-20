import ThresholdModel from "../Models/Threshold.Model.js";

 
export const createOrUpdateThreshold = async (req, res) => {
    try {
        const { thresholdValue, Store_Id, domain, email } = req.body;

        // Validate required fields
        if (!thresholdValue || !Store_Id || !domain || !email) {
            return res.status(400).json({
                success: false,
                message: "All fields (thresholdValue, Store_Id, domain, email) are required"
            });
        }

        // Validate thresholdValue is a positive number
        if (typeof thresholdValue !== 'number' || thresholdValue < 0) {
            return res.status(400).json({
                success: false,
                message: "thresholdValue must be a positive number"
            });
        }

        // Check if threshold already exists for this store
        const existingThreshold = await ThresholdModel.findOne({ Store_Id });

        let result;
        let message;

        if (existingThreshold) {
            // Update existing threshold
            result = await ThresholdModel.findOneAndUpdate(
                { Store_Id },
                { thresholdValue, domain, email },
                { new: true, runValidators: true }
            );
            message = "Threshold updated successfully";
        } else {
            // Create new threshold
            const newThreshold = new ThresholdModel({
                thresholdValue,
                Store_Id,
                domain,
                email
            });
            result = await newThreshold.save();
            message = "Threshold created successfully";
        }

        res.status(200).json({
            success: true,
            message,
            data: result,
            action: existingThreshold ? "updated" : "created"
        });

    } catch (error) {
        console.error("Error creating/updating threshold:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Add this GET endpoint to your routes
export const getThreshold = async (req, res) => {
    try {
        const { storeId } = req.params;

        const threshold = await ThresholdModel.findOne({ Store_Id: storeId });

        if (!threshold) {
            return res.status(404).json({
                success: false,
                message: "Threshold not found for this store"
            });
        }

        res.status(200).json({
            success: true,
            data: threshold
        });

    } catch (error) {
        console.error("Error getting threshold:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};