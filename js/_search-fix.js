(function($){
    // safe-guard: only run when jQuery is present
    if (typeof $ === 'undefined') return;

    // Handle search form submit: redirect to shop with query
    $(document).on('submit', '.search-model-form', function(e){
        e.preventDefault();
        var q = $('#search-input').val() || '';
        q = q.trim();
        if (q.length === 0) {
            $('.search-model').fadeOut(200);
            return;
        }
        var url = 'shop.html?search=' + encodeURIComponent(q);
        window.location.href = url;
    });

})(jQuery);
