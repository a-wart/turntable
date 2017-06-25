`use strict`;

const pool = require(`./db/pool.js`);
const _ = require(`underscore`);
const prepareBundles = require('./common/bundles.js');

const flightsQuery = `
  SELECT
    f.destination,
    f.there_departure::varchar,
    f.back_departure::varchar,
    EXTRACT(WEEK FROM f.there_departure) AS week,
    f.price,
    f.updated_at
  FROM flights f
  INNER JOIN routes r USING (destination, origin)
  WHERE r.origin = $1
`;

const hotelsQuery = `
  SELECT
    h.city,
    h.checkin::varchar,
    h.checkout::varchar,
    EXTRACT(WEEK FROM h.checkin) AS week,
    h.price,
    h.name,
    h.hotellook_id,
    h.stars,
    h.location
  FROM hotels h
  INNER JOIN routes r ON r.destination = h.city
  WHERE r.origin = $1
`;

async function cards(ctx) {
  ctx.set(`Access-Control-Allow-Origin`, `*`);
  const origin = ctx.params.origin;

  try {
    const [flights, hotels] = await Promise.all([
      pool.queryPromise(flightsQuery, [origin]),
      pool.queryPromise(hotelsQuery, [origin])
    ]);
    ctx.body = prepareResponse(flights, hotels);
  } catch (error) {
    console.log(`error`, error);
    ctx.body = {error: error};
  }
}

function prepareResponse(flights, hotels) {
  const groupedFlights = _.groupBy(flights, (flight) => flight.destination + flight.week);
  const groupedHotels = _.groupBy(hotels, (hotel) => hotel.city + hotel.week);

  const cards = Object.keys(groupedFlights).map(key => {
    const iata = key.substr(0, 3);
    const week = parseInt(key.substr(3), 10);
    return {
      destination: iata,
      week: week,
      banner_img: `https://photo.hotellook.com/static/cities/600x600/${iata}.auto`,
      bundles: prepareBundles(groupedFlights[key], groupedHotels[key]),
    };
  });

  return cards;
}

module.exports = cards;
