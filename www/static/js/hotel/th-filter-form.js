(function ( $ ) {
    $.fn.focusOn = function(target){
        var newFocus;
        this.closest('.filter-form-field-dd').mCustomScrollbar("stop");
        if (target === 'next') {
            if (this.is(':last-child')) {
                newFocus = this.siblings().first();
            } else {
                newFocus = this.next();
            }
        } else if (target === 'prev') {
            if (this.is(':first-child')) {
                newFocus = this.siblings().last();
            } else {
                newFocus = this.prev();
            }
        } else if (this.closest('.filter-form-field').find('.filter-form-field-dd').find('.filter-form-field-dd-i').length > 0) {
            newFocus = this.closest('.filter-form-field').find('.filter-form-field-dd').find('.filter-form-field-dd-i').first();
            console.log(1);
        } else {
            newFocus = this;
        }
        newFocus.focus();
        var ot = newFocus[0].offsetTop;
        this.closest('.filter-form-field-dd').mCustomScrollbar("scrollTo", ot, {scrollInertia:100, timeout:100});
    };
}( jQuery ));

$(document).ready(function() {
    function updateScrollbar(target) {
        target.mCustomScrollbar("update");
    }

    $('.filter-form-field-dd-i').keydown(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 40) { 				//down
            $(this).focusOn('next');
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        } else if (code == 38) { 	//up
            $(this).focusOn('prev');
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        } else if (code == 13) { 	//enter

        } else if (code == 27) { 	//esc
            $(this).closest('.filter-form-field').find('.filter-form-field-inp').removeClass('active').focus();
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        } else if (code == 9) { 	//tab
            $(this).focusOn('next');
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        }
    });

    $('.filter-form-field-inp').keyup(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 40) { 				//down
            $(this).focusOn();
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        } else if (code == 27) { 	//esc
            $(this).removeClass('active loading').focus();
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        } else if (code == 13) { //enter
            if (!$(this).hasClass('suggest')) {
                var flag = $(this).hasClass('active');
                if ($(this).parents('.filter-form-field').length < 2) {
                    $('.filter-form-field-inp').removeClass('active');
                }
                if (!flag) {
                    $(this).addClass('active');
                }
            }
        }
        updateScrollbar($(this).next('.filter-form-field-dd'));
        e.stopPropagation();
    });

    $('.filter-form-field-dd-i').hover(function () {
        $(this).focus();
    });

    if ($('.filter-form-location').length > 0) {
        $('.filter-form-location').mCustomScrollbar({
            mouseWheel: {scrollAmount: 50},
            advanced: {
                updateOnContentResize: true
            }
        });
    }
    if ($('.filter-form-additional-body').length > 0) {
        $('.filter-form-additional-body').mCustomScrollbar({
            mouseWheel: {scrollAmount: 50},
            advanced: {
                updateOnContentResize: true
            }
        });
    }
    if ($('.filter-form-field-dd').not('.full-size').length > 0) {
        $('.filter-form-field-dd').not('.full-size').mCustomScrollbar({
            mouseWheel: {scrollAmount: 50},
            advanced: {
                updateOnContentResize: true
            }
        });
    }

    $('.filter-form-field-inp').click(function () {
        var e = jQuery.Event("keyup");
        e.keyCode ? e.keyCode = 13 : e.which = 13;
        $(this).trigger(e);
    });

    $('.filter-form-field-dd-btn').click(function (e) {
        var flag = $(this).closest('.filter-form-field').find('.filter-form-field-inp').hasClass('active');
        $('.filter-form-field-inp').removeClass('active');
        if (!flag) {
            $(this).closest('.filter-form-field').find('.filter-form-field-inp').addClass('active');
        }
        $(this).closest('.filter-form-field').find('.filter-form-field-inp').focusOn();
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        e.stopPropagation();
    });

    $('.filter-form-field-inp.suggest').keypress(function (e) {
        $('.filter-form-field-inp').removeClass('active loading');
        $(this).addClass('active loading');
        e.stopPropagation();
    });

    $('.filter-form-field-dd-i').not('.filter-form-field-dd-i_invalid').click(function (e) {
        var t = $(this).find('.filter-form-field-val').text();
        var field = $(this).closest('.filter-form-field');
        field.find('input.filter-form-field-inp').val(t);
        field.find('.filter-form-field-inp').removeClass('active loading failed-validation').focus();
        if (field.find('div.filter-form-field-inp.ghost').length > 0) {
            t = $(this).html();
            field.find('div.filter-form-field-inp.ghost').html(t);
        }
        if ($(this).closest('.filter-form-elem').find('.filter-form-lbl-chk').length > 0) {
            $(this).closest('.filter-form-elem').find('.filter-form-lbl-chk').prop('checked', true);
        }
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        e.stopPropagation();
    });

    $('.filter-form-field-custom-btn').click(function (e) {
        var t = $(this).prev('.filter-form-field-custom-val').val();
        $(this).closest('.filter-form-field').find('.filter-form-field-inp').val(t).removeClass('active loading');
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
    });

    $('.filter-form-field-dd-line, .dropdown').click(function (e) {
        e.stopPropagation();
    });

    $('body').keydown(function (e) {
        if (e.which == 27) {
            $('div.filter-form-field-inp').removeClass('active loading');
            e.stopPropagation();
        }
    });


    $('.filter-form-taglist-switch').click(function (e) {
        $(this).toggleClass('active').closest('.filter-form-taglist').find('.filter-form-taglist-dd').toggle();
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
    });
});