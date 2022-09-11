module.exports = function(wagner) {
  wagner.factory('MailHelper', function() {
    var MailHelper = require('./mailHelper');
    return new MailHelper(wagner);
  });  
  wagner.factory('SmsHelper', function() {
    var SmsHelper = require('./smsHelper');
    return new SmsHelper(wagner);
  });  
};
