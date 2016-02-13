angular.module('filters').service('params', ['dataSource', '$location', '$rootScope', function(dataSource, $location, $rootScope) {
    var params = function Params(paramsList) {
        this.al = [];
        this.re = [];
        this.op = [];
        this.apv = [];
        this.ac = [];
        angular.extend(this, paramsList);
        this.op = convertToInt(this.op);
    };

    params.prototype.initFromUrl = function(url) {
        var regexp = /(?:\/)?(\d+)\/(al|re|co)([\d,]+)\/(details)\/([\d\.]+)\/(\d+)\/(\d+)(?::(\d+)(?:,(\d+))?)?(?:\/([\d,a-zA-Z\/]+)?)?.*/;
        var match = regexp.exec(url);
        if (match) {
            this.al = [];
            this.re = [];
            this.op = [];
            this.apv = [];
            this.ac = [];
            this.me = '';
            this.apt = '';
            this.ct = match[1];
            if (match[2] != 'co') {
                this[match[2]] = match[3].split('_');
            } else {
                this[match[2]] = match[3];
            }

            this.df = match[5].replace(/\./g, '-');
            this.dt = match[5].replace(/\./g, '-');
            this.nf = parseInt(match[6]);
            this.nt = parseInt(match[6]);
            this.rs = match[7];
            this.ch1 = match[8];
            this.ch2 = match[9];
            if (match[10]) {
                var optionalParams = match[10].split('/');
                regexp = /([a-zA-Z]+)([\d,]+)/;
                var extractedParam;
                for (var i in optionalParams) {
                    extractedParam = regexp.exec(optionalParams[i]);
                    if (extractedParam) {
                        if (extractedParam[1] == 'me') {
                            this[extractedParam[1]] = extractedParam[2];
                        } else {
                            this[extractedParam[1]] = convertToInt(extractedParam[2].split(','));
                        }
                    }
                }
            }
        }
        return this;
    };

    function convertToInt(arr) {
        return arr.map(function(elem) {
            return parseInt(elem);
        });
    }

    params.prototype.getSearchQueryString = function() {
        var result = '';
        for (var idx in this) {
            if (this.hasOwnProperty(idx)) {
                if (this[idx] instanceof Function) {
                    continue;
                }
                if (this[idx] instanceof Array) {
                    if (this[idx].length) {
                        result += idx + '=' + this[idx].join('_') + '&';
                    }
                } else {
                    if (this[idx] != '') {
                        result += idx + '=' + this[idx] + '&'
                    }
                }
            }
        }
        return result;
    };

    params.prototype.getSearchQueryArray = function() {
        var result = {};
        for (var idx in this) {
            if (this.hasOwnProperty(idx)) {
                if (this[idx] instanceof Function) {
                    continue;
                }
                if (this[idx] instanceof Array) {
                    if (this[idx].length) {
                        result[idx] = this[idx].join('_');
                    }
                } else {
                    if (this[idx] != '') {
                        result[idx] = this[idx];
                    }
                }
            }
        }
        return result;
    };

    params.prototype.getCurrentLink = function() {
        var result = '';
        if (location.href.indexOf('/find/') + 1){
            result += '/find/';
        }
        if (location.href.indexOf('/hotel/') + 1){
            result += '/hotel/';
        }
        result += this.ct + '/';
        if (this.al.length) {
            result += 'al' + this.al.join(',');
        } else if (this.re.length) {
            result += 're' + this.re;
        } else {
            result += 'co' + this.co;
        }
        result += '/details';
        result += '/' + this.df.replace(/-/g, '.') + '/' + this.nf + '/';
        result += this.rs;
        if (this.ch1 != undefined && this.ch1 !== '') {
            result += ':' + this.ch1;
            if (this.ch2 != undefined && this.ch2 !== '') {
                result += ',' + this.ch2;
            }
        }
        if (this.me != '' && this.me != undefined) {
            result += '/me' + this.me;
        }
        if (this.op.length) {
            result += '/op' + this.op.join(',');
        }
        if (this.ac.length) {
            result += '/ac' + this.ac.join(',');
        }
        if (this.alr != '' && this.alr != undefined) {
            result += '/alr' + this.alr;
        }
        if (this.apt != '' && this.apt != undefined) {
            result += '/apt' + this.apt;
        }
        if (this.apv.length) {
            result += '/apv' + this.apv.join(',');
        }
        if (location.search.match(/(\?|\&)informer(=|$)/)) {
            result += '?informer';
        }

        return result;
    };

    params.prototype.setValue = function(nick, value) {
        if (nick == 'co') {
            this.al = [];
            this.re = [];
        } else if (nick == 're') {
            this.al = [];
        }

        this[nick] = value;
    };

    params.prototype.updateValue = function(valueList, needConverted) {
        if (needConverted) {
            var convertedList = {}, key, shortKey;
            for (key in valueList) {
                shortKey = dataSource.getNickByName(key);
                convertedList[shortKey] = valueList[key];
            }
            angular.extend(this, convertedList);
        } else {
            angular.extend(this, valueList);
        }
    };

    params.prototype.setUrl = function(isIndexPage) {
        if (!isIndexPage) {
            $location.url(this.getCurrentLink());
        } else {
            if (!angular.equals($rootScope.searchParams, $rootScope.previousSearchParams)) {
                $rootScope.previousSearchParams = angular.copy($rootScope.searchParams);
                $rootScope.$broadcast('$needReloadFilters');
            }
        }
    };

    return params;
}]);