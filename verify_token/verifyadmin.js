const jwt=require("jsonwebtoken")
module.exports=async function(req,res,next){
    const token1= await req.header("auth-token");
    if(!token1) return res.status(401).send("AccessDenied");
    try{
        const verified = jwt.verify(token1,process.env.TOKEN_SECRET1);
        console.log(verified)
        req.name = verified.name;
        next();
    }catch(err){
        res.status(400).send("Invalid token")
    }
}