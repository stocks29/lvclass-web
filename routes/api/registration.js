
var request = require('request');
var lvclassImageServer = process.env.LVCLASS_IMAGE_SERVER;

exports.register = function(req, res){
    var registrationForm = req.body;
    request.post({
        url: lvclassImageServer + '/getRegForm',
        json: registrationForm
    }, function(error, response, result){
        if (error) {
            console.log("Error generating form: " + error);
            res.send({error:"Error generating form"},500);
        } else {
            res.set('Location', result.imageUrl);
            res.send({formUrl: result.imageUrl},201);
        }
    });
};