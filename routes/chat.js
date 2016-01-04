var express = require('express'),
	router = express.Router();

var events = require('events'),
	moment = require('moment'),
	users = [];
	history = [];

router.get('/', function(req, res, next){
	res.render('chat');
});

router.get('/users', function(req, res, next){
	res.send(users);
});

router.post('/users/:user', function(req, res, next){
	var workflow = new events.EventEmitter(),
		clients = req.app.clients;
		user = req.params.user;

	workflow.outcome = {
		success: false,
		errfor: {},
		user: ''
	};

	workflow.on('validation', function(){
		if(!user) {
			workflow.outcome.errfor = 'no username?';
			workflow.emit('response');
		}

		workflow.emit('boradcast');
	});

	workflow.on('boardcast', function(){
		console.log(req.params.user + ' is coming in!');

		workflow.outcome.success = true;
		workflow.outcome.user = user;
		users.push(user);

		clients.forEach(function(client){
			clients.sendUTF(JSON.stringify(users));
		});

		workflow.emit('response');
	});

	workflow.on('response', function(){
		res.send(workflow.outcome);
	});

	workflow.emit('validation');
});

router.get('/start', function(req, res, next) {
  var workflow = new events.EventEmitter();  

  workflow.outcome = {
      success: false,
      errfor: {},
      message: {}
  };

  workflow.on('start', function() {
    console.log('start');

    workflow.outcome.success = true;
    workflow.outcome.message.data = history;

    workflow.emit('response');
  });

  workflow.on('response', function() {
//    console.log(workflow.outcome.message);
    res.send(workflow.outcome.message);
  });
  
  workflow.emit('start');
});

router.post('/send/:user/:message', function(req, res, next){
	var workflow = new events.EventEmitter(),
		clients = req.app.clients,
		user = req.params.user,
		msg = req.params.message,
		obj = {},
		milliseconds = new moment().format('HH:mm');

	workflow.outcome = {
		success: false,
		errfor: {},
		message: {}
	};

	workflow.on('validation', function(){
		if(!msg){
			workflow.outcome.errfor = "message doesn't exist!";
			workflow.emit('response');
		} else {
			workflow.emit('broadcast');
		}
	});

	workflow.on('broadcast', function(){
		console.log('Ready to broadcast "' + msg + '"');
		
		workflow.outcome.success = true;

		obj.message = msg;
		obj.timestamp = milliseconds;
		history.unshift(obj);

		clients.forEach(function(client){
			client.sendUTF(JSON.stringify(history));
		});

		workflow.emit('response');
	});

	workflow.on('response', function(){
		res.send(workflow.outcome);
	});

	workflow.emit('validation');
});

module.exports = router;