'use strict';

var app = require('connect')();
var http = require('http');
var cors = require('cors');
var bodyParser = require('body-parser');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var admin = require("firebase-admin");
var serviceAccount = require("c:/tmp/notes-server.json");
var serverPort = 8080;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://notes-server.firebaseio.com"
});

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Cross-Origin Resource Sharing
	app.use(cors({
    origin: 'http://localhost:8081',
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }));

  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata({
    basePath: '/v2'
  }));

  app.use(middleware.swaggerSecurity({
    OauthSecurity: function(req, def, scopes, callback) {
      admin.auth().verifyIdToken(req.body.loginFirebaseToken)
        .then(function(decodedToken) {
          if(decodedToken.uid == 'xkLPihAPCBcLAVDMOhcUjjOhlYy2') {
            return callback();
          }
          req.res.status(401).json({
            message: "Wrong Authenticate"
          });
          req.res.end();
        }).catch(function(error) {
          req.res.status(401).json({
            message: "Please Authenticate "+error
          });
          req.res.end();
        });
    }
  }))

  // Validate Swagger requests
  app.use(middleware.swaggerValidator({
    validateResponse: true
  }));

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter({
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
  }));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi({
    apiDocs: '/docs',
    swaggerUi: '/swaggerUI'
  }));

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });
});
