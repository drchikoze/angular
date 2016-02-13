/**
 * Created by vasilij on 26.06.15.
 */
angular.module('bookingApp').service('HistoryGate', ['$location', function($location) {
    var historyGate = function HistoryGate() {};

    historyGate.prototype.clearReturnParam = function() {
        var pageParams = $location.search();
        if (pageParams.return) {
            var newPageParams = {};
            for (var ind in pageParams) {
            //pageParams.forEach(function (ind, item) {
                if (ind != 'return') {
                    newPageParams[ind] = pageParams[ind];
                }
            }
            $location.search(newPageParams);
            $location.replace();
        }
    };

    historyGate.prototype.setShortTourId = function(longId, shortId) {
        var pageUrl = $location.url();
        if (longId && shortId) {
            pageUrl = pageUrl.replace(longId, shortId);
            $location.url(pageUrl);
            $location.replace();
        }
    };

    return historyGate;
}]);