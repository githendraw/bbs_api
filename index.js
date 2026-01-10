const express = require('express');
const bodyParser = require('body-parser');
const pe = require('parse-error');
const cors = require('cors');
const app = express();
const CONFIG = require('./config/config');
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname + '..', 'files')));
app.use('/files', express.static(path.join(__dirname, '../files')));
app.set('views', __dirname + '/views');
const models = require("./models");
const roles = require('./utils/roles');
models.sequelize.authenticate().then(() => {
}).catch(err => {
    console.error('Unable to connect to SQL database:', CONFIG.db_name, err);
});
if (CONFIG.app === 'dev') {
    models.sequelize.sync({
        alter: true,
        force: false
    }).then(() => {
      let r=roles.rolesToArray();
    //   models.Role.bulkCreate(r, {
    //     updateOnDuplicate: [
    //     "name"
    //     ],
    // })
  //   let s = roles.permissionToArray();
  //   models.Permission.bulkCreate(s, {
  //     updateOnDuplicate: [
  //     "name"
  //     ],
  // })
    }, (error) => {
      console.log(error);
    });
};
// check default data;
// CORS
app.use(cors());
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,etoken');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,FETCH,PATCH,POST,DELETE,OPTIONS');
  if (req.method == 'OPTIONS') {
      res.status(200).end();
  } else {
      next();
  }
});
const io = require('socket.io')({cors: {origin: "*"}});
const jwt = require('jsonwebtoken');
const routes = require('./routes/global');
const routesSA = require('./routes/sa');
const routesHO = require('./routes/ho');
const socket_io = require('./middleware/socket_io');
app.use('/', routes);
app.use('/sa', routesSA);
app.use('/ho',routesHO)

app.use( (req, res, next) =>{
  var err = new Error('Not Found');
  err.status = 404;
  res.statusCode = 404; //send the appropriate status code
  return res.json({
      status: "Gagal",
      message: " Tidak di temukan "
  })
  // next(err);
});
io.use((socket,next)=>{
if (socket.handshake.query && socket.handshake.query.token){
  jwt.verify(socket.handshake.query.token, CONFIG.public_key, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.decoded = decoded;
    next();
  });
}
else {
  next(new Error('Authentication error'));
}
}).on('connection', socket_io);


const date =  new Date().getFullYear().toString().substring(2,4);

module.exports.app = app;
module.exports.io=io;
process.on('unhandledRejection', error => {console.error('Uncaught Error', pe(error));});