
/*
 * GET users listing.
 */

var request = require('request');

exports.list = function(req, res){

    request('http://demo.ckan.org/api/action/datastore_search?resource_id=acfa8820-38bf-435b-8afb-9c5b9f59013b&limit=50', function (error, response, body) {
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