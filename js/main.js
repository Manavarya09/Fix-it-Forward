/*
  Main JavaScript for Fix-It Forward store.
  Includes Cart and Wishlist logic, product details population, and UI enhancements.
*/

'use strict';

(function ($) {

    /*------------------
        Product filter
    --------------------*/
    var mixer;
    function initMixItUp() {
        if ($('.property__gallery').length > 0) {
            var containerEl = document.querySelector('.property__gallery');
            mixer = mixitup(containerEl, {
                selectors: {
                    target: '.mix'
                },
                animation: {
                    duration: 300
                }
            });

            // Handle URL category parameter for automatic filtering
            var params = new URLSearchParams(window.location.search);
            var category = params.get('category');
            if (category) {
                var filterValue = '.' + category.toLowerCase();
                mixer.filter(filterValue);
                
                // Update filter controls UI
                $('.filter__controls li').removeClass('active');
                $('.filter__controls li[data-filter="' + filterValue + '"]').addClass('active');
            }
        }
    }

    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
    });

    /*------------------
        Background Set (with hover swap support)
    --------------------*/
    function initBackgroundSet() {
        $('.set-bg').each(function () {
            var $el = $(this);
            var bg = $el.data('setbg');
            if (bg) {
                $el.css('background-image', 'url(' + bg + ')');
            }

            var hoverBg = $el.data('hoverbg');
            if (hoverBg) {
                $el.css('--hover-bg', 'url(' + hoverBg + ')');
            }
        });
    }

    // Initial run
    initBackgroundSet();

    //Search Switch
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    //Canvas Menu
    $(".canvas__open").on('click', function () {
        $(".offcanvas-menu-wrapper").addClass("active");
        $(".offcanvas-menu-overlay").addClass("active");
    });

    $(".offcanvas-menu-overlay, .offcanvas__close").on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("active");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".header__menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Accordin Active
    --------------------*/
    $('.collapse').on('shown.bs.collapse', function () {
        $(this).prev().addClass('active');
    });

    $('.collapse').on('hidden.bs.collapse', function () {
        $(this).prev().removeClass('active');
    });

    /*--------------------------
        Banner Slider
    ----------------------------*/
    $(".banner__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*--------------------------
        Product Details Slider
    ----------------------------*/
    $(".product__details__pic__slider").owlCarousel({
        loop: false,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ["<i class='arrow_carrot-left'></i>","<i class='arrow_carrot-right'></i>"],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: false,
        mouseDrag: false,
        startPosition: 'URLHash'
    }).on('changed.owl.carousel', function(event) {
        var indexNum = event.item.index + 1;
        product_thumbs(indexNum);
    });

    function product_thumbs (num) {
        var thumbs = document.querySelectorAll('.product__thumb a');
        thumbs.forEach(function (e) {
            e.classList.remove("active");
            if(e.hash && e.hash.split("-")[1] == num) {
                e.classList.add("active");
            }
        })
    }


    /*------------------
		Magnific
    --------------------*/
    $('.image-popup').magnificPopup({
        type: 'image'
    });


    $(".nice-scroll").niceScroll({
        cursorborder:"",
        cursorcolor:"#dddddd",
        boxzoom:false,
        cursorwidth: 5,
        background: 'rgba(0, 0, 0, 0.2)',
        cursorborderradius:50,
        horizrailenabled: false
    });

    /*------------------
        CountDown
    --------------------*/
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    if(mm == 12) {
        mm = '01';
        yyyy = yyyy + 1;
    } else {
        mm = parseInt(mm) + 1;
        mm = String(mm).padStart(2, '0');
    }
    var timerdate = mm + '/' + dd + '/' + yyyy;

	$("#countdown-time").countdown(timerdate, function(event) {
        $(this).html(event.strftime("<div class='countdown__item'><span>%D</span> <p>Day</p> </div>" + "<div class='countdown__item'><span>%H</span> <p>Hour</p> </div>" + "<div class='countdown__item'><span>%M</span> <p>Min</p> </div>" + "<div class='countdown__item'><span>%S</span> <p>Sec</p> </div>"));
    });

    /*-------------------
		Range Slider
	--------------------- */
	var rangeSlider = $(".price-range"),
    minamount = $("#minamount"),
    maxamount = $("#maxamount"),
    minPrice = rangeSlider.data('min'),
    maxPrice = rangeSlider.data('max');
    if (rangeSlider.length > 0) {
        rangeSlider.slider({
        range: true,
        min: minPrice,
        max: maxPrice,
        values: [minPrice, maxPrice],
        slide: function (event, ui) {
            minamount.val(CURRENCY_PREFIX + ui.values[0]);
            maxamount.val(CURRENCY_PREFIX + ui.values[1]);
            }
        });
        minamount.val(CURRENCY_PREFIX + rangeSlider.slider("values", 0));
        maxamount.val(CURRENCY_PREFIX + rangeSlider.slider("values", 1));
    }

    /*------------------
		Single Product
	--------------------*/
	$('.product__thumb .pt').on('click', function(){
		var imgurl = $(this).data('imgbigurl');
		var bigImg = $('.product__big__img').attr('src');
		if(imgurl != bigImg) {
			$('.product__big__img').attr({src: imgurl});
		}
    });
    
    /*-------------------
		Quantity change
	--------------------- */
    function initQuantityButtons() {
        $('.pro-qty').each(function () {
            var $el = $(this);
            if ($el.find('.qtybtn').length === 0) {
                $el.prepend('<span class="dec qtybtn">-</span>');
                $el.append('<span class="inc qtybtn">+</span>');
            }
        });
    }

    $(document).off('click', '.pro-qty .qtybtn').on('click', '.pro-qty .qtybtn', function () {
        var $button = $(this);
        var $input = $button.parent().find('input');
        var oldValue = parseFloat($input.val()) || 0;
        var newVal = oldValue;

        if ($button.hasClass('inc')) {
            newVal = oldValue + 1;
        } else {
            if (oldValue > 0) {
                newVal = oldValue - 1;
            } else {
                newVal = 0;
            }
        }
        $input.val(newVal);
    });
    
    /*-------------------
		Radio Btn
	--------------------- */
    $(".size__btn label").on('click', function () {
        $(".size__btn label").removeClass('active');
        $(this).addClass('active');
    });

    /*-------------------
		Cart & Wishlist Logic
	--------------------- */
    var CURRENCY = 'AED';
    var CURRENCY_PREFIX = CURRENCY + ' ';

    function formatCurrency(value) {
        return CURRENCY_PREFIX + (parseFloat(value) || 0).toFixed(1);
    }

    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    var apiUser = null;

    // Simple toast popup
    function showToast(message, opts){
        opts = opts || {};
        var el = document.createElement('div');
        el.className = 'fif-toast';
        el.textContent = message;
        el.style.cssText = 'position:fixed;right:20px;top:20px;background:#fff;border-radius:8px;padding:10px 14px;box-shadow:0 6px 18px rgba(0,0,0,0.12);z-index:99999;font-family:Inter,Segoe UI,Arial,sans-serif';
        document.body.appendChild(el);
        setTimeout(function(){ el.style.opacity = '0'; el.style.transform='translateY(-10px)'; }, (opts.duration||2000));
        setTimeout(function(){ try{ el.remove(); } catch(e){} }, (opts.duration||2000)+400);
    }

    // PRODUCT_DATA is now loaded from products.js (global)
    
    function loadProductData(callback) {
        // PRODUCT_DATA is already global from products.js
        if (callback) callback();
    }

    function updateCounts() {
        var cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        var wishlistCount = wishlist.length;
        $('.icon_bag_alt').siblings('.tip').text(cartCount);
        $('.icon_heart_alt').siblings('.tip').text(wishlistCount);
    }

    function renderAuthUI(user) {
        var label = user && user.name ? ('Hi, ' + user.name.split(' ')[0]) : 'My Account';
        $('.header__right__auth, .offcanvas__auth').each(function(){
            if (user) {
                $(this).html('<a href="./account.html" class="account-link">' + label + '</a> <a href="#" class="logout-link">Logout</a>');
            } else {
                $(this).html('<a href="./login.html">Login</a> <a href="./login.html?action=register">Register</a>');
            }
        });

        // Side account menus on account/orders pages.
        $('.cart__total__procced a').each(function(){
            var txt = ($(this).text() || '').trim().toLowerCase();
            if (txt === 'logout') {
                if (user) {
                    $(this).attr('href', '#').addClass('logout-link');
                } else {
                    $(this).attr('href', './login.html').removeClass('logout-link');
                }
            }
        });
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCounts();
        if ($('.shop-cart').length > 0 && !$('.wishlist-page').length) renderCartPage();
        // If user is logged in via API, persist cart server-side
        if (apiUser) {
                fetch('/api/cart', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cart })
                }).then(r=>{
                    if (!r.ok) {
                        try { showToast('Could not sync cart to server'); } catch(e){}
                    }
                }).catch(()=>{ try { showToast('Could not sync cart to server'); } catch(e){} });
        }
    }
    function saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateCounts();
        if ($('.wishlist-page').length > 0) renderWishlistPage();
    }

    function addToCart(product) {
        var pid = product.product_id || product.id || product.productId || null;
        var existing = null;
        if (pid) existing = cart.find(item => item.product_id === pid);
        if (!existing) existing = cart.find(item => item.name === product.name);
        if (existing) { existing.quantity += product.quantity || 1; } 
        else { cart.push({ product_id: pid, name: product.name, price: parseFloat(product.price), image: product.image, quantity: product.quantity || 1 }); }
        saveCart();
        // cute popup
        try { showToast((product.name||'Item') + ' added to cart! ❤️'); } catch(e){}
    }

    function addToWishlist(product) {
        if (!wishlist.find(item => item.name === product.name)) {
            wishlist.push({ name: product.name, price: parseFloat(product.price), image: product.image });
            saveWishlist();
            alert(product.name + ' added to wishlist!');
        } else {
            alert(product.name + ' is already in your wishlist.');
        }
    }

    function removeFromWishlist(productName) {
        wishlist = wishlist.filter(item => item.name !== productName);
        saveWishlist();
    }

    function updateCartTotals() {
        var subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        $('.cart-subtotal').text(formatCurrency(subtotal));
        $('.cart-total').text(formatCurrency(subtotal));
    }

    function renderCartPage() {
        var $tbody = $('.shop__cart__table tbody');
        if (!$tbody.length) return;

        $tbody.empty();
        if (cart.length === 0) {
            $tbody.append('<tr class="cart-empty-row"><td colspan="5" class="text-center">Your cart is empty.</td></tr>');
            updateCartTotals();
            return;
        }

        cart.forEach(function(item) {
            var total = item.price * item.quantity;
            var row =
                '<tr data-product-name="' + item.name.replace(/"/g, '&quot;') + '">' +
                    '<td class="cart__product__item">' +
                        '<img src="' + item.image + '" alt="">' +
                        '<div class="cart__product__item__title"><h6>' + item.name + '</h6></div>' +
                    '</td>' +
                    '<td class="cart__price">' + formatCurrency(item.price) + '</td>' +
                    '<td class="cart__quantity"><div class="pro-qty"><input type="text" class="cart-qty-input" value="' + item.quantity + '"></div></td>' +
                    '<td class="cart__total">' + formatCurrency(total) + '</td>' +
                    '<td class="cart__close"><span class="icon_close cart-remove" data-name="' + item.name + '"></span></td>' +
                '</tr>';
            $tbody.append(row);
        });

        initQuantityButtons();
        updateCartTotals();
    }

    function removeFromCart(productName) {
        cart = cart.filter(item => item.name !== productName);
        saveCart();
    }

    function initShopPage() {
        var params = new URLSearchParams(window.location.search);
        var category = params.get('category');
        if (category) {
            $('.categories__accordion .card-heading').removeClass('active');
            $('.categories__accordion .collapse').removeClass('show');
            
            var $target = $('.categories__accordion a').filter(function() {
                return $(this).text().toLowerCase().trim() === category.toLowerCase();
            });
            
            if ($target.length) {
                $target.closest('.card-heading').addClass('active');
                $target.closest('.card').find('.collapse').addClass('show');
            }
        }
    }

    function renderWishlistPage() {
        var $tbody = $('.wishlist__table tbody');
        if (!$tbody.length) return;
        $tbody.empty();
        if (wishlist.length === 0) {
            $tbody.append('<tr><td colspan="4" class="text-center">Your wishlist is empty.</td></tr>');
        } else {
            wishlist.forEach(item => {
                var tr = `
                    <tr>
                        <td class="cart__product__item">
                            <img src="${item.image}" alt="" style="max-width: 90px;">
                            <div class="cart__product__item__title"><h6>${item.name}</h6></div>
                        </td>
                        <td class="cart__price">${formatCurrency(item.price)}</td>
                        <td class="cart__total"><a href="#" class="site-btn add-to-cart-from-wishlist" data-name="${item.name}">Add to Cart</a></td>
                        <td class="cart__close"><span class="icon_close" data-name="${item.name}"></span></td>
                    </tr>`;
                $tbody.append(tr);
            });
        }
        
        $('.add-to-cart-from-wishlist').on('click', function(e) {
            e.preventDefault();
            var name = $(this).data('name');
            var item = wishlist.find(i => i.name === name);
            if (item) {
                addToCart({ name: item.name, price: item.price, image: item.image, quantity: 1 });
                alert(item.name + ' added to cart!');
            }
        });

        $('.wishlist__table .icon_close').on('click', function() {
            removeFromWishlist($(this).data('name'));
        });
    }

    function initAppUI() {
        loadProductData(function() {
            initQuantityButtons();
            initBackgroundSet();
            initMixItUp();
            if ($('.product-details').length) {
                var params = new URLSearchParams(window.location.search);
                var id = params.get('id') || 'shop-1';
                var p = PRODUCT_DATA[id];
                
                // Scalability: If product not found in JSON, generate a generic one based on context
                if (!p) {
                    p = {
                        name: "Product " + id,
                        brand: "FNOVO",
                        price: 59.0,
                        description: "A stylish addition to your wardrobe. Perfect for all seasons.",
                        images: [
                            "img/product/product-1.jpg",
                            "img/product/product-2.jpg",
                            "img/product/product-3.jpg",
                            "img/product/product-4.jpg"
                        ]
                    };
                }

                window.currentProduct = p;
                $('.breadcrumb__links span').text(p.name);
                $('.product__details__text h3').html(p.name + ' <span>Brand: ' + p.brand + '</span>');
                $('.product__details__price').text(formatCurrency(p.price));
                $('.product__details__tab #tabs-1').html('<h6>Description</h6><p>' + p.description + '</p>');
                
                // Update images if we have them
                if (p.images && p.images.length > 0) {
                    var $thumbContainer = $('.product__details__pic .product__thumb');
                    var $carousel = $('.product__details__pic__slider.owl-carousel');
                    if ($thumbContainer.length && $carousel.length) {
                        $thumbContainer.empty();
                        $carousel.empty();
                        p.images.forEach(function(src, index) {
                            var hash = 'product-' + (index + 1);
                            $thumbContainer.append('<a class="pt' + (index === 0 ? ' active' : '') + '" href="#' + hash + '"><img src="' + src + '" alt=""></a>');
                            $carousel.append('<img data-hash="' + hash + '" class="product__big__img" src="' + src + '" alt="">');
                        });
                        
                        // Re-init carousel
                        if ($carousel.hasClass('owl-loaded')) { $carousel.trigger('destroy.owl.carousel'); }
                        $carousel.owlCarousel({
                            loop: false, margin: 0, items: 1, dots: false, nav: true,
                            navText: ['<i class="arrow_carrot-left"></i>', '<i class="arrow_carrot-right"></i>'],
                            smartSpeed: 1200, autoHeight: false, autoplay: false, mouseDrag: false, startPosition: 'URLHash'
                        }).on('changed.owl.carousel', function(event) {
                            product_thumbs(event.item.index + 1);
                        });
                    }
                }
            }
            if ($('.shop-cart').length > 0 && !$('.wishlist-page').length) {
                renderCartPage();
            }
            if ($('.wishlist-page').length > 0) renderWishlistPage();
            initShopPage();
            updateCounts();
        });
        // check API auth state and sync cart if logged in
        fetch('/api/me', { credentials: 'include' }).then(r=>r.json()).then(d=>{
            if (d && d.user) {
                apiUser = d.user;
                renderAuthUI(apiUser);
                // try to load server cart
                fetch('/api/cart', { credentials: 'include' }).then(r=>r.json()).then(cdata=>{
                    if (cdata && Array.isArray(cdata.items)) {
                        cart = cdata.items;
                        saveCart();
                    }
                }).catch(()=>{});
            } else {
                apiUser = null;
                renderAuthUI(null);
            }
        }).catch(function(){
            apiUser = null;
            renderAuthUI(null);
        });
    }

    window.initAppUI = initAppUI;
    // Call immediately to avoid flash of hardcoded content
    initAppUI();

    // Click Handlers

    // Handle product card clicks (navigate to details)
    $(document).on('click', '.product__item, .trend__item', function(e) {
        // Don't trigger if we clicked a button inside the hover menu
        if ($(e.target).closest('.product__hover').length) {
            return;
        }
        
        var productId = $(this).data('product-id');
        
        // If it's a link inside the card (like the title), let it handle itself if it's already correct,
        // but if it's the card body/image, navigate.
        if (productId && !$(e.target).is('a')) {
            window.location.href = 'product-details.html?id=' + productId;
        }
    });

    $(document).on('click', '.product__hover li a:has(.icon_bag_alt)', function(e) {
        e.preventDefault();
        var $item = $(this).closest('.product__item');
        var name = $item.find('.product__item__text h6 a').text();
        var price = parseFloat($item.find('.product__price').clone().children().remove().end().text().replace(/[^0-9\.]/g, '').trim()) || 0;
        var img = $item.find('.product__item__pic').css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(window.location.origin + '/', '');
        var pid = $item.data('product-id') || $item.attr('data-product-id');
        if (!pid) { addToCart({ name: name, price: price, image: img, quantity: 1 }); return; }
        // fetch product to check inventory before adding
        fetch('/api/products/' + encodeURIComponent(pid)).then(r=>{
            if (!r.ok) throw new Error('not found');
            return r.json();
        }).then(function(prod){
            var inv = Number(prod.inventory);
            if (!Number.isFinite(inv)) inv = 999;
            if (inv <= 0) {
                try { showToast('Sorry — this item is out of stock.'); } catch(e){ alert('Out of stock'); }
                return;
            }
            addToCart({ product_id: pid, name: name, price: price, image: img, quantity: 1 });
        }).catch(function(){
            // fallback: add to cart optimistically
            addToCart({ product_id: pid, name: name, price: price, image: img, quantity: 1 });
        });
    });

    $(document).on('click', '.product__hover li a:has(.icon_heart_alt)', function(e) {
        e.preventDefault();
        var $item = $(this).closest('.product__item');
        var name = $item.find('.product__item__text h6 a').text();
        var price = parseFloat($item.find('.product__price').clone().children().remove().end().text().replace(/[^0-9\.]/g, '').trim()) || 0;
        var img = $item.find('.product__item__pic').css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(window.location.origin + '/', '');
        addToWishlist({ name: name, price: price, image: img });
    });

    // Cart page interactions
    $(document).on('click', '.cart-remove', function(e) {
        e.preventDefault();
        removeFromCart($(this).data('name'));
    });

    $(document).on('change', '.cart-qty-input', function () {
        var $row = $(this).closest('tr');
        var name = $row.data('product-name');
        var quantity = parseInt($(this).val(), 10) || 0;
        var item = cart.find(i => i.name === name);
        if (!item) return;
        if (quantity <= 0) {
            removeFromCart(name);
            return;
        }
        item.quantity = quantity;
        saveCart();
    });

    $(document).on('click', '.update-cart', function(e) {
        e.preventDefault();
        renderCartPage();
    });

    $(document).on('click', '.continue-shopping', function(e) {
        e.preventDefault();
        window.location.href = 'shop.html';
    });

    $(document).on('click', '.product__details__button .cart-btn', function(e) {
        if (window.__pdCartHandlerActive) return;
        e.preventDefault();
        var qty = parseInt($('.product__details__button .pro-qty input').val(), 10) || 1;
        if (!window.currentProduct) return;
        var inv = Number(window.currentProduct.inventory);
        if (!Number.isFinite(inv)) inv = 999;
        if (inv <= 0) { try { showToast('Sorry — this item is out of stock.'); } catch(e){ alert('Out of stock'); } return; }
        if (qty > inv) { try { showToast('Only ' + inv + ' left in stock.'); } catch(e){ alert('Not enough stock'); } return; }
        addToCart({
            name: window.currentProduct.name,
            price: window.currentProduct.price,
            image: (window.currentProduct.images && window.currentProduct.images[0]) || '',
            quantity: qty,
            product_id: window.currentProduct.id
        });
        alert(window.currentProduct.name + ' added to cart!');
    });

    /*-------------------
		Form Handlers
	--------------------- */
    $(document).on('submit', '.newsletter-form', function (e) {
        e.preventDefault();
        alert("Thank you for subscribing!");
        $(this).find('input').val('');
    });

    $(document).on('submit', '.contact-form', function (e) {
        e.preventDefault();
        alert("Your message has been sent!");
        $(this).find('input, textarea').val('');
    });

    $(document).on('click', '.logout-link', function (e) {
        e.preventDefault();
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .catch(function(){})
            .finally(function(){
                apiUser = null;
                renderAuthUI(null);
                showToast('Logged out');
                window.location.href = 'index.html';
            });
    });

    $(document).on('submit', '.discount-form', function (e) {
        e.preventDefault();
        alert("Coupon applied successfully!");
        $(this).find('input').val('');
    });

})(jQuery);
