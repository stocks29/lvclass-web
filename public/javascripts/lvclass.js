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
            "redirectTo": '/events'
        });

})

.controller('EventListCtrl', function($scope, Events) {

    //initialization
    $scope.initialize = function() {
        if (!$scope.events) {
            $scope.events = {};
        }

        if (!$scope.pageData) {
            $scope.pageData = {
                offset: 0,
                totalResults: 0,
                pageSize: 50
            }
        }

        if (!$scope.queryParams) {
            $scope.queryParams = {};
        }
    };

    $scope.query = function() {
        //get the filter query
        if (this.query) {
            $scope.queryParams.q = this.query.q;
        }

        $scope.resetPage();
    };

    $scope.resetPage = function() {
        $scope.pageData.offset = 0;
        $scope.queryParams.offset = $scope.pageData.offset;
        $scope.loadData();
    };

    $scope.nextPage = function() {
        $scope.pageData.offset += $scope.pageData.pageSize;
        $scope.queryParams.offset = $scope.pageData.offset;
        $scope.loadData();
    };

    $scope.prevPage = function() {
        if ($scope.pageData.offset < $scope.pageData.pageSize) {
            $scope.pageData.offset = 0;
        } else {
            $scope.pageData.offset -= $scope.pageData.pageSize;
        }

        $scope.queryParams.offset = $scope.pageData.offset;
        $scope.loadData();
    };

    $scope.loadData = function() {
        $scope.events.data = Events.query($scope.queryParams);
    };

    $scope.initialize();
    $scope.loadData();
})

.controller('EventCtrl', function($scope, $routeParams, Events, Reviews) {
    $scope.event = Events.get({eventId: $routeParams.eventId});

    $scope.refreshReviews = function(){
        $scope.reviews = Reviews.query({eventId: $routeParams.eventId});
    };

    $scope.refreshReviews();

    $scope.newReview = {};

    $scope.saveReview = function() {
        $scope.newReview.eventId = $scope.event.eventId;
        Reviews.save($scope.newReview);
        $scope.newReview = {};
        $scope.refreshReviews();
    };
});
