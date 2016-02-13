$(document).ready(function() {
    $(document).scroll(function () {	
        var offset = $('.ls-chooser').offset();

        var h = $('.ls-chooser').outerHeight() + offset.top;
        var y = $(document).scrollTop();	

        if (y > h) {
            $('.ls-chooser-scrolltop').fadeIn();
        } else {
            $('.ls-chooser-scrolltop').fadeOut();
        }
    });
    
    $('.ls-chooser-scrolltop').click(function() {
       $("body,html").animate({
            scrollTop: $('.ls-chooser').offset().top
        }, 800); 
    });
});