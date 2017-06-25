const pg = require('pg');

let config = {
  database: "hackathon-weekend",
  user: "aviasales",
  password: "nWpB8sZ/qfkzd",
  host: "teplyakova.int.avs.io",
  idleTimeoutMillis: 30000
};

// config = {
//   database: "hackathon-weekend",
//   user: "wart",
//   password: "",
//   host: "localhost",
//   idleTimeoutMillis: 30000
// };

//this initializes a connection pool
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients
const pool = new pg.Pool(config);

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack);
});

//export the query method for passing queries to the pool
const query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

const queryPromise = function(text, values) {
  return new Promise((resolve, reject) => {
    query(text, values, function(err, result) {
      if(err) {
        reject(err);
        return console.error('error running query', err);
      } else {
        return resolve(result.rows);
      }
    });
  });
};

module.exports.query = query;

module.exports.queryPromise = queryPromise;

// the pool also supports checking out a client for
// multiple operations, such as a transaction
module.exports.connect = function (callback) {
  return pool.connect(callback);
};
