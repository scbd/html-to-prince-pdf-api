const _ = require('lodash');
const express = require('express');
const renderer = require('./renderer');

function createRouter() {

  const router = express.Router();

  router.post ('/api/render',        validate,  renderer.renderPdf);

  return router;

  function validate(req, res, next){

    next();

  }
}

module.exports = createRouter;
