function openSubmit(isRequest) {
    // selector #agreement001
    var selector = isRequest ? '#agreement-request' : '#agreement001';
    var agreementContainer = $(selector);
    agreementContainer.show();

    arrageOverlayContent(agreementContainer);
    var agreementButton = $('#main_agreement' + (isRequest ? '_request' : ''));
    var countdownIterval;
    var countDown = 3;

    agreementButton.prop('disabled', true);
    agreementButton.text("Согласен (" + countDown + " сек.)");
    agreementButton.css('color', 'grey');

    countdownIterval = setInterval(function () {
        --countDown;
        agreementButton.text("Согласен (" + countDown + " сек.)");
        if(countDown == 0) {
            agreementButton.css('color', '#000');
            agreementButton.text("Согласен");
            agreementButton.prop('disabled', false);
            clearInterval(countdownIterval);
        }
    }, 1000);

    agreementContainer.overlay();
    jQuery.scrollTo(selector);
    //agreement001.centering(1, 1);
    $('#overlay').css('z-index', 999).unbind('click').click(function() {
        closeSubmit(selector);
        return false;
    });
}
function arrageOverlayContent(elem) {
    var leftOffset = ($('body').width() / 2) - (elem.outerWidth() / 2);
    var topOffset = ($(window).height() / 2) - (elem.outerHeight() / 2);
    var maxHeight = $(window).height();

    elem.css({
        left: leftOffset > 0 ? leftOffset : 0,
        top: topOffset > 0 ? topOffset : 0,
        maxHeight: maxHeight
    });
    /*
    elem.find('.agreement-content').css({
        height: maxHeight - 50,
        overflow: 'scroll'
    });
    */
}
function closeSubmit(selector) {
    $(selector).hide();
    $('#overlay').remove();
}
function imsubmitting(isRequest) {
    var checkboxSelector = isRequest ? '#agree-request' : '#agree';
    var selector = isRequest ? '#agreement-request' : '#agreement001';
    if (jQuery(checkboxSelector).length > 0) {
        jQuery(checkboxSelector).attr("checked", "checked");
    }
    closeSubmit(selector);
}

function hideModal() {
	$('.modal').hide();
}
$.fn.centering=function() {
	this.css("position","fixed");
	this.css("top", ( $(window).height() - this.height() ) / 2 + "px");
	this.css("left", ( $(window).width() - this.width() ) / 2 + "px");
	return this;
}
$.fn.overlay_white=function() {
	var el=$(this);
	$('body').prepend('<div id="overlay_white"></div>');
	$('#overlay_white').click(function(){
		el.hide();
		$('#overlay_white').remove();
	});
	$('#overlay_white').show('slow');
	return this;
}
$(document).ready(function(){
	//$('.ls-form-pp-btn').click(function(e){
	//	$(this).closest('.ls-form-select').toggleClass('active').closest('.ls-form-cell-pp-holder').find('.ls-form-select-pp').slideToggle(200);
	//	e.preventDefault();
	//});
	//$('.ls-form-list-i-a').click(function(e){
	//	var v = $(this).text();
	//	$(this).closest('.ls-form-select-pp').slideUp(200).closest('.ls-form-cell-pp-holder').find('.ls-form-inp-field').val(v);
	//	e.preventDefault();
	//});
	//$('.ls-form-select-bot-btn').click(function(e){
	//	$(this).closest('.ls-form-select-pp').slideUp(200);
	//	e.preventDefault();
	//});

	$('body').on('click', '.modal-trigger', function(e) {
		var t = $(this).data('target');
		$('.overlay').toggle();
		$('.modal_' + t).toggle();
        jQuery.scrollTo('.modal_' + t);
        e.preventDefault();
	}).on('click', '.modal-close', function(e){
        var requestTimerOpen = getcookie('requestTimerOpen');
        if (requestTimerOpen) {
            var nextDay = new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            document.cookie = "requestTimerClosed=" + 'true;' + 'path=/;' + 'expires=' + nextDay.toUTCString() ;
        }
//		$(this).closest('.modal').hide();
        $('.modal').hide();
        $(this).closest('.embedded').prev('.content-toggle').click();
		$('.overlay').hide();
        $('.page-wrap').foggy(false);
        if (window.openFormByTimer) {
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'TextRequestByTimer', 'TextRequestByTimerClose', 'TextRequestByTimerClose');
            }
        }
		e.preventDefault;
	});
	$('.overlay').click(function(e){
		hideModal();
        $('.overlay').hide();
        $('.page-wrap').foggy(false);
        if (window.openFormByTimer) {
            if(typeof ga !== 'undefined') {
                ga('send', 'event', 'TextRequestByTimer', 'TextRequestByTimerClose', 'TextRequestByTimerClose');
            }
        }
        e.preventDefault();
	});

    $(document).on('click', '.modal-step-link.passed', function(e) {
        var currentIndex = $(this).index();
        $(this).addClass('current').siblings().removeClass('current');
        $(this).closest('.modal, .embedded').find('.modal-step').hide().eq(currentIndex).show();
        e.preventDefault;
    });

    $('.modal-step-next').click(function(e) {
        var currentIndex = $(this).closest('.modal, .embedded').find('.modal-step-link.current').index();
        $(this).closest('.modal, .embedded').find('.modal-step-link').eq(currentIndex+1).addClass('passed').click();
        e.preventDefault;
    });

    $('.modal-step-prev').click(function(e) {
        var currentIndex = $(this).closest('.modal, .embedded').find('.modal-step-link.current').index();
        $('.modal-step-link.current').removeClass('current');
        $(this).closest('.modal, .embedded').find('.modal-step-link').eq(currentIndex-1).addClass('current').click();
        if ($('.m-booking-content-notice:visible').size()) {
            var scrollTo = $('.m-booking-content-notice:visible').position().top;
            $('body, html').scrollTop(scrollTo + 150);
        }
        e.preventDefault;
    });
});