let jwt             = require('jsonwebtoken');
const config        = require('config');
const token_config  = config.get('JWT');
const HTTPStatus    = require('http-status');

class AuthMiddleware  {

    constructor(wagner){
    };
 
    generateAccessToken(req,res){
        return new Promise(async ( resolve,reject)=>{
            console.log(req)
            jwt.sign( req, token_config.SECRET, { expiresIn: token_config.TOKENTIME  },
            function(err, token) {
                if(err){
                console.log(err)
                reject(err)
                } else {
                resolve(token);
                }
            });
        })
    }

    generateShortAccessToken(req,res){
        return new Promise(async ( resolve,reject)=>{
            jwt.sign({ "id":  req.user_id }, token_config.SECRET, { expiresIn: 6000 },
            function(err, token) {
                if(err){
                console.log(err)
                reject(err)
                } else {
                resolve(token);
                }
            });
        })
    }

    verifyActivationToken(req,res){
        return new Promise(( resolve,reject)=>{
            if(req.headers.authorization){
                let token = req.headers.authorization.split(" ");
                jwt.verify(token[1], token_config.SECRET, function(err, decoded) {
                    if(err){
                        console.log(err)
                        if(err.name == 'TokenExpiredError'){
                            resolve({ success: 0, message: "Token expired!" });
                        }else{
                            resolve({ success: 0, message: "Invalid token!" });
                        }
                    }else{
                        // next();
                        console.log(decoded.id);
                        resolve({ success: 1, id : decoded.id })
                    }
                });
            }else{
                res.status(403).json({ success: '0',  message: "failure" ,data:{ "message": "Token Missing!"} });
            }
        });  
    }

    verifyAccessToken (req,res,next){
        console.log(req.headers.authorization);
        if(req.headers.authorization){
            let token = req.headers.authorization.split(" ");

            jwt.verify(token[1],token_config.SECRET, (err, decoded)=> {            
                if(err){
                    if(err.name == 'TokenExpiredError'){
                        res.status(406).json({ success: '0',  message: "failure" , data :{"message": "Token expired!"} });
                    } else {
                        res.status(403).json({ success: '0',  message: "failure" ,data:{ "message": "Invalid token!"} });
                    }
                }else{
                    req.user_id = decoded._id;
                    next();
                    //res.status(200).json({ success: '1',  message: "Token varified." ,data:""});
                }
            });
        }else{
            res.status(403).json({ success: '0',  message: "failure" ,data:{ "message": "Token Missing!"} });
        }    
    }

    verifyShortToken (req,res,next){

        jwt.verify(req.params.id,token_config.SECRET, (err, decoded)=> {
            if(err){
                if(err.name == 'TokenExpiredError'){
                    res.status(406).json({ success: '0',  message: "failure" , data :{"message": "Token expired!"} });
                } else {
                    res.status(403).json({ success: '0',  message: "failure" ,data:{ "message": "Invalid token!"} });
                }
            }else{
                req.user_id = decoded.id;
                next();
            }
        });
    }

    verifyToken (req,res,next){
        jwt.verify(req.headers.authtoken,token_config.SECRET, (err, decoded)=> {            
            if(err){
                if(err.name == 'TokenExpiredError'){
                    res.status(406).json({ success: '0',  message: "failure" , data :{"message": "Token expired!"} });
                } else {
                    res.status(403).json({ success: '0',  message: "failure" ,data:{ "message": "Invalid token!"} });
                }
            }else{
                req.user_id = decoded.id;
                //res.status(200).json({ success: '1',  message: "Token varified." ,data:""});
            }
        });
    }
}    

module.exports = AuthMiddleware;