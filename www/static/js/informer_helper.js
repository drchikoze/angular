/**
 * Created by wolfh on 06.11.15.
 */

(function () {
    var inFocus = false;
    var informerHeightClosed = '383px';
    var informerHeightOpened = '503px';
    var informer = document.getElementById('tourbook-informer');
    if (!informer) {
        return;
    }

    var frameWidth = 1000;
    var frameHeight = 720;
    var frameMainDivId = 'tb-qaz-frame-main-div';
    var frameDivId = 'tb-qaz-frame-div';
    var frameId = 'tb-qaz-frame';


    if (window.addEventListener) {
        window.addEventListener("message", tbListener, false);
        document.addEventListener('click', informerBlur, false);
    } else {
        window.attachEvent("onmessage", tbListener);
        document.attachEvent('onclick', informerBlur);
    }

    initFrame();

    function tbListener(e) {
        switch (e.data) {
            case 'focus':
                if (inFocus) {
                    return;
                }
                inFocus = true;
                informer.style.width = '205px';
                informer.style.height = informerHeightOpened;
                informer.style.margin = '0 0 -120px -25px';
                break;
            case 'oneAllocation':
                informerHeightClosed = '328px';
                informerHeightOpened = '448px';
                if (inFocus) {
                    informer.style.height = informerHeightOpened;
                } else {
                    informer.style.height = informerHeightClosed;
                }
                break;
            default:
                if (e.data.indexOf('popup:') == 0) {
                    openFrame(e.data.substring(6));
                }
                break;
        }
    }

    function informerBlur() {
        if (!inFocus) {
            return;
        }
        informer.contentWindow.postMessage('blur', informer.src);
        inFocus = false;
        informer.style.width = '180px';
        informer.style.height = informerHeightClosed;
        informer.style.margin = '0';
    }

    function initFrame() {
        var exists = document.getElementById(frameId);
        if (exists) {
            exists.parentNode.removeChild(exists);
        }

        var iframe = document.createElement("iframe");
        iframe.id = frameId;
        iframe.width = frameWidth + "px";
        iframe.height = frameHeight + "px";
        iframe.style.cssText = 'border: 0;';

        if (exists = document.getElementById(frameMainDivId)) {
            exists.parentNode.removeChild(exists);
        }

        var div = document.createElement("div");
        div.id = frameDivId;
        div.style.cssText = 'position:fixed; top: 50%; left: 50%; width: ' + frameWidth + 'px; height:' + frameHeight +
            'px; margin-left: -' + Math.ceil(frameWidth / 2) + 'px; margin-top: -' + Math.ceil(frameHeight / 2) +
            'px; z-index: 10000001;box-shadow: 0 0 10px; background-color: white;';
        div.appendChild(iframe);

        var closeBtn = document.createElement("div");
        closeBtn.style.cssText = 'position: absolute; top: 0px; right: 20px; width: 40px; height: 20px;' +
            'background-color: #F13D41; cursor: pointer; text-align: center; color: white; font-size: 14px; padding-top: 2px;';
        closeBtn.innerHTML = 'x';
        div.appendChild(closeBtn);

        var mainDiv = document.createElement("div");
        mainDiv.id = frameMainDivId;
        mainDiv.style.cssText = 'position:fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000000; display:none;' +
            'background-color: rgba(255,255,255,.6);';
        mainDiv.appendChild(div);
        document.getElementsByTagName('body')[0].appendChild(mainDiv);

        mainDiv.onclick = closeBtn.onclick = function (event) {
            closeFrame();
            // IE 8 fix
            event = event || window.event;
            (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
        };
    }

    function openFrame(url) {
        var frame = document.getElementById(frameId);
        if (frame.getAttribute('src') != url) {
            frame.setAttribute('src', url);
        }
        document.getElementById(frameMainDivId).style.display = 'block';
    }

    function closeFrame() {
        document.getElementById(frameMainDivId).style.display = 'none';
    }
})();