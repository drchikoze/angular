/**
 * Created by vasilij on 25.08.15.
 */

angular.module('app').filter('getEnding', function () {
    return function(arr) {
        var value = arr.val;
        var suffixList = arr.arr;
        var originalValue = value;
        value = value % 100;
        var digit = value % 10;
        var ending;

        if(value == 1 || (value > 20 && digit == 1)) {
            ending = 1;
        } else if (value > 1 && value < 5 || (value > 20 && digit > 1 && digit < 5)) {
            ending = 2;
        } else {
            ending = 0;
        }

        if(suffixList.hasOwnProperty(ending)) {
            return originalValue + ' ' + suffixList[ending];
        } else {
            return originalValue + ' ' + suffixList[0];
        }
    };
});