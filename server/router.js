"use strict";
const Router = require('koa-router');
const json = require('koa-json');
const serve = require('koa-static');

const router = new Router();

router.use(json({
  pretty: process.env.NODE_ENV != 'production'
}));

router.get('/', async function (ctx) {
    ctx.body = "hello world";
    console.log("success")
});

router.get('/path', async function (ctx) {
    // You can use `await` in here
    ctx.body = "hello bitch";
    console.log("success")
});
//
// router.get('/coffee/:coordinates', require('./coffee'));
// router.get('/sights/:coordinates', require('./sights'));
// router.get('/cards/:origin', require('./cards'));
// router.get('/card/:origin/:destination/:week', require('./card'));
// router.get('/my_weekend/:origin/:destination/:week', require('./weekend'));

module.exports = router;
