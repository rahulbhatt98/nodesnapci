var messagebird = require('messagebird')('RMEkWk9mI7WapsskcEykkY1jl');

class smsHelper {

    constructor(wagner) {
    }

    sendSms (recipients,otp) {
        return new Promise(async (resolve, reject)=>{
        	try{
                var params = {
                    'originator': 'SnapAp',
                    'recipients': recipients,
                    'body': 'Hello OTP for Verification Snap-App Account '+otp
                  };
              
                  messagebird.messages.create(params, function (err, response) {
                    if (err) {
                      return console.log(err);
                    }
                    resolve(1)
                  });
    		} catch(error){
                console.log(error);
                reject(error);
    		}	
        })           
    }      
}

module.exports = smsHelper;