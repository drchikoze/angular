$(document).ready(function(){
	$('.pp-follow-chk').click(function(){
		if (this.checked == true) {
			$(this).parent().addClass('pp-follow-label-act');
		} else {
			$(this).parent().removeClass('pp-follow-label-act');
		}
		return true;
	});

    $('#favorites-notify').change(function () {
        if ($(this).prop('checked')) {
            $('.pp-favorites-details').slideDown();
            $('.pp-favorites-submit').fadeOut();
        } else {
            $('.pp-favorites-details').slideUp();
            $('.pp-favorites-submit').fadeIn();
        }
    });
});