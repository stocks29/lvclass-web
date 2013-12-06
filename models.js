
var mongoose = require('mongoose');

var Event = mongoose.model('Event', {
    eventId: String,
    title: String,
    dateRange: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
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
    categories: Array,
    days: Array,
    averageRating: Number
});

var Review = mongoose.model('Review', {
    comment: String,
    rating: Number,
    user: String,
    date: Date,
    eventId: String
});

exports.event = function() {
    return Event;
};

exports.review = function() {
    return Review;
};


