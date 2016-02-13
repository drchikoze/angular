/**
 * Created by AleX on 14.05.2015.
 */
var tabId = new Date().getTime();
var mainTab = false;
var requestCount;
var isActiveTab = true;
var oldTitle = document.title;

function isAdminPage() {
    var str = window.location.href;
    return (str.indexOf('/admin/') > 0 );
}

function isRequestsLits() {
    var str = window.location.href;
    var pattern = "/\/admin\/tourists\/requests\/?$/i";
    if( (/\/admin\/tourists\/requests\/?$/).test(str) ) {
        return true;
    } else {
        if( (/\/admin\/tourists\/requests\/?(\/index)?\?.+$/).test(str)) {
            return true;
        } else {
            return false;
        }
    }
}

function checkTabs() {
    if (isAdminPage()) {
        var tabList = localStorage.getItem('admin_tab_list');
    } else {
        var tabList = localStorage.getItem('tab_list');
    }

    var timeStamp = new Date().getTime();
    if (tabList != undefined) {
        tabList = JSON.parse(tabList);
        tabList[tabId] = timeStamp;
    } else {
        tabList = {};
        tabList[tabId] = timeStamp;
    }
    if (isAdminPage()) {
        localStorage.setItem('admin_tab_list', JSON.stringify(tabList));
    } else {
        localStorage.setItem('tab_list', JSON.stringify(tabList));
    }

    var maxId = tabId;
    var newTabList = {};
    var deletedTab = false;

    for (tab in tabList) {
        if (tab > maxId) {
            maxId = tab;
        }
        if (tabList[tab] > timeStamp - 10000) {
            newTabList[tab] = tabList[tab];
        } else {
            deletedTab = true;
        }
    }
    if (deletedTab) {
        if (isAdminPage()) {
            localStorage.setItem('admin_tab_list', JSON.stringify(newTabList));
        } else {
            localStorage.setItem('tab_list', JSON.stringify(newTabList));
        }
    }
    if (maxId == tabId) {
        mainTab = true;
    } else {
        mainTab = false;
    }
}

function playNotifyMsg() {
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="/static/notify.mp3" type="audio/mpeg" /><source src="/static/notify.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="/static/notify.mp3" /></audio>';
}

function blink(oldTitle, newTitle) {
    if(document.title==oldTitle) {
        document.title=newTitle;
    } else {
        document.title=oldTitle;
    }
}

function initializeRequestsNumber() {
    var href;
    if (isAdminPage()) {
       href = "/admin/tourists/requests/requests_count";
    } else {
        href = "/operator/requests/requests_count";
    }
    jQuery.ajax({
        type: "POST",
        url: href
    }).success(function(msg){
        var data = JSON.parse(msg);
        if('undefined' == data.numberRequests) {
            if( ('Notification' in window) ) {
                Notification.requestPermission();
            }
            initializeRequestsNumber();
        } else {
            requestCount = data.numberRequests;
            if (isAdminPage()) {
                localStorage.setItem('admin_request_count', requestCount);
                localStorage.setItem('admin_request_count_timestamp', new Date().getTime());
            } else {
                localStorage.setItem('request_count', requestCount);
                localStorage.setItem('request_count_timestamp', new Date().getTime());
            }


        }

    }).error(function(msg){
        setTimeout( initializeRequestsNumber(), 3000);
    });
}

function checkNewRequests(number) {
    function isAgency() {
        var str = window.location.href;
        return (str.indexOf('/agency/') > 0 );
    }

    var href;
    if (isAdminPage()) {
        href = "/admin/tourists/requests/new_request_watchers";
    } else {
        href = isAgency() ? "/agency/requests/new_request_watchers" : "/operator/requests/new_request_watchers";
    }
    jQuery.ajax({
        type: "POST",
        url: href,
        data: { oldRequestsCount: number }
    }).success(function(msg){
        var data = JSON.parse(msg);
        if(data.requestsDiff != 0) {
            swal('Новых заявок ' + data.requestsDiff, '', "success");
            if( ('Notification' in window) ){
                Notification.requestPermission(function(permission){
                    new Notification("Оповещение",{ body:'Поступила новая заявка',icon:'icon.png',dir:'auto' });
                });

                setTimeout(function() {
                    window.alert('Новая заявка');
                    if( isRequestsLits() ) {
                        location.reload();
                    }
                },3000);
            }
            playNotifyMsg();
            var newTitle="Новая заявка";
            var focusTimer = setInterval(function() {
                blink(oldTitle, newTitle);
            }, 3000);
            document.onmousemove = function() {
                clearInterval(focusTimer);
                document.title = oldTitle;
            }
        }

        if (isAdminPage()) {
            localStorage.setItem('admin_request_count', data.newRequest);
            localStorage.setItem('admin_request_count_timestamp', new Date().getTime());
            //location.reload();
        } else {
            localStorage.setItem('request_count', data.newRequest);
            localStorage.setItem('request_count_timestamp', new Date().getTime());
        }
    }).error(function(msg){
        //alert(msg);
    });
}

function doSome() {
    if (mainTab) {
        var lastUpdateRequest;
        if (isAdminPage()) {
            requestCount = localStorage.getItem('admin_request_count');
            lastUpdateRequest = localStorage.getItem('admin_request_count_timestamp');
        } else {
            requestCount = localStorage.getItem('request_count');
            lastUpdateRequest = localStorage.getItem('request_count_timestamp');
        }

        var timeStamp = new Date().getTime();
        if (requestCount == undefined || lastUpdateRequest < timeStamp - 1000 * 60 * 60) {
            initializeRequestsNumber();
        } else {
            checkNewRequests(requestCount);
        }
    }
}
jQuery(document).ready(function () {
    console.log(localStorage);

    window.onblur = function () {
        isActiveTab = false;
    };
    window.onfocus = function () {
        isActiveTab = true;
    };

    setInterval(checkTabs, 1000);
    setInterval(doSome, 20000);

});