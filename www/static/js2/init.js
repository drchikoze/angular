function datePickerOnKeyDown(event) {
    var c;
    var i = event.keyCode;
//		document.title += ' ' + i; return;
    if (i >= 48 && i <= 57) c = String.fromCharCode(i);  // main keyboard
    else if (i >= 96 && i <= 105) c = String.fromCharCode(i - 48);  // numpad
    else if (i == 190 || i == 110) c = '.';  // main || numpad
    else return true;  // pass on; $ won't allow wrong chars inserted

    // Обработчик трабатывает перед добавлением символа в поле,
    // так что, например, при нажатии '0' в пустом поле будет s.length==0, selectionStart==0.
    var o = event.target;
    var s = o.value;
    var sel1 = getSelectionStart(o);
    var sel2 = getSelectionEnd(o);

    if (sel2 < s.length)
    // Если редактирование внутри строки, ну её нафиг все возможные случаи обрабатывать.
        return true;

    if (sel1 >= 10 || (c == '.' && sel1 != 1 && sel1 != 2 && sel1 != 4 && sel1 != 5) || (c != '.' && sel1 != 0 && sel1 != 1 && sel1 != 3 && sel1 != 4 && sel1 < 6))
    // Если ввод по маске, запрещаем всякие глупости.
    // Точки в позициях 1 и 5 - для сокращённого вода типа 8.9.2010.
        return false;

    if (sel1 < s.length) {
        // Шестая позиция - это первая цифра года, спец.обработка века см. далее.
        if (s.charAt(sel1) == c && sel1 != 6) {
            var sel1new = sel1 + (sel1 == 1 || sel1 == 4 ? 2 : 1);
            setSelectionRange(o, sel1new, Math.max(sel1new, sel2));
            return false;
        }
        s = o.value = s.substr(0, sel1);
        setSelectionRange(o, sel1, sel1);
    }
    // Сейчас курсор за последним символом.

    var today = new Date();
    var mm = (today.getMonth() + 1).toString();
    if (mm.length == 1)
        mm = '0' + mm;
    var yyyy = (today.getFullYear()).toString();

    if (sel1 != 1 && sel1 != 4) {
        // Анализируем первую цифру года, чтобы подсунуть век.
        if (sel1 == 6) {

            // Штука для подстановки века
            //var century = (c >= '3') ? '19' : '20';
            //o.value = s + century + c;
            o.value = s + c;
            setSelectionRange(o, 9, 9);
            return false;
        }
        return true;
    }

    if (sel1 == 1) {
        o.value = (c == '.' ? '0' + s : s + c) + '.' + mm + '.' + yyyy;
        setSelectionRange(o, 3, 10);
    } else if (sel1 == 4) {
        o.value = (c == '.' ? s.substr(0, 3) + '0' + s.substr(3, 1) : s + c) + '.' + yyyy;
        setSelectionRange(o, 6, 10);
    }
    return false;
}

function getSelectionStart(o) {
    if (o.createTextRange) {  // IE
        var r = document.selection.createRange().duplicate();
        r.moveEnd('character', o.value.length);
        if (r.text == '') return o.value.length;
        return o.value.lastIndexOf(r.text);
    } else
        return o.selectionStart;
}

// Taken from http://javascript.nwbox.com/cursor_position/
function getSelectionEnd(o) {
    if (o.createTextRange) {  // IE
        var r = document.selection.createRange().duplicate();
        r.moveStart('character', -o.value.length);
        return r.text.length;
    } else
        return o.selectionEnd;
}

function setSelectionRange(o, start, end) {
    if (o.createTextRange) {  // IE
        var r = o.createTextRange();
        r.collapse(true);
        r.moveEnd('character', end);
        r.moveStart('character', start);
        r.select();
    } else
        o.setSelectionRange(start, end);
}


