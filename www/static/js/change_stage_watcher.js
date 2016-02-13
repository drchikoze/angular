$(document).ready(function () {
    var prevVal;
    var newValue;
    jQuery('.stage-select').focus(function() {
        prevVal = this.value;
    }).change(function() {
        newValue = this.value;
        var watcherId = jQuery(this).parent().attr('id');
        var watcherSource = jQuery(this).parent().data('source');
        var externalId = jQuery(this).parent().data('externalid');
        jQuery.ajax({
            method: "GET",
            dataType: 'json',
            url: "/admin/tourists/tour_watchers/change_stage",
            data: {
                'source': watcherSource,
                'externalId': externalId,
                'watcherId': watcherId,
                'stage': newValue
            },
            success: function (data) {
            },
            error: function (error) {
                var str = error.responseText.replace('!!!', '');
                var obj = JSON.parse(str);
                console.log(obj);
            }
        });
    });
});