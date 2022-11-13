const bodyParser = require("body-parser")
const express=require("express")
const router=express.Router()
const sch=require("../schema/product")
//const bodyParser=require("body-parser")
const verify=require("../verify_token/verifyadmin")
//app.use(bodyParser.json())
router.post("/add",verify,async(req,res)=>{
    const prod=new sch({
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
        warranty:req.body.warranty,
        total:req.body.total
    })
    try{
        await prod.save();
        res.send("product added")
        //res.send(user)
    }
    catch(err){
        res.send(err.message)
    }
})
router.get("/products",(req,res)=>{
    sch.find({},(err,result)=>{
        if (err) return handleError(err)
        res.send(result)
    })
})
router.patch("/:id",async(req,res)=>{
    try{
        const post=await sch.findByIdAndUpdate(req.params.id,{$set:req.body})//$push$increment spread operator
        res.send("Changes added")
    }
    catch(err)
    {
        res.send(err.message)
    }
})
router.delete("/:id",async(req,res)=>{
    try{
    await sch.deleteOne({_id:req.params.id})
    res.send("Product deleted")
    }
    catch(err)
    {
        res.send(err.message)
    }
})

module.exports=router
