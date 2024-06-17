const express = require('express');
const UserModel = require('../models/User.model');
const BlacklistModel = require('../models/Blacklist.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRouter = express.Router();
const auth = require('../middleware/authMiddleware')

userRouter.post('/register',async(req,res) => { 
    const {name,email,password,role,age}=req.body
    try{
        bcrypt.hash(password, 8, async (err, hash)=>{
        if(err){
            res.status(404).send("msg: Registration failed, something went wrong")
        }
        else{
            const user = new UserModel({name,email,password:hash,role,age})
            await user.save()
            res.status(200).send("Registered")
        }
        
    });
    }catch(err){
        res.status(404).send(err)
    }
})

userRouter.post('/login', async(req,res) => {
    const{email,password} = req.body;
    try{
        const user = await UserModel.findOne({email});
        if(user){
            bcrypt.compare(password, user.password, function(err, result){
                if(err){
                    res.status(404).send({"msg": "something went wrong"})
                }
                if(result){
                        const accessToken = jwt.sign({email:email,role:user.role}, 'masai',{ expiresIn: '2m' });
                        const refreshToken = jwt.sign({email:email,role:user.role}, 'masaiSchool',{ expiresIn: '1d' });
                        res.status(200).send({"msg":"Login Successfull","accessToken":accessToken, "refreshToken":refreshToken})
                } else {
                        res.status(404).send("Login failed: Incorrect password")
                }
                })
            
        }else{
            res.status(404).send({"msg":"User not found"});
        }
    }catch(err){
        res.status(404).send(err.message);
    }

})

userRouter.get("/logout",(req,res)=>{
    let token = req.headers.authorization.split(' ')[1];
    const blacklistedUser = new BlacklistModel({token});
    blacklistedUser.save();
    res.status(200).send("Logged out successfully");
})

userRouter.post('/token', (req,res) => {
    const {refreshToken} = req.body;
    if(!refreshToken){
        res.status(401).send("Unauthorized");
    }
    jwt.verify(refreshToken,'masaiSchool',(err,user) => {
        if(err){
            res.status(401).send("Unauthorized");
        }
        const accessToken = jwt.sign({email:user.email,role:user.role}, 'masai',{ expiresIn: '2m' });
        res.status(200).send({"acessToken":accessToken})
    })


})
userRouter.get('/data',auth,(req,res) => {
    console.log(req.user);
    res.send("Welcome to protected route")
})

module.exports = userRouter;
