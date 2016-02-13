/**
 * Created by vasilij on 25.08.15.
 */

angular.module('app').filter('makePrettyPrice', function () {
    return function (price) {
        if (price == undefined) {
            return '';
        }
        price = parseInt(price).toString();
        return price.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    };
});
