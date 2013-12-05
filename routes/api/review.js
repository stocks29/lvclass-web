
var mongoose = require('mongoose');

var Review = mongoose.model('Review', { comment: String, rating: Number, user: String, date: Date, eventId: String });

exports.saveReview = function(req, res){
    var reviewData = req.body;
    reviewData.date = new Date();
    var review = new Review(reviewData);
    review.save(function(error) {
        if (error) {
            console.log("Error saving review: " + error);
            res.send(500);
        } else {
            res.send(201);
        }
    });
};

exports.list = function(req, res){
    var id = req.param('eventId');
    Review.find({ eventId: id }, function(error, reviews){
        if (error) {
            console.log("Error searching reviews: " + error);
            res.send(500);
        } else {
            res.send(reviews);
        }
    });
};