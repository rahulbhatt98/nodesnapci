module.exports = function(wagner) {
    
  wagner.factory('auth', function() {
    var auth = require('./AuthMiddleware.js');
    return new auth(wagner) ;
  });
  
};