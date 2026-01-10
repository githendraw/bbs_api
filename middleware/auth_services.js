const jwt = require("jsonwebtoken");
const { to, ReE, ReS } = require("../utils/response");
const CONFIG = require("../config/config");
const models = require("../models");
const globalVerify = (req, res, next) => {
  let token = req.headers["etoken"];
  if (!token) {
    return ReE(res, "No Token Provided", 403);
  }
  try {
    jwt.verify(token, CONFIG.public_key, (err, decoded) => {
      if (err) {
        return ReE(res, err.message, 401);
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    return ReE(res, err.message, 401);
  }
};

const adminHOVerify = (req, res, next) => {
  let token = req.headers["etoken"];
  if (!token) {
    return ReE(res, "No Token Provided", 403);
  }
  try {
    jwt.verify(token, CONFIG.public_key, (err, decoded) => {
      if (err) {
        return ReE(res, err.message, 401);
      }
      // check auth
      // if (decoded.role!=='superadmin'){
      //   return ReE(res,'Anda tidak berhak ', 401);
      // } 
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    return ReE(res, err.message, 401);
  }
};

 
module.exports = {
  adminHOVerify,
  globalVerify
};
