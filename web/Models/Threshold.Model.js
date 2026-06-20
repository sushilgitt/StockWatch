import mongoose from "mongoose";

const ThresholdSchema= new mongoose.Schema({
    thresholdValue:{
        type:Number,
        required:true
    },
    Store_Id:{
        type:String,
        required:true
    },
    domain:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
},{timestamps:true})

const ThresholdModel= mongoose.model("Threshold",ThresholdSchema)

export default ThresholdModel