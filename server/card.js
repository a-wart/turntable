`use strict`;

const pool = require(`./db/pool.js`);
const prepareBundles = require('./common/bundles.js');
const _ = require(`underscore`);

const flightsQuery = `
  SELECT
    f.key,
    f.destination,
    f.dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'departure' AS there_origin,
    f.dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'arrival' AS there_destination,
    f.dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'departure' AS back_origin,
    f.dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'arrival' AS back_destination,
    f.there_departure::varchar,
    f.back_departure::varchar,
    CONCAT(
      f.dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'arrival_date',
      ' ',
      f.dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'arrival_time',
      ':00'
    ) AS there_arrival,
    CONCAT(
      f.dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'arrival_date',
      ' ',
      f.dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'arrival_time',
      ':00'
    ) AS back_arrival,
    EXTRACT(WEEK FROM f.there_departure) AS week,
    f.price,
    f.updated_at
  FROM flights f
  INNER JOIN routes r USING (destination, origin)
  WHERE r.origin = $1 AND r.destination = $2 AND EXTRACT(WEEK FROM f.there_departure) = $3
`;

const hotelsQuery = `
  SELECT
    id,
    city,
    checkin::varchar,
    checkout::varchar,
    EXTRACT(WEEK FROM checkin) AS week,
    price,
    name,
    hotellook_id,
    stars,
    location
  FROM hotels h
  WHERE city = $1 AND EXTRACT(WEEK FROM checkin) = $2
`;

async function cards(ctx) {
  ctx.set(`Access-Control-Allow-Origin`, `*`);
  const {origin, destination, week} = ctx.params;

  try {
    const [flights, hotels] = await Promise.all([
      pool.queryPromise(flightsQuery, [origin, destination, week]),
      pool.queryPromise(hotelsQuery, [destination, week])
    ]);
    ctx.body = {
      origin: origin,
      destination: destination,
      week: parseInt(week, 10),
      banner_img: `https://photo.hotellook.com/static/cities/600x600/${destination}.auto`,
      bundles: prepareBundles(flights, hotels),
      flights: flights,
      hotels: hotels
    };
  } catch (error) {
    console.log(`error`, error);
    ctx.body = {error: error};
  }
}

module.exports = cards;
