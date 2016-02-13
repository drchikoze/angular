$(document).ready(function(){
    if (window.innerWidth < 800) {
        $('.hot-tour-slider').remove();
        return;
    }
        var hiddenHotToursId;
        if((hiddenHotToursId = localStorage.getItem('hiddenHotToursId')) !== null) {
            hiddenHotToursId = JSON.parse(hiddenHotToursId);
            for(var key in hiddenHotToursId) {
                if(!hiddenHotToursId[key]) continue;
                var d = new Date();
                if(d < new Date(hiddenHotToursId[key].d)) {
                    $('.hot-tour-slider ul li[data-hot-id="' + hiddenHotToursId[key].id+'"]').remove();
                } else {
                    delete hiddenHotToursId[key];
                }
            }
            localStorage.setItem('hiddenHotToursId', JSON.stringify(hiddenHotToursId));
        }
        if($('.hot-tour-slider ul li').length < 1) {
            $('.hot-tour-slider').remove();
        } else {
            $('.hot-tour-slider').show();
            if(window.location.href.indexOf('/hotel/') > 0) {
                $('.hot-tour-slider, .hot-tour-slider ul, .hot-tour-slider ul li').width($('.inner-field2').width());
            } else {
                $('.hot-tour-slider, .hot-tour-slider ul, .hot-tour-slider ul li').width($('.center-col').width());
            }
            var circular = true;
            var circular = true,
                btnNext = ".arrow_right",
                btnPrev = ".arrow_left",
                btnGo = ['.hot_btn0', '.hot_btn1', '.hot_btn2', '.hot_btn3', '.hot_btn4'];
            if($('.hot-tour-slider ul li').length == 1) {
                circular = false;
                $(btnNext).hide();
                $(btnPrev).hide();
                $(btnGo[0]).hide();
                btnNext = null;
                btnPrev = null;
                btnGo = null;
            }
            $('.hot-tour-slider').jCarouselLite({
                visible: 1,
                speed: 400,
                hoverPause: true,
                auto: 5000,
                btnNext: btnNext,
                btnPrev: btnPrev,
                circular: circular,
                btnGo: btnGo,
                afterEnd:
                    function(a, to, btnGo) {
                        if(btnGo.length <= to){to = 0;}
                        $('.hot_btn_cur').removeClass('hot_btn_cur');
                        $(btnGo[to]).addClass('hot_btn_cur');
                    }
            });
        }

        $('body').on('click', '.hot-offer-close', function() {
            var currSlide = getCurrentCarouselItem(), id, hiddenHotToursId, d;
            id = $(currSlide).data('hot-id');
            console.info(currSlide);
            hiddenHotToursId = localStorage.getItem('hiddenHotToursId') !== null ? JSON.parse(localStorage.getItem('hiddenHotToursId')) : [];
            d = new Date();
            d.setDate(d.getDate()+14);
            hiddenHotToursId.push({'id':id,'d':d});
            localStorage.setItem('hiddenHotToursId', JSON.stringify(hiddenHotToursId));

            $('.hot-tour-slider ul li[data-hot-id="' + id+'"]').remove();
            if($('.hot-tour-slider ul li').size() < 1) {
                $('.hot-tour-slider').remove();
            } else {
                var clone = $('.hot-tour-slider ul').clone();
                $('.hot-tour-slider ul').remove();
                $('.hot-tour-slider').append(clone);
                var circular = true,
                    btnNext = ".arrow_right",
                    btnPrev = ".arrow_left",
                    btnGo = ['.hot_btn0', '.hot_btn1', '.hot_btn2', '.hot_btn3', '.hot_btn4'];
                if($('.hot-tour-slider ul li').length == 1) {
                    circular = false;
                    btnNext = null;
                    btnPrev = null;
                    btnGo = null;
                }
                $('.hot-tour-slider').jCarouselLite({
                    visible: 1,
                    speed: 400,
                    hoverPause: true,
                    auto: 5000,
                    btnNext: btnNext,
                    btnPrev: btnPrev,
                    circular: circular,
                    btnGo: btnGo,
                    afterEnd:
                        function(a, to, btnGo) {
                            if(btnGo.length <= to){to = 0;}
                            $('.hot_btn_cur').removeClass('hot_btn_cur');
                            $(btnGo[to]).addClass('hot_btn_cur');
                        }
                });
            }
        });

        function getCurrentCarouselItem(){
            var currSlide;
            $(".hot-tour-slider ul li").each(function(){
                if ($(this).offset().left >= 0){
                    currSlide = this;
                    return false;
                }
            });
            return currSlide;
        }

        var specOverSec = 0, specOverInterval;
        $('.hot-tour-slider').on('hover',function(){
            if(specOverSec == 0) {
                specOverInterval = setInterval(function(){
                    specOverSec++;
                }, 1000);
            }
        });
        $('.hot-tour-slider').on('mouseleave',function(){
            if(specOverSec >= 2) {
                if(typeof ga !== 'undefined') {
                    ga('send', 'event', 'HotOffers', 'HotOffers: Focus more than 2 seconds', 'HotOffers: Focus more than 2 seconds');
                }
                if(typeof window.yaCounter27158126 !== 'undefined') {
                    window.yaCounter27158126.reachGoal('SPEC_FOCUS');
                }
            }
            specOverSec = 0;
            clearInterval(specOverInterval);
        });
        $('.hot-tour-slider .banner_btn').on('click',function(){
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'HotOffers', 'HotOffers: click book btn', 'HotOffers: click book btn');
            }
            if(typeof window.yaCounter27158126 !== 'undefined') {
                window.yaCounter27158126.reachGoal('SPEC_CLICK');
            }
        });
        $('.hot-tour-slider .link-hot').on('click',function(){
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'HotOffers', 'HotOffers: click on hotel', 'HotOffers: click on hotel');
            }
            if(typeof window.yaCounter27158126 !== 'undefined') {
                window.yaCounter27158126.reachGoal('SPEC_HOTEL_CLICK');
            }
        });
});