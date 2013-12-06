
var models = require('../../models');
var Review = models.review();
var Event = models.event();

exports.saveReview = function(req, res){
    var reviewData = req.body;
    reviewData.date = new Date();

    var updateEventAverageRating = function(event) {
        Review.find({ eventId: event._id }, function(error,eventReviews){
            if (error) {
                console.log("Error looking up reviews for event: " + error);
            } else {
                var reviewCount = eventReviews.length;
                var ratingSum   = 0;
                eventReviews.forEach(function(review){
                    ratingSum = review.rating + ratingSum;
                });
                event.averageRating = ratingSum / reviewCount;
                event.save();
            }
        });
    };

    Event.findById(reviewData.eventId, function(error, event){
        if (error) {
            console.log("Error finding event: " + error);
            res.send({error:"Error finding event"},500);
        } else if (!event) {
            res.send({error:"Event does not exist"},404);
        } else {

            // Save new review
            var review = new Review(reviewData);
            review.save(function(error) {
                if (error) {
                    console.log("Error saving review: " + error);
                    res.send({error: "Error saving review"},500);
                } else {
                    process.nextTick(function(){ updateEventAverageRating(event) });
                    res.send(201);
                }
            });
        }
    })


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