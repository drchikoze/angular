/**
 * Created by wolfh on 07.02.2016.
 */

$(function () {
    $('.tix-tour-id').change(function () {
        var $this = $(this);
        $this.prop('disabled', true);
        $.get('/admin/settings/promo-tours/tour-info?id=' + $(this).val())
            .done(function (response) {
                $('.promo-tour-detail').html(response);
            })
            .always(function () {
                $this.prop('disabled', false);
            });
    });
});