function hideSuggest () {
  $('.searchbar-form-pp').hide();
  $('.pop-up-ref').hide();
  $('.overlay').hide();
}

$(function() {$( '#datepicker' ).datepicker({onSelect:function(dateText, inst) {
  $('.datepicker-val').text(dateText);
  var date = $('#datepicker').datepicker('getDate');
  var daysAr = [', вс', ', пн', ', вт', ', ср', ', чт', ', пт', ', сб'];
  $('.datepicker-day').text(daysAr[ date.getDay() ]);
  $('.overlay').hide() }})
});

$(function() {$( '.datepicker-inp' ).datepicker({changeMonth: true,changeYear: true,yearRange: "-100:+20",onSelect:function(dateText, inst) {
  $('.datepicker-val').text(dateText);
  var date = $('.datepicker-inp').datepicker('getDate');
  var daysAr = [', вс', ', пн', ', вт', ', ср', ', чт', ', пт', ', сб'];
  $('.datepicker-day').text(daysAr[ date.getDay() ]);
  $('.overlay').hide() }})
});

$(document).ready(function(){

  $('.datepicker-link').click(function(e){
    $('.overlay').show();
    $(this).closest('div').find('.datepicker-inp').datepicker('show');
    $('#ui-datepicker-div').css('z-index', '110');
    e.preventDefault();
  });

  $('.ls-form-inp-field').keypress(function(e){
    var width = $(this).closest('.ls-form-cell-pp-holder').width();
    $(this).closest('.ls-form-cell-pp-holder').find('.searchbar-form-pp-res').css('width', width);

    $(this).closest('.ls-form-cell-pp-holder').find('.searchbar-form-pp').show();
    if((e.keyCode === 13)||(e.keyCode === 27)) {
      hideSuggest();
    }
    //$('.overlay').show();
  });
  $('.searchbar-form-pp-res-i a').click(function(){
    hideSuggest();
    var sugg = $(this).find('.searchbar-form-pp-res-tx').text();
    $(this).closest('.ls-form-cell-pp-holder').find('.ls-form-inp-field').val(sugg);
  });
  $('.overlay').click(function(e) {
    hideSuggest();
  })
});