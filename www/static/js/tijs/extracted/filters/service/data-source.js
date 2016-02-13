angular.module('filters').service('dataSource', ['$location', '$rootScope', function($location, $rootScope) {

    this.country = null;
    this.countries = null;
    this.city = null;
    this.city_to = null;
    this.allocation = [];
    this.resort  = null;
    this.room_size  = null;
    this.allocat_rate = null;
    this.tour_type = null;
    this.duration = null;
    this.dates = null;
    this.building_type = null;
    this.apart_type = null;
    this.room_apart_type = null;
    this.room_class = null;
    this.room_char = null;
    this.room_view_type = null;
    this.meal = null;
    this.online = null;
    this.operator = null;
    this.subway = null;
    this.discount = null;
    this.agency = null;
    this.to_countries = null;
    this.cr = null;

    this.ticket = null;
    this.status = null;
    this.allocation_type = null;
    this.alloc_place_type = null;
    this.alloc_place_value = null;

    this.expert = null;
    this.premium = null;
    this._trc_min_price = null;
    this._trc_work_time = null;
    this.hotels_fav = null;

    this.weekday = null;
    this.operator_online = null;
    this.is_subagent = null;
    this.apply_blacklist = null;
    this.operator_class = null;
    this.resort_place = null;
    this.params2 = null;
    this.to_arrival_city = null;
    this.weekend_days = null;
    this.trip_class = null;
    this.ticket_type = null;

    this.additional_params = null;
    this.with_actions_news = null;
    this.with_hotline = null;
    this.with_question = null;
    this.with_tours = null;
    this.with_bonusesandcompliments = null;
    this.messageType = null;

    this.spec_offer_existence = null;
    this.office_city = null;
    this.result_type = null;
    this.result_group = null;

    this.price = null;
    this.currency = null;
    this.category = null;

    this.live_search = null; //живой поиск
    this.stop = null;

    this.bonus_type = null;

    this.letter = null;
    this.fav_op = null;

    this.sort_type = null;
    this.loyalty = null;
    this.compliment_dict_agent = null;

    this.room_price_group = null;

    this.mode = null;

    this.sort_room_price = null;
    this.limit_by_country = null;
    this.seats_available_only = null;

    // Карта обратного отображения сокращенных имен фильтров на реальные
    this.reverseMap = {
        co: 'country',
        cos: 'countries',
        ct: 'city',
        ct_to: 'city_to',
        al: 'allocation',
        re: 'resort',
        ac: 'alloccat',
        rs: 'room_size',
        ch1: 'child_age1',
        ch2: 'child_age2',
        ch3: 'child_age3',
        alr: 'allocat_rate',
        tt: 'tour_type',
        df: 'datef',
        dt: 'datet',
        nf: 'nightf',
        nt: 'nightt',
        bt: 'building_type',
        typ: 'apart_type',
        rat: 'room_apart_type',
        rcl: 'room_class',
        rch: 'room_char',
        rvt: 'room_view_type',
        me: 'meal',
        online: 'online',
        op: 'operator',
        f_sw: 'subway',
        dscnt: 'discount',
        ag: 'agency',
        to_co: 'to_countries',
        cr: 'count_review',

        ti_tp:  'ticket',
        status: 'status',
        alt:    'allocation_type',
        apt:    'alloc_place_type',
        apv:    'alloc_place_value',

        exp: 'expert',
        premium: 'premium',
        _trc_min_price: '_trc_min_price',
        _trc_work_time: '_trc_work_time',
        hv_onl: 'hotels_fav',
        ahv_onl: 'ahv_onl',

        weekday: 'weekday',
        wd_st: 'weekday_st',
        wd_sn: 'weekday_sn',

        op_onl: 'operator_online',
        is_sub: 'is_subagent',
        opc: 'operator_class',
        rpl: 'resort_place',
        obl: 'blacklist',
        aobl: 'apply_blacklist',

        params2: 'params2',

        tac : 'to_arrival_city',
        wd : 'weekend_days',
        tpc: 'trip_class',
        ttp: 'ticket_type',

        wh: 'with_hotline',
        wt: 'with_tours',
        wbc: 'with_bonusesandcompliments',
        an: 'with_actions_news',
        wq: 'with_question',
        ty: 'messageType',

        spec_offer_existence: 'spec_offer_existence',
        avia_tickets: 'avia_tickets',
        spo: 'spo',
        adv_tours: 'adv_tours',
        tours_exist: 'tours_exist',
        oct: 'office_city',
        rt: 'result_type',
        gr: 'result_group',

        price: 'price',
        cur: 'currency',
        pf: 'pricef',
        pt: 'pricet',

        _p: 'page',
        _ps: 'page_size',
        cat: 'category',
        _s: 'saveStat',

        ls : 'live_search',
        st : 'stop',
        btp : 'bonus_type',
        ext_flt_use_op : 'ext_flt_use_op',

        letter: 'letter',
        bst: 'sort_type',
        loy: 'loyalty',
        cda: 'compliment_dict_agent',
        fav_op: 'fav_op',
        rpg: 'room_price_group',

        md: 'mode',
        seats_av: 'seats_available_only',

        srp:'sort_room_price',
        lbc:'limit_by_country'
    };

    /**
     * Набор сендеров, изменения которых не должны вести к перезагрузке фильтров
     * @type {{}}
     */
    this.exceptions = {
        to_countries: true,

        nights: true,
        duration: true,
        pricef: true,
        pricet: true,
        allocation: true,
        page: true,
        page_size : true,

        datef : true,
        datet : true,
        weekday : true,
        weekday_st : true,
        weekday_sn : true,
        weekend_days : true,
        dates : true,
        ticket_type : true,
        trip_class : true,

        ticket : true,
        currency : true,
        status : true,
        params2 : true,
        ext_flt_use_op: true,
        result_type: true,
        result_group: true,

        letter: true,
        sort_type: true,
        room_price_group: true,
        with_bonusesandcompliments: true
    };

    this.preventSearchReload = {
        result_type: true
    };

    //параметры пользователя, которые мы тягаем в куках
    this.savedUser = {
        ticket: {canSave : true},
        result_type: {canSave : true},
        result_group: {canSave : true},
        country: {canSave : true, pages : ['/search/result', '/search/chooser', '/tours', '/']},
        city: {canSave : true, pages : ['/search/result', '/search/chooser', '/tours', '/']}
    };

    //проверка возможности сохранения пользовательского параметра в куках
    this.canSavedUser = function ($filter, page) {
        page = (typeof page == 'string') ? page : null;

        if (this.savedUser.hasOwnProperty($filter) && this.savedUser[$filter].canSave) {
            // нет свойства pages - считаем что для всех страниц
            if (this.savedUser[$filter].pages == undefined) {
                return true;
            }

            for(var i in this.savedUser[$filter].pages) {
                if (page === this.savedUser[$filter].pages[i]) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Возвращает значение фильтра по искомым ид (пока используется только для получения страны)
     *
     * @param filter Имя фильтра
     * @param ids Перечень искомых ид в итемах фильтра
     * @returns {Array}
     */
    this.getDataFilter = function (filter, ids) {

        var items = [];

        if (this.hasOwnProperty(filter)) {

            var data = this[filter];

            if (angular.isArray(ids)) {
                var strIds = [];
                for (var i in ids) {
                    if (typeof(ids[i]) == "number") {
                        var tmp = parseInt(ids[i]);
                        if(!isNaN(tmp)) {
                            strIds.push(tmp.toString());
                        }
                    } else if(typeof(ids[i]) == "string") {
                        strIds.push(ids[i]);
                    }
                }

                for (var idx in data) {
                    if ($.inArray(data[idx].id, ids) != -1) {
                        items.push(data[idx]);
                    } else if($.inArray(data[idx].id, strIds) != -1) {
                        items.push(data[idx]);
                    }
                }
            }

            return items
        }

        throw "Unknown filter name: " + name
    };

    this.getNickByName = function(name) {

        for(var idx in this.reverseMap) {
            if (this.reverseMap[idx] == name) {
                return idx;
            }
        }

        throw "Unknown filter name: " + name
    };

    /**
     * Получение короткого имени параметра по идентификатору в сервисе.
     * Например service.allocation вернет al
     *
     * @param name
     * @returns {string}
     */
    this.getNickBySource = function(name) {

        var nick = name.split('.');
        nick = nick[1];

        for(var idx in this.reverseMap) {
            if (this.reverseMap[idx] == nick) {
                return idx;
            }
        }

        throw "Unknown filter name: " + name
    };

    /**
     * Получаем значение нужного фильтра по имени name
     *
     * Важно заметить, что name - это полное имя фильтра, не сокращенное (country, но не co)
     *
     * @param name
     */
    this.get = function(name) {
        for (var idx in this.reverseMap) {
            if (this.reverseMap[idx] == name) {
                return $rootScope.searchParams[idx]
            }
        }
        throw "Filter '" + name + "' does not exists in reversMap";
    };

    /**
     * Заглушка для последующих модификаций.
     *
     * Устанавливает значение фильтра name в value
     *
     * @param name
     * @param value
     */
    this.set = function(name, value) {

    };

    this.search = function() {
        var qs = $rootScope.searchParams;
        var search = {};

        for (var idx in qs) {
            if (this.reverseMap[idx]) {
                if (String(qs[idx]).indexOf('_') != -1)
                    search[this.reverseMap[idx]] = qs[idx].split('_');
                else
                    search[this.reverseMap[idx]] = qs[idx];
            }

        }
        return search;
    };

    this.filters_set = {};
    this.filters = function() {
        if (!arguments.length) {
            return $rootScope.searchParams;
        } else {
            return $location.search(arguments[0]);
        }
    };

    this.get = function(shortName) {
        if (this.reverseMap.hasOwnProperty(shortName)) {
            return this.reverseMap[shortName];
        }
        throw "Short name '" + name + "' does not exists in reversMap";
    }
}]);