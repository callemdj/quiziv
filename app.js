var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override')
var session = require('express-session');
var ejs = require('ejs');
var moment = require('moment');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/quiz.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

var shortDateFormat = "DD-MM-gggg ";
var shortDateFormat2 = "HH:mm"// this is just an example of storing a date format once so you can change it in one place and have it propagate
app.locals.moment = moment; // this makes moment available as a variable in every EJS page
app.locals.shortDateFormat = shortDateFormat;
app.locals.shortDateFormat2 = shortDateFormat2;
/*app.locals.fromNow = function(date){
  return moment(date).fromNow();
}*/
//Middleware para expiración de sesiones
app.use(function(req, res, next) {
    if (req.session.user) {
        // Date.now():nos da la hora actual
        if (Date.now() - req.session.user.lastTimeAction > 2*60*1000) {// 2*60*1000 = 2 minutos
            //si han pasado más de dos minutos desde la última acción borramos la sesión
            delete req.session.user;
        } else {
            //si no han pasado dos minutos desde la última acción le damos el valor de la hora actual a la última acción.
            req.session.user.lastTimeAction = Date.now();
        }
    }
next();
});
// Helpers dinámicos:
app.use(function(req, res, next){

  // guardar path en session.redir para después de login
  if (!req.path.match(/\/login|\/logout/)){
    req.session.redir = req.path;
  }

  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

app.use('/', routes);

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
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
