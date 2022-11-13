const mongoose=require("mongoose");
const sch1=mongoose.Schema({
    name:{
        type:String,
        min:6,
        required:true
    },
    email:{
        type:String,
        min:6,
        required:true
    },
    password:{
        type:String,
        min:6,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    items_in_cart:{
        type:Number,
        default:0
    }
},{collection:"usersdata"})
module.exports=mongoose.model("sch1",sch1)