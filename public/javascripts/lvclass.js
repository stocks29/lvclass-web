angular.module('lvclass', ['ngRoute', 'ngResource', 'ui.bootstrap'])

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
            "redirectTo": '/events'
        });

})

.controller('EventListCtrl', function($scope, $location, Events) {

    //initialization
    $scope.initialize = function() {
        if (!$scope.events) {
            $scope.events = {};
        }

        if (!$scope.pageData) {
            $scope.pageData = {
                pageSize: 50
            }
        }

        $scope.queryParams = $location.search();
        if (!$scope.queryParams) {
            $scope.queryParams = {};
        }
        if ($scope.queryParams.q == "undefined") {
            delete $scope.queryParams.q;
        }
        if ($scope.queryParams.offset) {
            $scope.queryParams.offset = parseInt($scope.queryParams.offset);
        } else {
            $scope.queryParams.offset = 0;
        }
        if ($scope.queryParams.category == "undefined" || $scope.queryParams.category == "All") {
            delete $scope.queryParams.category;
        }
    };

    $scope.query = function() {
        //get the filter query
        if (this.queryParams) {
            $scope.queryParams.q = this.queryParams.q;
            $scope.queryParams.category = this.queryParams.category;
        }

        $scope.queryParams.offset = 0;
        $location.search($scope.queryParams);
    };

    $scope.nextPage = function() {
        $scope.queryParams.offset += $scope.pageData.pageSize;
        $location.search($scope.queryParams);
    };

    $scope.prevPage = function() {
        if ($scope.queryParams.offset < $scope.pageData.pageSize) {
            $scope.queryParams.offset = 0;
        } else {
            $scope.queryParams.offset -= $scope.pageData.pageSize;
        }

        $location.search($scope.queryParams);
    };

    $scope.initialize();

    //load the data
    $scope.events.data = Events.query($scope.queryParams);
})

.controller('EventCtrl', function($scope, $routeParams, Events, Reviews) {
    $scope.event = Events.get({eventId: $routeParams.eventId});

    $scope.refreshReviews = function(){
        $scope.reviews = Reviews.query({eventId: $routeParams.eventId});
    };

    $scope.resetReviewForm = function() {
        $scope.newReview = {"rating": 3};
    }

    $scope.refreshReviews();
    $scope.resetReviewForm();

    $scope.saveReview = function() {
        $scope.newReview.eventId = $scope.event._id;
        Reviews.save($scope.newReview);
        $scope.refreshReviews();
        $scope.resetReviewForm();
    };
});
