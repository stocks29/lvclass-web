angular.module('lvclass', ['ngRoute', 'ngResource'])

.value('eventsUrl', '/api/events')

.factory('Events', function($resource, eventsUrl) {
    return $resource(eventsUrl);
})

.config(function($routeProvider) {
    $routeProvider
        .when('/events', {
            controller:'EventListCtrl',
            templateUrl:'templates/events/list.html'
        })
        .otherwise({
            "redirectTo": '/events'
        });
})

.controller('EventListCtrl', function($scope, Events) {
    $scope.events = Events.query();
});

