const jwt = require('jsonwebtoken');
const BlacklistModel = require('../models/Blacklist.model')

const auth = async(req,res,next) => {
    
        
       let token = req.headers.authorization.split(' ')[1];
       if(token){
         const blacklisted = await BlacklistModel.findOne({"token":token});
         
         if(blacklisted){
         return res.send('You are blacklisted');
         }
       }
        console.log(token);
        jwt.verify(token, "masai", (err,decoded) => {
            if(err){
                console.log(err,'xyz');
                return res.status(401).send({message: "Unauthorized"});
            }else{
                req.user = decoded;
                next();
            }
        } )
    
}

module.exports = auth;