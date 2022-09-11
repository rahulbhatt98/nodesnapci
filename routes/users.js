var express = require('express');
var router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const HTTPStatus = require("http-status");
const mongoose = require('mongoose');

module.exports = (app, wagner) => {
  let authMiddleware = wagner.get("auth");

  router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });

  router.post('/register', [
    check('email_phone').not().isEmpty().withMessage("Email Id or Phone Number is required."),
    check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}$/).withMessage('Password must be atleast 8 characters and should contain at least one letter, one number and one special character')
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      let conds = {$or:[{ email : (req.body.email_phone).toLowerCase() }, { phone_number : req.body.email_phone }]};
      let userData = await wagner.get('user_manager').find(conds);
      if(userData){
        res.status(409).json({ success: '1', message: "Email or Phone Number already exists.", data: '' });
      }else{
        let encryptedPass = await bcrypt.hashSync(req.body.password, salt);
        let request;
        var otp = Math.floor(1000 + Math.random() * 9000);
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (req.body.email_phone.match(regexEmail)) {
          request = {
            "email" : req.body.email_phone,
            "password" : encryptedPass,
            "username" : req.body.username ? req.body.username : ""
          }
          let sendVerificationMail = await wagner.get('user_manager').sendOtpMail(request, otp);
        } else {
          request = {
            "phone_number" : (req.body.email_phone).toLowerCase(),
            "password" : encryptedPass,
            "username" : req.body.username ? req.body.username : ""
          }
          //let sendVerificationMsg = await wagner.get('SmsHelper').sendSms(['+919988941581'], "9872");
        }
        let insert = await wagner.get('user_manager').insert(request);
        request.user_id = insert._id
        let insertOtp = await wagner.get('user_manager').insertOtp({otp:otp, user_id:insert._id});
        let token = await wagner.get('auth')["generateShortAccessToken"](request,res);
        res.status(HTTPStatus.OK).json({ success: '1', message: "Verification Otp sent.", data: {"token":token, user_id : insert._id, userData : request }});
      }         
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });

  router.post('/login', [      
    check('email_phone').not().isEmpty().withMessage("Email Id or Phone Number is required."),
    check('password').not().isEmpty().withMessage("Password is required").bail(),
    check('device_type').not().isEmpty().withMessage("Device Type is required").bail()
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          console.log(errors);
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      let conds = {$or:[{ email : (req.body.email_phone).toLowerCase() }, { phone_number : req.body.email_phone }], role_id:2};
      let userData = await wagner.get('user_manager').find(conds);
      if(userData){
        if(userData.status == 1){
          if( (bcrypt.compareSync( req.body.password, userData.password ) ) ){
            let jsonData = {
              '_id': userData._id,
              'username': userData.username ? userData.username : "",
              'email': userData.email ? userData.email : "",
              'phone_number': userData.phone_number ? userData.phone_number : ""             
            }
            let token = await wagner.get('auth')["generateAccessToken"](jsonData,res);
            if(req.body.device_type!=3){
              let device_data = {
                user_id : mongoose.Types.ObjectId( userData._id),
                device_type : req.body.device_type,
                device_id   : req.body.device_id
              }
              let insertDeviceToken = await wagner.get('user_manager').insertDeviceToken(device_data);
            }
            
            res.status(HTTPStatus.OK).json({ success: '1', message: "User Data", data: {token: token, userData : jsonData}}); 
              
          }else{
            res.status(401).json({ success: '1', message: "In-correct login credentials.", data: '' });  
          }
        }else{
          res.status(409).json({ success: '1', message: "User not verified.", data: {user_id : userData._id} }); 
        }    
      }else{
        res.status(400).json({ success: '1', message: "No user found.", data: '' });  
      }        
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });  

  router.post('/socialMediaLogin', [      
    check('social_media_id').not().isEmpty().withMessage("socialMediaId is required."),
    check('social_media_platform').not().isEmpty().withMessage("Social Media Platform is required."),
    check('device_type').not().isEmpty().withMessage("Device Type is required").bail()
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          console.log(errors);
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      let conds = { social_media_id : req.body.social_media_id, social_media_platform : req.body.social_media_platform, status : 1 }
      let findUserData = await wagner.get('user_manager').find(conds);
      let userData = findUserData ? findUserData : await wagner.get('user_manager').insert(conds);
        let jsonData = {
          '_id': userData._id,
          'username': userData.username ? userData.username : "",
          'email': userData.email ? userData.email : "" ,
          'phone_number': userData.phone_number ? userData.phone_number : "",
          "social_media_id" : userData.social_media_id,
          "social_media_platform" : userData.social_media_platform            
        }
        let token = await wagner.get('auth')["generateAccessToken"](jsonData,res);
        if(req.body.device_type!=3){
          let device_data = {
            user_id : mongoose.Types.ObjectId( userData._id),
            device_type : req.body.device_type,
            device_id   : req.body.device_id
          }

          let insertDeviceToken = await wagner.get('user_manager').insertDeviceToken(device_data);
        }
        
        res.status(HTTPStatus.OK).json({ success: '1', message: "User Data", data: token}); 
     
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });
  
  router.post('/otpVerify', [      
    check('user_id').not().isEmpty().withMessage("User Id is required"),
    check('otp').not().isEmpty().withMessage("Otp is required").bail()
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors);
        let lasterr = errors.array().pop();
        lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
        return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      let conds = {user_id : req.body.user_id, otp : req.body.otp};
      let otpFind = await wagner.get('user_manager').findOtp(conds);
      if(otpFind){
        var today = new Date();
        var diff = Math.abs(today - otpFind.createdAt);
        var minutes = Math.floor((diff/1000)/60);
        if(minutes<30){
          let verifyUser = await wagner.get('user_manager').update({"status" : true}, {"_id":req.body.user_id});
          res.status(HTTPStatus.OK).json({ success: '1', message: "User Verified", data: ""}); 
        }else{
          res.status(409).json({ success: '1', message: "Otp Expired.", data: {user_id : req.body.user_id} }); 
        }
      }else{
        res.status(409).json({ success: '1', message: "Incorrect Otp.", data: {user_id : req.body.user_id} });     
      }  
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });    

  router.post('/resendOtp', [
    check('user_id').not().isEmpty().withMessage("User Id is required")
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
        let lasterr = errors.array().pop();
        lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
        return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      var otp = Math.floor(1000 + Math.random() * 9000);
      let conds = { "_id" : req.body.user_id}
      let userData = await wagner.get('user_manager').find(conds);

      if (userData && userData.email) {
        let deleteOtp = await wagner.get('user_manager').deleteOtp({user_id:userData._id});
        let insertOtp = await wagner.get('user_manager').insertOtp({otp:otp, user_id:userData._id});
        request = {
          "email" : userData.email
        }

        let sendVerificationMail = await wagner.get('user_manager').sendOtpMail(request, otp);
        res.status(HTTPStatus.OK).json({ success: '1', message: "OTP sent", data: ""}); 
      } else if(userData && userData.phone_number){
        let deleteOtp = await wagner.get('user_manager').deleteOtp({user_id:userData._id});
        let insertOtp = await wagner.get('user_manager').insertOtp({otp:otp, user_id:userData._id});
        res.status(409).json({ success: '1', message: "Cant send otp to mobile number.", data: otp });  
      // request = {
      //   "phone_number" : req.body.email_phone,
      //   "password" : encryptedPass,
      //   "username" : req.body.username ? req.body.username : ""
      // }
      //let sendVerificationMsg = await wagner.get('SmsHelper').sendSms(['+919988941581'], "9872");
      
      }else{
        res.status(409).json({ success: '1', message: "No email or mobile number attached to account.", data: {user_id : req.body.user_id} }); 
      } 
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });  
  
  router.post('/forgetPass', [
    check('email_phone').not().isEmpty().withMessage("Email Id or Phone Number is required.")
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      var otp = Math.floor(1000 + Math.random() * 9000);
      let conds = {$or:[{ email : (req.body.email_phone).toLowerCase() }, { phone_number : req.body.email_phone }]};
      let userData = await wagner.get('user_manager').find(conds);
      if(userData){
        if (userData.email) {
          let deleteOtp = await wagner.get('user_manager').deleteOtp({user_id:userData._id});
          let insertOtp = await wagner.get('user_manager').insertOtp({otp:otp, user_id:userData._id});
          request = {
            "email" : userData.email
          }
          let sendVerificationMail = await wagner.get('user_manager').sendOtpMail(request, otp);
          res.status(HTTPStatus.OK).json({ success: '1', message: "OTP sent", data: {otp:otp , user_id:userData._id} }); 
        }else{
          let deleteOtp = await wagner.get('user_manager').deleteOtp({user_id:userData._id});
          let insertOtp = await wagner.get('user_manager').insertOtp({otp:otp, user_id:userData._id});
          res.status(409).json({ success: '1', message: "Cant send otp to mobile number.", data: {otp:otp , user_id:userData._id} });  
        }
      }else{
        res.status(400).json({ success: '1', message: "No user found.", data: '' });  
      }  
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });  

  router.post('/changePass', [
    check('user_id').not().isEmpty().withMessage("User Id is required."),
    check('password').not().isEmpty().withMessage("Password is required").bail(),
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      let encryptedPass = await bcrypt.hashSync(req.body.password, salt);
      let update = await wagner.get('user_manager').update({"password" : encryptedPass}, {"_id":req.body.user_id});
      res.status(HTTPStatus.OK).json({ success: '1', message: "Password Changed", data: ""}); 
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });    

  router.get('/userList', authMiddleware["verifyAccessToken"].bind(authMiddleware),  async (req, res, next) => {
    try{
      let sort = {'_id' : JSON.parse(req.query.sort)};
      let users = await wagner.get('user_manager').findAllPaginate({status:true}, sort, req.query.pageNumber, req.query.recordsLimit);
      res.status(HTTPStatus.OK).json({ success: '1', message: "Data.", data: users });            
    }catch(e){
        console.log(e)
        res.status(500).json({ success: '0', message: "failure", data: e });
    } 
}); 
	return router;
}

