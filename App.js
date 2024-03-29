const express = require('express');
const cfg = require('./config.js')
// const {connection} = require('./src/modules/DBConnection')
const upload = require('express-fileupload')
const bodyParser = require('body-parser');
const router = require('./routes')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDocs = require('swagger-jsdoc')
const cors = require("cors");

const passport = require('passport');
require('./src/modules/Passport');

const app = express()
//set the cors oringin for the working route 
app.use(cors({origin: '*'})); 
// setupping the express  & passport stuff
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// for statc element like files or static pages
//retrieving file from the client use this system
app.use(express.static(__dirname + '/public'))

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(upload());
app.use(passport.initialize());
app.use("/", router);


const options = {
  definition:{
    openapi:"3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "Solarity API Library"
    },
    servers: [{
      url:"http://localhost:3001"
    }],
  },
  apis:["routes.js"]
}

const specs = swaggerJsDocs(options)

//http://localhost:3001/api-docs/
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(cfg.port,() =>{
  console.log(`listening on ${cfg.port} `);
  console.log(`http://localhost:${cfg.port}/`)

})

