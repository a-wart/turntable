`use strict`;

const pool = require(`./db/pool.js`);
const _ = require(`underscore`);

const flightsQuery = `
  SELECT
    *,
    dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'departure' AS there_origin,
    dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'arrival' AS there_destination,
    dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'departure' AS back_origin,
    dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'arrival' AS back_destination,
    there_departure::varchar,
    back_departure::varchar,
    CONCAT(
      dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'arrival_date',
      ' ',
      dump -> 'segment' -> 0 -> 'flight' -> 0 ->> 'arrival_time',
      ':00'
    ) AS there_arrival,
    CONCAT(
      dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'arrival_date',
      ' ',
      dump -> 'segment' -> 1 -> 'flight' -> 0 ->> 'arrival_time',
      ':00'
    ) AS back_arrival
  FROM flights
  WHERE key = $1
`;
const hotelsQuery = `SELECT * FROM hotels WHERE id = $1`;
const eventsQuery = `
  SELECT * FROM events
  WHERE
    city = $1 AND
    $2 BETWEEN EXTRACT(WEEK FROM start_date) AND EXTRACT(WEEK FROM end_date)
`;

async function cards(ctx) {
  ctx.set(`Access-Control-Allow-Origin`, `*`);
  const {origin, destination, week} = ctx.params;
  const {flight_key, hotel_id} = ctx.query;

  try {
    const [[flight], [hotel], events] = await Promise.all([
      pool.queryPromise(flightsQuery, [flight_key]),
      pool.queryPromise(hotelsQuery, [hotel_id]),
      pool.queryPromise(eventsQuery, [destination, week])
    ]);
    ctx.body = {
      origin: origin,
      destination: destination,
      week: parseInt(week, 10),
      banner_img: `https://photo.hotellook.com/static/cities/600x600/${destination}.auto`,
      flight: flight,
      hotel: hotel,
      events: events
    };
  } catch (error) {
    console.log(`error`, error);
    ctx.body = {error: error};
  }
}

module.exports = cards;
