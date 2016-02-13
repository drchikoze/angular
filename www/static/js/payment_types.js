(function($) {
    function normalizeTitle(s) {
        return s.replace(/(\(.+\)\.?|\.)$/gi, '');
    }

    function showPaymentTypeInfo(event) {
        event.preventDefault();

        var container = $('.payment-type-item').has(event.target);

        var description = container.find('.payment-type-description');
        var title = container.find('.payment-type-title');
        var template = $('#payment-type-info-modal');

        template.find('.modal-title').html(normalizeTitle(title.text()));
        template.find('.modal-content').html(description.html());

        template.show();
        template.overlay();
        $('#overlay').css('z-index', 999).unbind('click').click(function () {
            closePaymentTypeInfo(template);
            return false;
        });

    }

    function closePaymentTypeInfo() {
        $('#payment-type-info-modal').hide();
        $('#overlay').remove();
        return false;
    }



    $(document).ready(function() {
        $('.js-show-payment-info').click(showPaymentTypeInfo);
        $('.js-close-payment-info').click(closePaymentTypeInfo);
    });

})(jQuery);