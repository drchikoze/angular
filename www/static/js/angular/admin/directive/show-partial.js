/**
 * Created by dmitriy on 18.11.2015.
 */
(function() {
    function showPartial() {

        var link = function(scope, elem, attrs) {
            var content = scope.text;
            var controls = angular.copy(scope.controls);
            if (attrs.maxLength && content.length > attrs.maxLength) {
                var firstPart = content.substr(0, attrs.maxLength);
                var fullContentContainer = elem.clone();
                fullContentContainer.addClass('hidden')
                    .html(content);
                var toggleControl = angular.element('<a></a>');
                toggleControl.text(controls.more);
                toggleControl.on('click', toggleFullText);
                elem.parent().append(fullContentContainer).append(toggleControl);
                elem.html(firstPart + '...');
                function toggleFullText() {
                    var controlText = toggleControl.text() == controls.more
                        ? controls.less
                        : controls.more;
                    toggleControl.text(controlText);
                    fullContentContainer.toggleClass('hidden');
                    elem.toggleClass('hidden');
                }
            } else {
                elem.html(content);
            }
        };
        return {
            restrict: 'A',
            link: link,
            scope: {
                text: '@',
                controls: '='
            }
        }
    }

    angular.module('request').directive('showPartial', showPartial);
})();