$(document).ready(function(){
	if ($('.tbjc-d').length) {
		$('.tbjc-d').jCarouselLite({
		visible: 1,
		speed: 500,
		btnNext: '.tbjc-next',
		btnPrev: '.tbjc-prev'
		});
	}
	$('.tbjc-next, .tbjc-prev').click(function(){
		$('.tbjc-d-li-act').removeClass('tbjc-d-li-act');
		$('.tbjc-d-hidden').hide();
		return false;
	});

    if ($('.tbjc-side-d').length) {
        $('.tbjc-side-d').jCarouselLite({
            visible: 1,
            speed: 500,
            btnNext: '.tbjc-side-next',
            btnPrev: '.tbjc-side-prev'
        });
    }
    $('.tbjc-side-next, .tbjc-side-prev').click(function(){
        $('.tbjc-side-d-li-act').removeClass('tbjc-side-d-li-act');
        $('.tbjc-side-d-hidden').hide();
        return false;
    });
});