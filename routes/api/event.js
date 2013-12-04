
/*
 * GET users listing.
 */

var request = require('request');

exports.list = function(req, res){

    var queryUrl = 'http://demo.ckan.org/api/action/datastore_search?resource_id=acfa8820-38bf-435b-8afb-9c5b9f59013b&limit=50';
    queryUrl += (req.query.q ? '&q=' + req.query.q : '');
    queryUrl += (req.query.offset ? '&q=' + req.query.offset : '');

    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Got response: " + response.statusCode);
            var result = JSON.parse(body);
            res.set('Content-Type', 'application/json');
            res.send(result.result.records);
        } else {
            console.log("Error fetching data: " + error);
            res.send({ "error": "Unable to retrieve data"}, 500);
        }
    });

};

exports.event = function(req, res){
    var eventId = req.params.eventId;
    var eventUrl = 'http://demo.ckan.org/api/action/datastore_search?resource_id=acfa8820-38bf-435b-8afb-9c5b9f59013b&filters={"_id":"'
        + eventId + '"}';

    request(eventUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Got response: " + response.statusCode);
            var result = JSON.parse(body);
            res.set('Content-Type', 'application/json');
            res.send(result.result.records[0]);
        } else {
            console.log("Error fetching data: " + error);
            res.send({ "error": "Unable to retrieve data"}, 500);
        }
    });
};
