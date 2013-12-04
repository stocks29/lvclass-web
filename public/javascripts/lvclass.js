angular.module('lvclass', ['ngRoute', 'ngResource'])

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

.controller('EventListCtrl', function($scope, $resource) {
    var Events = $resource('/api/events');

    $scope.events = Events.query();

//    $scope.events = [
//        {
//            "dayOfWeek": "Varies",
//            "_id": 1,
//            "description": "No description",
//            "title": "CB Video Fitness",
//            "dateRange": "2014-01-06T14:00:00",
//            "mapUrl": "http://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=3930+Cambridge+Street+Las+Vegas+NV+89119",
//            "eventCategory": "ADULT",
//            "contactNumber": "(702)455-7169",
//            "fee": "$0",
//            "location": "Varies",
//            "address": "3930 Cambridge Street, Las Vegas NV, 89119",
//            "ageRange": "30 years and Up",
//            "timeOfDay": "Varies",
//            "id": "102301-01"
//        }
//    ];
});

