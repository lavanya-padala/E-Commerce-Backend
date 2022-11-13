const express=require("express")
const router=express.Router()
const sch=require("../schema/product")
const sch1=require("../schema/user")
const verify=require("../verify_token/verifyuser")
router.get("/products",verify,(req,res)=>{
    sch.find({},(err,result)=>{
        if (err) return handleError(err)
        res.send(result)
    })
})
router.patch("/:id",async(req,res)=>{
    try{
        const post=await sch1.findByIdAndUpdate(req.params.id,{$inc:{items_in_cart:1}})//$push$increment spread operator
        res.send("Item added to cart")
    }
    catch(err)
    {
        res.send(err.message)
    }
})
module.exports=router