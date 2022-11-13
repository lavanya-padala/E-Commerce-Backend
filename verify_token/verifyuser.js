const jwt=require("jsonwebtoken")
module.exports=async function(req,res,next){
    const token= await req.header("auth-token");
    if(!token) return res.status(401).send("AccessDenied");
    try{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        console.log(verified)
        req.user_id = verified._id;
        next();
    }catch(err){
        res.status(400).send("Invalid token")
    }
}