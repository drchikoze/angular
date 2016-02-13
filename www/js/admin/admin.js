$(function() {
    // Размер содержимого страницы
    $('#content-full-size').click(function (e) {
        var content = $('#page-content');
        if (content.hasClass('container')) {
            content.removeClass('container').addClass('container-fluid');
        } else {
            content.removeClass('container-fluid').addClass('container');
        }
    });

    // Режим редактирования в таблице
    $('.edit-start-btn').click(function (e) {
        $(this).hide();
        var tr = $(this).closest('tr');
        tr.find('select').show();
        tr.find('.current-value').hide();
        tr.find('.edit-cancel-btn').show();
    });
    $('.edit-cancel-btn').click(function (e) {
        $(this).hide();
        var tr = $(this).closest('tr');
        tr.find('select').hide();
        tr.find('.current-value').show();
        tr.find('.edit-start-btn').show();
    });

    // Изменение полей в таблице
    $('[data-change-url]').change(function () {
        var $this = $(this);
        var url = $this.data('change-url');
        var name = $this.data('change-name');
        if (!url || !name) {
            return;
        }

        var data = {};
        data[name] = $this.val();

        $this.prop('disabled', true);

        $.post(url, data)
            .done(function (response) {
                if (response.success) {
                    // Если есть статичное значение которое нужно заменить
                    var current = $this.closest('td').find('.current-value');
                    if (current.length > 0) {
                        current.text($this.find(':checked').text());
                    }
                } else {
                    var message = 'Произошла ошибка';
                    if (response.message) {
                        message = response.message;
                    }
                    if (response.errors) {
                        $.each(response.errors, function (key, value) {
                            if ($.isArray(value)) {
                                message += '\n' + value.join('\n');
                            } else if (typeof value == 'string') {
                                message += '\n' + value;
                            }
                        });
                    }
                    alert(message);
                }
            })
            .fail(function (response) {
                alert('Произошла ошибка');
            })
            .always(function () {
                $this.prop('disabled', false);
            });
    });
});