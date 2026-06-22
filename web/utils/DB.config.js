import mongoose from "mongoose";

const dbConn = async () => {
    try {
        const uri =
            process.env.MONGODB_URI ||
            "mongodb+srv://admin:admin@oktopuslab.hgowwqx.mongodb.net/Stock_Sentinel";
        await mongoose.connect(uri);
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
};

export default dbConn;