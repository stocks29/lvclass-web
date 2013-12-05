
/*
 * GET users listing.
 */

var mongoose = require('mongoose');

var Event = mongoose.model('Event', {
    eventId: String,
    title: String,
    dateRange: String,
    dayOfWeek: String,
    timeOfDay: String,
    location: String,
    fee: String,
    ageRange: String,
    description: String,
    contactNumber: String,
    address: String,
    mapUrl: String,
    eventCategory: String
});

exports.list = function(req, res){

    var searchTerm = req.query.q;
    var offset     = req.query.offset;
    var queryOptions  = (offset) ? {'skip': offset} : null;

    var dbQuery = Event.find(null, null, queryOptions);
    dbQuery.limit(50);

    if (searchTerm) {
        var searchRe = new RegExp(searchTerm, "i");
        dbQuery.or([{'description': searchRe}, {'title': searchRe}]);
    }

    dbQuery.exec(function(error, events) {
        if (error) {
            console.log("Error fetching data: " + error);
            res.send({ "error": "Unable to retrieve data"}, 500);
        } else {
            res.send(events);
        }
    });
};

exports.event = function(req, res){
    var eventId = req.params.eventId;

    Event.findOne({ "eventId": eventId }, function(error, event) {
        if (error) {
            console.log("Error fetching data: " + error);
            res.send({ "error": "Unable to retrieve data"}, 500);
        } else {
            if (event) {
                res.send(event);
            } else {
                res.send({"error": "Event does not exist"} , 404);
            }
        }
    });
};
