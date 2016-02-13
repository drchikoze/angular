(function(){
    angular
        .module('app')
        .service('roomSizeRequiredService', roomSizeRequiredService);

    roomSizeRequiredService.$inject = ['$location', '$rootScope'];

    function roomSizeRequiredService($location, $rootScope) {
        var self = this;

        self.roomSizes =  {
            15: {children: 0, adults: 1},
            14: {children: 0, adults: 2},
            23: {children: 0, adults: 3},
            26: {children: 0, adults: 4},
            29: {children: 0, adults: 5},
            24: {children: 0, adults: 6},
            30: {children: 0, adults: 7},
            3: {children: 0, adults: 8},
            4: {children: 0, adults: 9},
            18: {children: 1, adults: 1},
            20: {children: 1, adults: 2},
            27: {children: 1, adults: 3},
            32: {children: 1, adults: 4},
            53: {children: 1, adults: 5},
            55: {children: 1, adults: 6},
            19: {children: 2, adults: 1},
            21: {children: 2, adults: 2},
            31: {children: 2, adults: 3},
            33: {children: 2, adults: 4},
            54: {children: 2, adults: 5},
            56: {children: 2, adults: 6}
        };

        self.check = function() {
            var data = $rootScope.searchParams;
            var roomSizes = self.roomSizes;
            var $messageLabel = $('.js-roomsize-required');

            if (data['rs'] != undefined && roomSizes[parseInt(data['rs'])] != undefined) {
                var childs = roomSizes[parseInt(data['rs'])].children;
                if (!childs) {
                    $messageLabel.hide();
                    return true;
                }
                $messageLabel.text(childs > 1 ? 'Укажите возраста детей' : 'Укажите возраст ребенка');
                if ((!data['ch1'] && data['ch1'] !== 0) || data['ch1'] == -1) {
                    $messageLabel.show();
                    return false;
                }
                if (childs > 1 && ((!data['ch2'] && data['ch2'] !== 0) || data['ch2'] == -1)) {
                    return false;
                }
            }

            $messageLabel.hide();

            return true;
        }

        return {check: self.check};
    };
})();
