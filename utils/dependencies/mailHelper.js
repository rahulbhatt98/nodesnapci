const config = require('config');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: config.get('email.MAIL_HOST'),
    secure: true,
    //requireTLS: true,
    port: 465,
    auth: {
        user: config.get('email.MAIL_USERNAME'),
        pass: config.get('email.MAIL_PASSWORD')
    },
    // tls: {
    //     ciphers:'SSLv3'
    // }
});


class mailHelper {

    constructor(wagner) {
    }

    sendMailfunction (params) {
        return new Promise(async (resolve, reject)=>{
        	try{
    	        const sendMailfun = await transport.sendMail(params);
                resolve(sendMailfun);	
    		} catch(error){
                console.log(error);
                reject(error);
    		}	
        })           
    }      
}

module.exports = mailHelper;