
/*
 * GET users listing.
 */


var models = require('../../models');
var Event = models.event();

exports.list = function(req, res){

    var searchTerm = req.query.q;
    var offset     = req.query.offset;
    var category   = req.query.category;
    var sortBy     = req.query.sortBy;
    var sortDir    = req.query.sortDir;
    var price      = req.query.price;
    var begTime    = req.query.begTime;
    var endTime    = req.query.endTime;

    var daysOfWeekM  = parseBool(req.query.daysOfWeekM);
    var daysOfWeekTu = parseBool(req.query.daysOfWeekTu);
    var daysOfWeekW  = parseBool(req.query.daysOfWeekW);
    var daysOfWeekTh = parseBool(req.query.daysOfWeekTh);
    var daysOfWeekF  = parseBool(req.query.daysOfWeekF);
    var daysOfWeekSa = parseBool(req.query.daysOfWeekSa);
    var daysOfWeekSu = parseBool(req.query.daysOfWeekSu);

    var dbQuery = Event.find(null, null, null);

    dbQuery.limit(50);
    dbQuery.skip(offset ? offset : 0);

    if (sortBy) {
        var sortOptions = {};
        sortOptions[sortBy] = sortDir ? sortDir : "asc";
        dbQuery.sort(sortOptions);
    }

    if (searchTerm) {
        var searchRe = new RegExp(searchTerm, "i");
        dbQuery.or([{'description': searchRe}, {'title': searchRe}]);
    }
    if (category && category != "All") {
        var categoryRe = new RegExp(category, "i");
        dbQuery.where({'categories.name': categoryRe});
    }

    if (price && price != "All") {
       if (price == 0) {
           dbQuery.where({'fee':price});
       }
       else {
           dbQuery.where({'fee':{$lte:price}});
       }
    }

    if (begTime == "Any") {
        delete begTime;
    }
    if (endTime == "Any") {
        delete endTime;
    }
    if (begTime && endTime) {
        if (begTime > endTime) {
            var tempTime = endTime;
            endTime = begTime;
            begTime = tempTime;
        }
        dbQuery.where({'startTime':{$gte:begTime,$lte:endTime}});
    }
    else if (begTime) {
        dbQuery.where({'startTime':{$gte:begTime}});
    }
    else if (endTime) {
        dbQuery.where({'startTime':{$lte:endTime}});
    }

    if (daysOfWeekM || daysOfWeekTu || daysOfWeekW || daysOfWeekTh || daysOfWeekF ||
        daysOfWeekSa || daysOfWeekSu) {
        var queryHasArray = [];
        if (daysOfWeekM)  queryHasArray.push({'days.short': 'M'});
        if (daysOfWeekTu) queryHasArray.push({'days.short': 'Tu'});
        if (daysOfWeekW)  queryHasArray.push({'days.short': 'W'});
        if (daysOfWeekTh) queryHasArray.push({'days.short': 'Th'});
        if (daysOfWeekF)  queryHasArray.push({'days.short': 'F'});
        if (daysOfWeekSa) queryHasArray.push({'days.short': 'Sa'});
        if (daysOfWeekSu) queryHasArray.push({'days.short': 'Su'});

        var queryNotArray = [];
        if (daysOfWeekM  === false) queryNotArray.push({'days.short': {$ne: 'M'}});
        if (daysOfWeekTu === false) queryNotArray.push({'days.short': {$ne: 'Tu'}});
        if (daysOfWeekW  === false) queryNotArray.push({'days.short': {$ne: 'W'}});
        if (daysOfWeekTh === false) queryNotArray.push({'days.short': {$ne: 'Th'}});
        if (daysOfWeekF  === false) queryNotArray.push({'days.short': {$ne: 'F'}});
        if (daysOfWeekSa === false) queryNotArray.push({'days.short': {$ne: 'Sa'}});
        if (daysOfWeekSu === false) queryNotArray.push({'days.short': {$ne: 'Su'}});

        if (queryHasArray.length > 0) dbQuery.or(queryHasArray);
        if (queryNotArray.length > 0) dbQuery.and(queryNotArray);
    }

    dbQuery.exec(function(error, events) {
        if (error) {
            console.log("Error fetching data: " + error);
            res.send({ "error": "Unable to retrieve data"}, 500);
        } else {
            res.send(events);
        }
    });
};

exports.event = function(req, res){
    var eventId = req.params.eventId;

    Event.findOne({ "_id": eventId }, function(error, event) {
        if (error) {
            console.log("Error fetching data: " + error);
            res.send({ "error": "Unable to retrieve data"}, 500);
        } else {
            if (event) {
                res.send(event);
            } else {
                res.send({"error": "Event does not exist"} , 404);
            }
        }
    });
};

