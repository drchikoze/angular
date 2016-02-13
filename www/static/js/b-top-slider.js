$(document).ready(function(){
    if ($('.top-slider-jc').length) {
        var circular = true;
        if($('.top-slider-jc ul li').length == 1) {
            circular = false;
        }
        $('.top-slider-jc').jCarouselLite({
            auto: 5000,
            visible: 1,
            speed: 400,
            hoverPause: true,
            circular: circular,
            btnGo: ['.1', '.2', '.3', '.4', '.5'],
            afterEnd:
                function(a, to, btnGo) {
                    if(btnGo.length <= to){to = 0;}
                    $('.top-slider-a-act').removeClass('top-slider-a-act');
                    $(btnGo[to]).addClass('top-slider-a-act');
                }
        });
    }
});