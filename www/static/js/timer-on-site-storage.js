
(function() {
    var FirstDateCookie = getcookie('firstOpenTime');
    console.log('существует' + FirstDateCookie);
    if (!FirstDateCookie) {
        localStorage.removeItem('lastOpenTime');
        var cookie_date = new Date();
        var dateString = cookie_date.getTime();
        document.cookie = "firstOpenTime=" + dateString;
        var FirstDateCookie = getcookie('firstOpenTime');
        console.log('создана' + FirstDateCookie);
    }
})();

function getcookie(a) {var b = new RegExp(a+'=([^;]){1,}');var c = b.exec(document.cookie);if(c) c = c[0].split('=');else return false;return c[1] ? c[1] : false;}