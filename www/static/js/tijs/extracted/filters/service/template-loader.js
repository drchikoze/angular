/**
 * Для того, чтобы фильтры корректно реагировали на изменение датасорса и можно было передавать source="service.<filter>"
 * в качестве параметра фильтров данные должны быть заведомо проинициализированы.
 * Тогда в фильтрах можно будет устанавливать вотчера на датасорс
 */
angular.module('filters').service('templateLoader',
    ['$http', '$templateCache', '$compile',
        function($http, $templateCache, $compile)
        {

            var getTemplate = function(tmpl, $element) {

                if (!tmpl) {
                    tmpl = 'default/' + $element.prop("tagName").toLowerCase()
                }

                var templateLoader,
                    baseUrl = '/tmpl/filters/';

                var templateUrl = baseUrl + tmpl + '.html';

                if (typeof revisions != 'undefined' && revisions instanceof Object && revisions[templateUrl]){
                    templateUrl = templateUrl.replace(/(\.html)$/, '-version-' +  revisions[templateUrl] + '.html')
                }

                templateLoader = $http.get(templateUrl, {cache: $templateCache});

                return templateLoader;

            };

            this.loader = function($scope, $element, $attrs) {
                return getTemplate($attrs['templ'], $element).success(function(html) {

                    $element.html(html);

                    $compile($element.contents())($scope);
                })
            }
        }]);