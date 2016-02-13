/**
 * Created by vasilij on 15.10.14.
 */

function showInstruction(isBookingRequest) {
    var selector = isBookingRequest != undefined ? '#instruction_request' : '#instruction';
    var instruction = $(selector);
    if (instruction.html() == '') {
        var countyIdToSend = window.countryId ? window.countryId : 'undefined';
        var queryString = 'operator_id=' + (window.operatorId ? window.operatorId : 0)  + '&country_id=' + countyIdToSend;
        if (isBookingRequest != undefined) {
            queryString += '&is_request=1';
        }

        $.getJSON("/instruction/popup?" + queryString, function(data) {
            instruction.html(data.html);
            instruction.show();
            instruction.overlay();
            $('#overlay').css('z-index', 999).unbind('click').click(function () {
                closeInstruction();
                return false;
            });
        });
    } else {
        instruction.show();
        instruction.overlay();
        $('#overlay').css('z-index', 999).unbind('click').click(function () {
            closeInstruction();
            return false;
        });
    }
}

function closeInstruction() {
    $('#instruction').hide();
    $('#instruction_request').hide();
    $('#overlay').remove();
    return false;
}

$.fn.overlay=function() {
    var el=jQuery(this);
    var overlay = $('#overlay');
    if (overlay.length == 0) {
        $('body').prepend('<div id="overlay"></div>');
    }
    overlay.click(function(){
        el.hide();
        $('#overlay').remove();
        $('#stry').hide();
    }).show('slow');
    return this;
};