exports.massage = function(req, res){

    var massageCategory = function(category){
        var categoriesList = [];

        if (category) {
            if (category == 'TEEN') {
                categoriesList.push({name:'Teen'});
            } else if (category == 'ADULT') {
                categoriesList.push({name:'Adult'});
            } else if (category == 'T/A') {
                categoriesList.push({name:'Teen'});
                categoriesList.push({name:'Adult'});
            } else if (category == 'SR') {
                categoriesList.push({name:'Senior'});
            } else if (category == '5&U') {
                categoriesList.push({name:'Youth'});
            } else if (category == 'YTH') {
                categoriesList.push({name:'Youth'});
            }
        }

        return categoriesList;
    };

    var massageFee = function(fee) {
        if (fee) {
            return fee.replace('$', '');
        } else {
            return 0;
        }
    };

    var splitDate = function(dateRange) {
        if (!dateRange) {
            return;
        }
        // dateRange is 01/04/14- 01/05/14

        dateRange = dateRange.replace(/\s+/g, '');
        // dateRange is 01/04/14-01/05/14

        var dates = dateRange.split('-');
        // dates[0] is startDate, dates[1] is endDate

        var startDateParts = dates[0].split('/');
        var endDateParts   = dates[1].split('/');

        return {
            "startDate": "20" + startDateParts[2] + startDateParts[0] + startDateParts[1],
            "endDate": "20" + endDateParts[2] + endDateParts[0] + endDateParts[1]
        };
    };

    var splitTime = function(timeRange) {
        if (!timeRange) {
            return;
        }

        // timeRange is 1:00P- 2:00P

        timeRange = timeRange.replace(/\s+/g, '');
        // timeRange is 1:00P-2:00P

        var times = timeRange.split('-');
        // times[0] is startTime, times[1] is endTime

        if (times[0] == 'Varies') {
            return;
        }

        var resultTimes = [];

        times.forEach(function(time){
            var aOrP = time.slice(-1);
            var timeParts = time.split(':');
            timeParts[1] = timeParts[1].slice(0,2);
            if (aOrP == "P") {
                timeParts[0] = parseInt(timeParts[0]) + 12;
            }
            if (timeParts[0] < 10) {
                timeParts[0] = '0' + timeParts[0];
            }
            resultTimes.push(timeParts[0] + ':' + timeParts[1]);
        });

        return {
            "startTime": resultTimes[0],
            "endTime": resultTimes[1]
        };
    };

    var massageDays = function(dayOfWeek){
        if (!dayOfWeek) {
            return [];
        }

        dayOfWeek = dayOfWeek.replace(/\s+/g, '');
        var daysList = dayOfWeek.split(',');

        if (daysList[0] == 'Varies') {
            return [];
        }

        var availableDays = {
            "M":{long:'Monday',short:'M'},
            "Tu":{long:'Tuesday',short:'Tu'},
            "W": {long:'Wednesday',short:'W'},
            "Th": {long:'Thursday',short:'Th'},
            "F": {long:'Friday',short:'F'},
            "Sa": {long:'Saturday',short:'Sa'},
            "Su": {long:'Sunday',short:'Su'}
        };

        var dayRanges = {
            'M-F': [availableDays['M'], availableDays['Tu'], availableDays['W'], availableDays['Th'], availableDays['F']],
            'M-W': [availableDays['M'], availableDays['Tu'], availableDays['W']],
            'Th-Su': [availableDays['Th'], availableDays['F'], availableDays['Sa'], availableDays['Su']],
            'M-Sa': [availableDays['M'], availableDays['Tu'], availableDays['W'], availableDays['Th'], availableDays['F'], availableDays['Sa']],
            'Tu-Th': [availableDays['Tu'], availableDays['W'], availableDays['Th']]
        };

        var resultDays = [];

        daysList.forEach(function(day){

            var thisDay = availableDays[day];
            if (thisDay) {
                resultDays.push(thisDay);
            }

            var thisRange = dayRanges[day];
            if (thisRange) {
                resultDays = resultDays.concat(thisRange);
            }
        });

        return resultDays;
    };

    var massageEvents = function(events, finalCallback){
        var event = events.shift();

        if (event.dateRange) {
            event.dateRange = event.dateRange.replace(/\s+/g, '');
        }

        if (event.timeOfDay) {
            event.timeOfDay = event.timeOfDay.replace(/\s+/g, '');
        }

        var dates = splitDate(event.dateRange);
        if (dates) {
            event.startDate = dates.startDate;
            event.endDate = dates.endDate;
        }

        var times = splitTime(event.timeOfDay);
        if (times) {
            event.startTime = times.startTime;
            event.endTime = times.endTime;
        }

        // Cleanup legacy list
        delete event.categoriesList;

        event.categories = massageCategory(event.eventCategory);
        event.fee = massageFee(event.fee);
        event.days = massageDays(event.dayOfWeek);

        event.save(function(){
            if (events.length > 0) {
                process.nextTick(function(){
                    massageEvents(events, finalCallback);
                })
            } else {
                finalCallback();
            }
        });
    };

    Event.find(function(error,events){
        if (error) {
            console.log("Error fetching data: " + error);
            res.send({"error": "Unable to retrieve data"}, 500);
        } else {
            massageEvents(events, function(){
                res.send(200);
            });
        }
    });
};

var parseBool = function(val) {
    if (val === "true") {
        return true;
    }

    if (val === "false") {
        return false;
    }

    return undefined;
};
