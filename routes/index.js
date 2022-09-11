module.exports = (app, wagner) => {
	app.get('/', (req, res, next)=> {
	  res.send("Snap-App Apis");
	});
	const users  = require('./users')(app, wagner);
	app.use('/users', users);
}