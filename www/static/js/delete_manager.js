$(document).ready(function () {
    jQuery('.delete-button').click(function(e) {
        e.preventDefault();
        var count = jQuery(this).parent().data('count');
        if ( count != 0 ) {
            alert('Вы не можете удалить пользователя с не закрытыми заявками.');
        } else {
            var result = confirm('Вы действительно хотите удалить пользователя?');
            if ( result == true ) {
                var userId = jQuery(this).parent().attr('id');
                jQuery.ajax({
                            method: "GET",
                            dataType: 'json',
                            url: "/admin/settings/admin_user/delete_user",
                            data: {
                                'user_id': userId,
                            },
                            success: function (data) {
                            },
                            error: function (error) {
                                var str = error.responseText.replace('!!!', '');
                                var obj = JSON.parse(str);
                                console.log(obj);
                                var user_id = obj.deleted_user_id;
                                jQuery('#'+user_id).parent().remove();
                            }
                        });
            }
        }
    });
});