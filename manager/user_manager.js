const bcrypt          = require('bcryptjs');
const config          = require('config')

class user_manager {

    constructor(wagner) {
    	this.User = wagner.get("User");
		this.Otp = wagner.get("Otp")
		this.DeviceId = wagner.get("DeviceId");
		this.MailHelper     = wagner.get('MailHelper')
    }

	find(req){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let user  = await this.User.findOne(req);
		        resolve(user)
	      	} catch(error){
	        	reject(error);
	        }
	    })
	}

	insert(req){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let user  = await this.User.create(req);
		        resolve(user)
	      	} catch(error){
	      		reject(error);
	        }
	    })
	}

	insertOtp(req){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let Otp  = await this.Otp.create(req);
		        resolve(Otp)
	      	} catch(error){
	      		reject(error);
	        }
	    })
	}

	deleteOtp(conds){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let Otp  = await this.Otp.deleteMany(conds);
		        resolve(Otp)
	      	} catch(error){
	      		reject(error);
	        }
	    })
	}

	insertDeviceToken(req){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let device_id  = await this.DeviceId.create(req);
		        resolve(device_id)
	      	} catch(error){
	      		reject(error);
	        }
	    })
	}
  
    update(request, conds){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let user  = await this.User.findByIdAndUpdate(
		        	conds,
					request		        	
		        );
		        resolve(user)
	      	} catch(error){
	        	console.log(error);
	        	reject(error);
	        }
	    })
	}

	sendOtpMail(req,otp){
    	return new Promise(async (resolve, reject)=>{
		    try{
	          const mailOptions = {
	            from: config.get('email.MAIL_USERNAME'),
	            to: req.email,
	            subject: 'Verification Otp.',
	            html: '<b>HI</b><br> <p>Greetings for the day.</p><br> <p>OTP '+otp+'</p> <br>Regards.<br> <p>Team '+config.get('APP_NAME')+'.</p>'
	          };
			  
	          const sendMailfunc = await this.MailHelper.sendMailfunction(mailOptions);
	          resolve(sendMailfunc);

		    }catch(e){
		        console.log(e);
		        reject(e);
		    }
    	})
  	}

	forgetPassword(req){
    	return new Promise(async (resolve, reject)=>{
		    try{
	          const mailOptions = {
	            from: config.get('MAIL_USERNAME'),
	            to: req.email,
	            subject: 'Reset Password Link.',
	            html: '<b>HI</b><br> <p>Greetings for the day.</p><br> <p>Please click Reset Password to reset your password.</p>  <p><a href='+config.get('app_route')+'users/resetPassword/'+ req.id+' <button>Reset Password</button></a></p> <br>Regards.<br> <p>Team '+config.get('site_name')+'.</p>'
	          };
	          const sendMailfunc = await this.Mail.sendMail(mailOptions);
	          resolve(sendMailfunc);

		    }catch(e){
		        console.log(e);
		        reject(e);
		    }
    	})
  	}

	findOtp(req){
		return new Promise(async (resolve, reject)=>{
			try{
			  let user  = await this.Otp.findOne(req);
			  resolve(user)
			} catch(error){
			  reject(error);
		  	}
	  	})
	}  

	async findAllPaginate(conds, sort, pageNumber, numberRecord){
	    return new Promise(async (resolve, reject)=>{
            try{

                let pipeLine = [
                    {
                        $match :  conds
                    },
                    {$sort: sort},
                    {
                        $facet : {
                            page: [{$count: "count"}],
                            User: [
                                
                                {$skip: pageNumber ? parseInt(numberRecord) * (pageNumber - 1):0 },
                                {$limit: parseInt(numberRecord)},
                            ]
                        }
                    },
                    {
                        $project: {
                            count: {$arrayElemAt: ["$page.count", 0]},
                            listing: "$User"
                        }
                    }
                ];
                let user  = await this.User.aggregate(pipeLine);
                resolve({user:user[0].listing, page:Math.ceil(user[0].count / parseInt(numberRecord))})
            } catch(error){
              console.log(error)  
              reject(error);
            }
        }) 
    }
}

module.exports  = user_manager;