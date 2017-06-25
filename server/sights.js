"use strict";
const request = require('request-promise');
const CLIENT_ID = '1W3ZIOI2VB0JLDIWEHAVJNYCM5IBTG4NHVWKDA0DXTVH4HK0';
const SECRET = 'NRABXKV3MDQMI24QTW1HEUNBS3EJYT2PM0TVCE5JWSUBIIFY';

async function sights(ctx) {
  const coordinates = ctx.params.coordinates;

  const options = {
    uri: 'https://api.foursquare.com/v2/venues/explore',
    headers: {
        'User-Agent': 'Request-Promise'
    },
    qs: {
      v: '20161016',
      ll: ctx.params.coordinates || '7.7906745,98.3280012',
      section: 'sights',
      query: 'tourist',
      radius: 6000,
      client_id: CLIENT_ID,
      client_secret: SECRET,
      limit: 7
    }
  };

  let response = await request(options);

  const info = JSON.parse(response);
  ctx.body = info;
}

module.exports = sights;
