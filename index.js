const express=require("express")
const port=9999
const nodemailer=require("nodemailer")
const path=require("path")
const url="https://shielded-fjord-56153.herokuapp.com/"
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const bodyParser=require("body-parser")
const bcryptjs=require("bcryptjs")
const jwt=require("jsonwebtoken")
const adminroute=require("./routes/admin")
const {registervalidation,loginvalidation}=require("./validation")
const app=express()
const sch1=require("./schema/user")
const router = require("./routes/admin")
const userroute=require("./routes/user")
//const { id } = require("@hapi/joi/lib/base")
app.listen(process.env.PORT||port,()=>{console.log("listening")})
app.set("view engine","ejs")
dotenv.config()
mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser:true},()=>{console.log("connected to db")})
app.use(bodyParser.json())
app.use(express.urlencoded({extended:false}))
router.use(bodyParser.json())
//routes
app.use("/admin",adminroute)
app.use("/user",userroute)
app.get("/",(req,res)=>res.send("Hello"))
//Register
app.post("/register",async(req,res)=>{
    const{error}=registervalidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    //checking if email already existed in database
    const emailExist=await sch1.findOne({email:req.body.email});
    if(emailExist) return res.status(400).send("Email already exists");
    //hash passwords
    const salt=await bcryptjs.genSalt(10);
    const hashPassword=await bcryptjs.hash(req.body.password,salt);
    const user=new sch1({
        name:req.body.name,
        email:req.body.email,
        password:hashPassword//req.body.password
    });
    try{
        await user.save();
        res.send({user:user._id})
        //res.send(user)
    }
    catch(err){
        res.send(err.message)
    }
})
//Login
app.post("/login",async(req,res)=>{
    if(req.body.name==process.env.ADMIN_NAME && req.body.password==process.env.ADMIN_PASSWORD){
        const token1=jwt.sign(process.env.ADMIN_NAME,process.env.TOKEN_SECRET1)
        res.header("auth-token",token1).send(token1)
    }
    else{
        const{error}=loginvalidation(req.body)
        if(error) return res.status(400).send(error.details[0].message)
        //checking if the email exists
        const user=await sch1.findOne({email:req.body.email});
        if(!user) return res.status(400).send("Email is not found");
        //validating oassword
        const validPass=await bcryptjs.compare(req.body.password,user.password);
        if(!validPass) return res.status(400).send("Invalid password");
        //create and assign a token
        const token=jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
        res.header("auth-token",token).send(token);
    }
    //res.send("Logged in");
    }
)
app.post("/forgot-password",async(req,res)=>{
    email1=req.body.email;
    try{
        const isuser=await sch1.findOne({email:email1})
        if(!isuser){
            return res.send("User not exists!")
        }
        const secret=process.env.TOKEN_SECRET+isuser.password
        const token=jwt.sign({email:isuser.email,id:isuser._id},secret,{expiresIn:"5m"})
        //const link=`http://localhost:9999/reset-password/${isuser._id}/${token}`
        const link=`${url}reset-password/${isuser._id}/${token}`
        //res.send(link)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'lavanyapadala666@gmail.com',
              pass: 'mptkmgeoydgbinsc'
            }
          });
          
          var mailOptions = {
            from: 'lavanyapadala666@gmail.com',
            to: isuser.email,
            subject: 'Sending Email using Node.js',
            text: link
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              res.send('Email sent: ' + info.response);
            }
          });
    }
    catch(err){
        res.send(err)
    }
})
app.get("/reset-password/:id/:token",async(req,res)=>{
    const{id,token}=req.params
    console.log(req.params)
    const isuser=await sch1.findOne({_id:id})
    if(!isuser){
        return res.send("User not exist!")
    }
    const secret=process.env.TOKEN_SECRET+isuser.password
    try{
        const verify=jwt.verify(token,secret)
        console.log("verified")
        res.sendFile(path.join(__dirname,"/files","/index.html"))
        //res.render("index",{email:verify.email})
    }
    catch(error){
        res.send("Not verified")
        console.log(error)
    }
})
app.post("/reset-passwod/:id/:token",async(req,res)=>{
    const{id,token}=req.params
    const {password}=req.body
    // console.log(req.params)
    const isuser=await sch1.findOne({_id:id})
    if(!isuser){
        return res.send("User not exist!")
    }
    const secret=process.env.TOKEN_SECRET+isuser.password
    try{
        const verify=jwt.verify(token,secret)
        //console.log("verified")
        //const salt=await bcryptjs.genSalt(10);
        const hashPassword=await bcryptjs.hash(password,10);
        await sch1.updateOne({_id:id},{$set:{password:hashPassword}})
        res.json({status:"Password updated"})
        console.log("updated")
        // res.sendFile(path.join(__dirname,"/files","/index.html"))
    }
    catch(error){
        //console.log(error)
        res.send(error)
        //res.json({status:"Not verified"})
    }
})
