
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , apievent = require('./routes/api/event')
  , apireview = require('./routes/api/review')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Setup database
var mongoConnectString = process.env.MONGO_CONNECT_STRING;
var mongoose = require('mongoose');
mongoose.connect(mongoConnectString);

// Application Endpoints
app.get('/', routes.index);

// API Endpoints
app.get('/api/events', apievent.list);
app.get('/api/events/:eventId', apievent.event);
app.get('/api/reviews', apireview.list);
app.post('/api/reviews', apireview.saveReview);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
