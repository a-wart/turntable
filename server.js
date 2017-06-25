"use strict";

require('colors');
const koa = require('koa');
const logger = require('koa-logger');
const request = require('request-promise');
const serve = require('koa-static');
const router = require('./server/router');
const json = require('koa-json');
const app = new koa();

app
  .use(json())
  .use(serve(__dirname + '/web'))
  .use(router.routes())

const port = process.env.PORT || 8888;
console.log(`Starting server at ` + `http://localhost:${port}`.yellow);

if (!module.parent) app.listen(8888);
