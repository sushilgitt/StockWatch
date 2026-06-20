import mongoose from "mongoose";

const dbConn = async () => {
    try {
        await mongoose.connect("mongodb+srv://admin:admin@oktopuslab.hgowwqx.mongodb.net/Stock_Sentinel");
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
};

export default dbConn;