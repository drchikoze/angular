/**
 * Created by vasilij on 25.08.15.
 */

angular.module('app').filter('makePrettyDate', function () {
    return function (noFormattedDate) {
        var dayOfWeek = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
        var regExp = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})$/;
        var extractedDate = regExp.exec(noFormattedDate);
        if (!extractedDate) {
            return noFormattedDate;
        }

        var date = new Date(extractedDate[1], extractedDate[2] - 1, extractedDate[3]);
        var data = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        return data + '.' + month + ' ' + dayOfWeek[date.getDay()];
    };
});