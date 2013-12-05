
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
    eventCategory: String,
    categories: Array
});

exports.list = function(req, res){

    var searchTerm = req.query.q;
    var offset     = req.query.offset;
    var category   = req.query.category;
    var daysOfWeek = req.query.daysOfWeek;

    var queryOptions = offset? {"skip": offset} : null;

    var dbQuery = Event.find(null, null, queryOptions);
    dbQuery.limit(50);

    if (searchTerm) {
        var searchRe = new RegExp(searchTerm, "i");
        dbQuery.or([{'description': searchRe}, {'title': searchRe}]);
    }
    if (category && category != "All") {
        var categoryRe = new RegExp(category, "i");
        dbQuery.where({'categories.name': categoryRe});
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

    Event.findOne({ "_id": eventId }, function(error, event) {
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

exports.massage = function(req, res){

    var massageCategory = function(category){
        var categoriesList = [];

        if (category) {
            if (category == 'TEEN') {
                categoriesList.push({name:'Teen'});
            } else if (category == 'ADULT') {
                categoriesList.push({name:'Adult'});
            } else if (category == 'T/A') {
                categoriesList.push({name:'Teen'});
                categoriesList.push({name:'Adult'});
            } else if (category == 'SR') {
                categoriesList.push({name:'Senior'});
            } else if (category == '5&U') {
                categoriesList.push({name:'Youth'});
            }
        }

        return categoriesList;
    };

    var massageEvents = function(events, finalCallback){
        var event = events.shift();
        event.categories = massageCategory(event.eventCategory);
        event.save(function(){
            if (events.length > 0) {
                process.nextTick(function(){
                    massageEvents(events, finalCallback);
                })
            } else {
                finalCallback();
            }
        });
    };

    Event.find(function(error,events){
        if (error) {
            console.log("Error fetching data: " + error);
            res.send({"error": "Unable to retrieve data"}, 500);
        } else {
            massageEvents(events, function(){
                res.send(200);
            });
        }
    });
};
