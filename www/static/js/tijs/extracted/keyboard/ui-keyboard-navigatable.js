angular.module('keyboard').directive('uiKeyboardNavigatable', ['keyboardNavigation', '$parse', function (keyboardNavigation, $parse) {
    //console.log('uiKeyboardNavigatable')
    $(document).bind('keydown.navigation', function(event) {
        if ( ! (keyboardNavigation.active != null
                //&& (!$(document.activeElement).is('input,textarea,select') || document.activeElement.popout != null)
            && keyboardNavigation.key(event.keyCode) != null
            && keyboardNavigation.active.on(event.keyCode) != null)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var key = keyboardNavigation.key(event.keyCode);
        //console.log('key', key)
        keyboardNavigation.active.scope.$emit('navigate-' + key);
        keyboardNavigation.active.scope.$apply(function () {
            var on = keyboardNavigation.active.on(key);
            on(String.fromCharCode(event.which), event);
        });
    });

    return function (scope, element, attr) {
        var explicitElement = $parse(attr.uiKeyboardNavigatable)(scope);
        var $element = $(explicitElement || element);
        keyboardNavigation.register(scope, $parse(attr.navigateOn));

        $element.bind('focus.navigate', function (ev) {
            //console.log('push context', scope)
            keyboardNavigation.pushContext(scope);
        }).bind('blur.navigate', function () {
            //console.log('pop context', scope)
            keyboardNavigation.popContext(scope);
        });
    };

}]);