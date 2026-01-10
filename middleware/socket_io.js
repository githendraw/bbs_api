const models = require('../models');
const { to, ReE, ReS } = require("../utils/response");
const {Op} = require('../models/index').Sequelize;
const moment = require('moment');


module.exports=(socket)=>{


    socket.on('message', function(message) {
        io.emit('message', message);
    });
    socket.on('disconnect', () => {
      });
}