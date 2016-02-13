/**
 * Created by Arsenicum on 08.05.2015.
 */

// посылаем размеры и хэш
$(document).ready(function() {
    top.postMessage(JSON.stringify({
        width: document.body.offsetWidth,
        height: document.body.offsetHeight,
        hash: document.location.pathname + document.location.search
    }), '*');
});