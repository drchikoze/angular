/**
 * Created by vasilij on 14.07.15.
 */

angular.module('search').service('description', function() {

    this.monthNames = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    this.nightNames = ['ночей', 'ночь', 'ночи'];
    this.adultNames = ['взрослых', 'взрослого', 'взрослых'];
    this.childNames = ['детей', 'ребенка', 'детей'];
    this.roomSizeDescription = {
        15: [1, 0],
        51: [1, 0],
        18: [1, 1],
        19: [1, 2],

        14: [2, 0],
        20: [2, 1],
        21: [2, 2],

        23: [3, 0],
        27: [3, 1],
        31: [3, 2],

        26: [4, 0],
        32: [4, 1],
        33: [4, 2],

        29: [5, 0],
        53: [5, 1],
        54: [5, 2],

        24: [6, 0],
        55: [6, 1],
        56: [6, 2],

        30: [7, 0],
        3:  [8, 0],
        4:  [9, 0],
        2:  [10, 0],
        44: [11, 0],
        45: [12, 0]
    };


    this.get_ending = function(num, decode) {
        num = num % 100;
        var digit = num % 10;
        var ending = 0;
        if(num == 1 || (num > 20 && digit == 1))
            ending = 1;
        else if(num > 1 && num < 5 || (num > 20 && digit > 1 && digit < 5))
            ending = 2;
        else
            ending = 0;

        return decode[ending];
    };

    this.getPrettyDate = function(date) {
        var partDate = date.split('-');
         return partDate[0] + ' ' + this.monthNames[partDate[1] - 1] + ' ' + partDate[2];
    };

    this.getPrettyDuration = function(nightCount) {
        return nightCount + ' ' + this.get_ending(nightCount, this.nightNames);
    };

    this.getPrettyAdultsCount = function(roomSizeId) {
        var adultsCount;
        if (this.roomSizeDescription[roomSizeId] == undefined) {
            adultsCount = 2;
        } else {
            adultsCount = this.roomSizeDescription[roomSizeId][0];
        }
        return adultsCount + ' ' + this.get_ending(adultsCount, this.adultNames);
    };

    this.getPrettyChildrenCount = function(roomSizeId) {
        var childCount = this.getChildrenCount(roomSizeId);
        if (this.roomSizeDescription[roomSizeId] == undefined) {
            childCount = 0;
        } else {
            childCount = this.roomSizeDescription[roomSizeId][1];
        }
        return childCount + ' ' + this.get_ending(childCount, this.childNames);
    };

    this.getChildrenCount = function(roomSizeId) {
        var childCount;
        if (this.roomSizeDescription[roomSizeId] == undefined) {
            childCount = 0;
        } else {
            childCount = this.roomSizeDescription[roomSizeId][1];
        }
        return childCount;
    };

    this.getAdultCount = function(roomSizeId) {
        if (this.roomSizeDescription[roomSizeId] == undefined) {
            return 0;
        } else {
            return this.roomSizeDescription[roomSizeId][0];
        }
    };

});
