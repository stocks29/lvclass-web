angular.module('lvclass', ['ngRoute', 'ngResource', 'ui.bootstrap'])

    .value('eventsUrl', '/api/events')
    .value('reviewsUrl', '/api/reviews')
    .value('registrationsUrl', '/api/registrations')

    .factory('Events', function($resource, eventsUrl) {
        return $resource(eventsUrl + '/:eventId');
    })

    .factory('Reviews', function($resource, reviewsUrl) {
        return $resource(reviewsUrl + '/:reviewId');
    })

    .factory('Registrations', function($resource, registrationsUrl) {
        return $resource(registrationsUrl);
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
            .when('/events/:eventId/register', {
                controller:'RegisterCtrl',
                templateUrl:'templates/events/register.html'
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
            $scope.events.loaded = false;

            if (!$scope.pageData) {
                $scope.pageData = {
                    pageSize: 50
                };
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
            if ($scope.queryParams.sortBy == "undefined") {
                delete $scope.queryParams.sortBy;
            }
            if ($scope.queryParams.price == "undefined" || $scope.queryParams.price == "All") {
                delete $scope.queryParams.price;
            }
            if ($scope.queryParams.begTime == "undefined" || $scope.queryParams.begTime == "Any") {
                delete $scope.queryParams.begTime;
            }
            if ($scope.queryParams.endTime == "undefined" || $scope.queryParams.endTime == "Any") {
                delete $scope.queryParams.endTime;
            }

            if ($scope.queryParams.daysOfWeekM === undefined) {
                $scope.queryParams.daysOfWeekM = true;
            }
            if ($scope.queryParams.daysOfWeekTu === undefined) {
                $scope.queryParams.daysOfWeekTu = true;
            }
            if ($scope.queryParams.daysOfWeekW === undefined) {
                $scope.queryParams.daysOfWeekW = true;
            }
            if ($scope.queryParams.daysOfWeekTh === undefined) {
                $scope.queryParams.daysOfWeekTh = true;
            }
            if ($scope.queryParams.daysOfWeekF === undefined) {
                $scope.queryParams.daysOfWeekF = true;
            }
            if ($scope.queryParams.daysOfWeekSa === undefined) {
                $scope.queryParams.daysOfWeekSa = true;
            }
            if ($scope.queryParams.daysOfWeekSu === undefined) {
                $scope.queryParams.daysOfWeekSu = true;
            }
        };

        $scope.query = function() {
            //get the filter query
            if (this.queryParams) {
                $scope.queryParams.q = this.queryParams.q;
                $scope.queryParams.category = this.queryParams.category;
                $scope.queryParams.price = this.queryParams.price;
                $scope.queryParams.begTime = this.queryParams.begTime;
                $scope.queryParams.endTime = this.queryParams.endTime;
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

        $scope.sort = function(field) {
            if (field == $scope.queryParams.sortBy) {
                if ($scope.queryParams.sortDir == "asc") {
                    $scope.queryParams.sortDir = "desc";
                }
                else if (!$scope.queryParams.sortDir || $scope.queryParams.sortDir == "desc") {
                    $scope.queryParams.sortDir = "asc";
                }
            }
            else {
                $scope.queryParams.sortDir = "asc";
            }
            $scope.queryParams.sortBy = field;


            $location.search($scope.queryParams);
        };

        $scope.initialize();

        //load the data
        $scope.events.data = Events.query($scope.queryParams, function() {
            $scope.events.loaded = true;
        });
    })

    .controller('EventCtrl', function($scope, $routeParams, Events, Reviews) {
        $scope.event = Events.get({eventId: $routeParams.eventId});

        $scope.refreshReviews = function(){
            $scope.reviews = Reviews.query({eventId: $routeParams.eventId});
        };

        $scope.resetReviewForm = function() {
            $scope.newReview = {"rating": 3};
        };

        $scope.refreshReviews();
        $scope.resetReviewForm();

        $scope.saveReview = function() {
            $scope.newReview.eventId = $scope.event._id;
            Reviews.save($scope.newReview, function(){
                $scope.refreshReviews();
                $scope.resetReviewForm();
            });
        };
    })

    .controller('RegisterCtrl', function($scope, $routeParams, $window, Events, Registrations){

        $scope.registrationForm = {
            participants: [{}],
            classes: [{}]
        };

        $scope.event = Events.get({eventId: $routeParams.eventId},function(event){
            $scope.registrationForm.classes[0].code = event.eventId;
            $scope.registrationForm.classes[0].className = event.title;
            $scope.registrationForm.classes[0].fee = event.fee;
            $scope.registrationForm.municipality = event.municipality;
        });

        $scope.parseInt = function(number){
            if (!number) {
                return 0;
            } else {
                return parseInt(number);
            }
        };

        $scope.addParticipant = function() {
            $scope.registrationForm.participants.push({});
        };

        $scope.addClass = function() {
            $scope.registrationForm.classes.push({
                'code': $scope.event.eventId,
                'className': $scope.event.title,
                'fee': $scope.event.fee
            });
        };

        $scope.totalFees = function() {
            var fees = 0;
            $scope.registrationForm.classes.forEach(function(activity){
                if (!activity.fee) {
                    return;
                }
                fees = fees + parseInt(activity.fee);
            });
            return fees;
        };

        $scope.createRegistrationForm = function() {
            Registrations.save($scope.registrationForm, function(res) {
                $window.open(res.formUrl);
            });
        };
    });
