jQuery(document).ready(function() {
    // скроллинг страницы для пагинатора
    jQuery('.pagination-pages-a, .pagination-rows-link, .pagination-next-a, .pagination-last-a, \n\
           .pagination-prev-a, .pagination-first-a')
    .unbind()
    .live('click', function() {
        if($(this).hasClass('pagination-pages-span') || $(this).hasClass('pagination-rows-active')) {
            return false;
        }
        var pos = 0, time = 800;
        $("body,html").animate({
            scrollTop:pos
        }, time);
        return false;
    });
});