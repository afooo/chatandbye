var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var chat = require('./routes/chat');
var learn = require('./routes/learn');

var app = express();

mongoose.connect('mongodb://booklog3:123456@ds047622.mongolab.com:47622/booklog3');
mongoose.connection.on('error', function(){
  console.log('error', 'MongoDB: error');
});
mongoose.connection.on('open', function(){
  console.log('info', 'MongoDB: connected');
});

var lessonSchema = new mongoose.Schema({
  lessonName: { type: String, unique: true },
  lessonLearn: { type: String, unique: true },
  lessonUrl: { type: String, unique: true} ,
  timeCreated: { type: Date, default: Date.now } 
});

var Learn = mongoose.model('learn', lessonSchema);

app.db = {
  model: {
    Learn: Learn
  } 
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// running in production environment
if (app.get('env') === 'development') {
  // WebSocket server
  app.locals.serverHost = 'localhost:3000';
} else {
  app.locals.serverHost = 'chatandbye.com';
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'chatchat' }));

app.use('/', routes);
app.use('/chat', chat);
app.use('/users', users);
app.use('/learn', learn);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
