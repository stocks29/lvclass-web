angular.module('lvclass', ['ngRoute', 'ngResource'])

.value('eventsUrl', '/api/events')

.factory('Events', function($resource, eventsUrl) {
    return $resource(eventsUrl + '/:eventId');
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
    $scope.searchUrl = "/events";
})

.controller('EventCtrl', function($scope, $routeParams, Events) {
    $scope.event = Events.get({eventId: $routeParams.eventId});
    $scope.reviews = [
        {
            "rating": 5,
            "date": "2013-12-04 12:24:31",
            "comment": "AAAA-MAAAAAZING!",
            "user": "Bob"
        }
    ];

    $scope.saveReview = function() {
        alert('hi');
    };
});
