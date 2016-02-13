/**
 * Created by Сергей on 25.01.2016.
 */

function validate_input_field(inp, type) {
    if (type == 'float') {
        inp.value = inp.value.replace(/[^\d,.]*/g, '')
            .replace(/([,.])[,.]+/g, '$1')
            .replace(/^[^\d]*(\d+([.,]\d{0,5})?).*$/g, '$1');
    }
}

