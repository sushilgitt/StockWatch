import mongoose from "mongoose";

const StoreSchema= new mongoose.Schema({
    storeName:{
        type:String,
        required:true
    },
    domain:{
        type:String,
        required:true
    },
    country:{
        type:String,
        
    },
    Store_Id:{
        type:String,
        required:true
    },
    
},{timestamps:true})

const StoreModel= mongoose.model("Store",StoreSchema)

export default StoreModel