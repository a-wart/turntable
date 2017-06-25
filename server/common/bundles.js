const _ = require('underscore');

function prepareBundles(flights, hotels) {
  const getFlightDate = (timestamp) => timestamp.split(` `)[0];
  const getFlightDates = (flight) => (
    getFlightDate(flight.there_departure) + getFlightDate(flight.back_departure)
  );

  const cardFlights = _
    .chain(flights)
    .groupBy((flight) => getFlightDates(flight))
    .map((groupFlights) => _.sortBy(groupFlights, 'price')[0])
    .sortBy(`price`)
    .first(3)
    .value();
  const groupedHotels = _.groupBy(hotels, (hotel) => hotel.checkin + hotel.checkout)

  const usedHotels = {};
  return cardFlights.map((flight) => {
    const key = getFlightDates(flight);
    const hotels = _.sortBy(groupedHotels[key], 'price');
    let hotel = hotels[0];
    for (let nextHotel of hotels) {
      if (nextHotel.hotellook_id in usedHotels) {
        continue;
      } else {
        hotel = nextHotel;
        break;
      }
    }

    if (hotel) {
      usedHotels[hotel.hotellook_id] = true;
    }

    return {flight, hotel};
  });
}

module.exports = prepareBundles;
