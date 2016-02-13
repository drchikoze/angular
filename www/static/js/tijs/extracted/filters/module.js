angular.module('filters', ['pasvaz.bindonce', 'keyboard', 'visual', 'sly'], ['$httpProvider', function($httpProvider) {

    var access_level = null;

    $httpProvider.interceptors.push(function() {
        return {

            'response': function(response) {
                /**
                 * Тут мы проверяем наличие локейшна в ответе.
                 * Он присутсвует только если код ответа 200
                 * Именно это нам сигнализирует о том, что редиректы надо делать глобально.
                 *
                 * Трюк с локейшном заключается в том, что иногда нам может потребоваться перезагрузить текущую страницу,
                 * но не грузить новую.
                 *
                 * Поэтому нам нужен функциональный стиль описания локейшна.
                 */
                if (response.headers('Location')) {
                    if (response.headers('Location') == '_reload_') {
                        window.location.reload(true)
                    } else {
                        window.location.href = response.headers('Location')
                    }
                }

                /**
                 * Так же есть следующая задача:
                 * Если в процессе работы у пользователя меняется вдруг уровень доступа, то нужно перезагрузить страницу.
                 *
                 * Для этого мы храним переменную access_level, которую отправляем в каждом запроса.
                 * Если в ответе значение этой переменной по сравнению с запросом меняется, то это сигнал о необходимости сделать перезагрузку страницы.
                 *
                 * Нам не особо важна очередность обновления значения (асинхронность же).
                 *
                 * Нам только важен сам факт того, что уровень доступа поменался, а значит - делаем перезагрузку страницы
                 */

                if (response.headers('AccessLevel')) {
                    var new_access_level = response.headers('AccessLevel');
                    if (access_level !== null) {

                        // Только в случае если предыдущий уровень доступа не нуль и нами получен текущий уровень доступа (и они не равны) ьутаемся
                        if (access_level != new_access_level) {
                            window.location.reload(true);
                        }
                    }

                    // во всех других случаях просто обновляем уровень доступа.
                    access_level = new_access_level;
                }

                return response;
            }
        };
    });

    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    // Используем x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    // Переопределяем дефолтный transformRequest в $http-сервисе
    $httpProvider.defaults.transformRequest = [function(data)
    {
        /**
         * рабочая лошадка; преобразует объект в x-www-form-urlencoded строку.
         * @param { Object } obj
         * @return { String }
         */
        var param = function(obj)
        {
            var query = '';
            var name, value, fullSubName, subValue, innerObj, i, subName;

            for(name in obj)
            {
                value = obj[name];

                if(value instanceof Array)
                {
                    for(i=0; i<value.length; ++i)
                    {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = { };
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value instanceof Object)
                {
                    for(subName in value)
                    {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = { };
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value !== undefined && value !== null)
                {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}]);