'use strict';

var express       = require('express');
var bodyParser    = require('body-parser');
var cors          = require('cors');
const helmet      = require('helmet');
const MongoClient = require('mongodb').MongoClient;

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

app.use(helmet({
  hsts: {force: true},
  contentSecurityPolicy: {directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'https://hyperdev.com/'],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }},
  hidePoweredBy: {setTo: 'PHP 4.2.0'}
}))

MongoClient.connect(process.env.DB, {useUnifiedTopology: true}, function(err, client) {
  
  app.use('/public', express.static(process.cwd() + '/public'));

  app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
  });
  
  //Routing for API 
  apiRoutes(app, client.db('personal_library')); 

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
});



//For FCC testing purposes
fccTestingRoutes(app);



//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
