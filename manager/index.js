module.exports = function(wagner) {
   	wagner.factory('user_manager', function() {
    	var user_manager = require('./user_manager');
    	return new user_manager(wagner);
  	});
	
}

