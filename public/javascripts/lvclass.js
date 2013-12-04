angular.module('lvclass', ['ngRoute', 'ngResource'])

.value('eventsUrl', '/api/events')
.value('reviewsUrl', '/api/reviews')

.factory('Events', function($resource, eventsUrl) {
    return $resource(eventsUrl + '/:eventId');
})

.factory('Reviews', function($resource, reviewsUrl) {
    return $resource(reviewsUrl + '/:reviewId');
})

.config(function($routeProvider) {
    $routeProvider
        .when('/events', {
            controller:'EventListCtrl',
            templateUrl:'templates/events/list.html'
        })
        .when('/events/:eventId', {
            controller:'EventCtrl',
            templateUrl:'templates/events/event.html'
        })
        .otherwise({
            "redirectTo": '/search'
        });
})

.controller('EventListCtrl', function($scope, Events) {
    $scope.events = Events.query();
})

.controller('EventCtrl', function($scope, $routeParams, Events, Reviews) {
    $scope.event = Events.get({eventId: $routeParams.eventId});

    $scope.refreshReviews = function(){
        $scope.reviews = Reviews.query({eventId: $routeParams.eventId});
    };

    $scope.refreshReviews();

    $scope.newReview = {};

    $scope.saveReview = function() {
        $scope.newReview.eventId = $scope.event._id;
        Reviews.save($scope.newReview);
        $scope.newReview = {};
        $scope.refreshReviews();
    };
});

