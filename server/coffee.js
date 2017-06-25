"use strict";
const request = require('request-promise');
const CLIENT_ID = '1W3ZIOI2VB0JLDIWEHAVJNYCM5IBTG4NHVWKDA0DXTVH4HK0';
const SECRET = 'NRABXKV3MDQMI24QTW1HEUNBS3EJYT2PM0TVCE5JWSUBIIFY';

async function coffee(ctx) {
  const options = {
    uri: 'https://api.foursquare.com/v2/venues/search',
    headers: {
        'User-Agent': 'Request-Promise'
    },
    qs: {
      v: '20161016',
      ll: ctx.params.coordinates || '7.7906745,98.3280012',
      query: 'coffee',
      radius: 2000,
      intent: 'checkin',
      client_id: CLIENT_ID,
      client_secret: SECRET
    }
  };

  let response = await request(options);

  const info = JSON.parse(response);
  const venues = info.response.venues

  ctx.body = venues;
}

module.exports = coffee;
