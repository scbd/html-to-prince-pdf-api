const _ = require('lodash');
const express = require('express');
const renderer = require('./renderer');

function asyncwrap(fn) { return function (req, res, next) { fn(req, res, next).catch(next); } }

function createRouter() {

  const router = express.Router();

  router.post ('/api/render',        validate, asyncwrap(renderer.renderPdf));

  return router;

  function validate(req, res, next){

    next();

  }
}

module.exports = createRouter;
