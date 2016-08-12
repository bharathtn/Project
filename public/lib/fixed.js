var leftInit = $(".scroll_fixed").offset().left;
var top = $('.scroll_fixed').offset().top - parseFloat($('.scroll_fixed').css('margin-top').replace(/auto/, 0));

$(window).scroll(function (event) {
    var x = 0 - $(this).scrollLeft();
    var y = $(this).scrollTop();

    // whether that's below the form
    if (y >= top) {
        // if so, ad the fixed class
        $('.scroll_fixed').addClass('fixed');
    } else {
        // otherwise remove it
        $('.scroll_fixed').removeClass('fixed');
    }

    $(".scroll_fixed").offset({
        left: x + leftInit
    });

});
